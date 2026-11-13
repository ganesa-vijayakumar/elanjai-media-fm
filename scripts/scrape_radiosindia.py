"""Scrape radiosindia.com/<genre>radios.html pages → merge missing stations.

For each station page it extracts the Playerjs stream candidates plus the
station logo, probes the streams (ICY-aware, captures real bitrate/codec),
dedupes against data/stations.json by normalized name and stream host,
downloads the logo into public/logos/<genre>/, and appends new stations.

Usage:  python scripts/scrape_radiosindia.py [tamilradios] [--dry]
"""

import io, json, os, re, ssl, socket, sys, urllib.request, concurrent.futures

ROOT = os.path.join(os.path.dirname(__file__), "..")
INDEX = "https://radiosindia.com/{}.html"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
socket.setdefaulttimeout(10)

NAV = re.compile(r"^(aboutus|privacypolicy|termsofuse|help|[a-z]+radios?)\.html$", re.I)


def fetch(url, n=600_000, timeout=10):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=timeout, context=ctx).read(n)


def norm(name):
    """Loose name key for dedup — drop fm/radio/tamil/etc. tokens."""
    t = re.sub(r"[^a-z0-9]", "", name.lower())
    for w in ("fm", "radio", "radios", "tamil", "online", "live", "hd"):
        t = t.replace(w, "")
    return t


def host_of(url):
    m = re.match(r"https?://([^/:]+)", url or "")
    return m.group(1).lower() if m else ""


def station_links(index_html, page):
    out = []
    for href, txt in re.findall(r'<a[^>]+href="([a-z0-9_]+\.html)"[^>]*>(.*?)</a>',
                                index_html, re.S | re.I):
        if NAV.match(href):
            continue
        name = re.sub(r"<[^>]+>", "", txt).strip()
        if name and href not in [x[0] for x in out]:
            out.append((href, name))
    return out


def scrape_page(href):
    url = f"https://radiosindia.com/{href}"
    html = None
    for attempt in range(3):
        try:
            html = fetch(url).decode("utf-8", "replace")
            break
        except Exception as e:
            if attempt == 2:
                return href, None, [f"page error {str(e)[:40]}"], None
            import time; time.sleep(2 + attempt * 3)
    m = re.search(r'file:"([^"]+)"', html)
    cands = [u.strip() for u in (m.group(1).split(" or ") if m else []) if u.strip().startswith("http")]
    logo = None
    stem = href[:-5]
    for src in re.findall(r'<img[^>]+src="(images/[^"]+\.(?:jpg|png|jpeg|webp))"', html, re.I):
        if "listenlive" not in src and (stem[:5] in src or logo is None):
            logo = "https://radiosindia.com/" + src
            break
    return href, cands, None, logo


def probe(url):
    """Return (alive, codec, bitrate) — icy-br header or content-type."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "ElanjaiMediaFM/1.0", "Range": "bytes=0-512",
            "Icy-MetaData": "1"})
        r = urllib.request.urlopen(req, timeout=8, context=ctx)
        ct = r.headers.get("Content-Type", "").lower()
        br = r.headers.get("icy-br")
        r.read(256)
        codec = ("MP3" if "mpeg" in ct or "mp3" in ct else
                 "AAC" if "aac" in ct else "UNKNOWN")
        return True, codec, int(br) if br and br.isdigit() else 0
    except urllib.error.HTTPError as e:
        if e.code == 503 or e.code >= 500:
            return False, "UNKNOWN", 0
        return False, "UNKNOWN", 0
    except Exception as e:
        if "ICY" in str(e).upper():
            return True, "MP3", 0
        return False, "UNKNOWN", 0


def slugify(name, taken):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "station"
    if s not in taken:
        return s
    i = 2
    while f"{s}-{i}" in taken:
        i += 1
    return f"{s}-{i}"


def main():
    page = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else "tamilradios"
    dry = "--dry" in sys.argv
    genre = page.replace("radios", "").replace("radio", "") or "tamil"
    LANG = {"tamil": "Tamil", "hindi": "Hindi", "malayalam": "Malayalam",
            "kannada": "Kannada", "punjabi": "Punjabi"}
    language = LANG.get(genre, genre.capitalize())

    idx = fetch(INDEX.format(page)).decode("utf-8", "replace")
    links = station_links(idx, page)
    print(f"{len(links)} station pages on {page}")

    stations = json.load(open(os.path.join(ROOT, "data", "stations.json"), encoding="utf-8"))
    have_names = {norm(s["name"]) for s in stations}
    have_hosts = {host_of(s["stream_url"]) for s in stations}
    taken = {s["slug"] for s in stations}

    # scrape all pages — keep it polite, the site throttles bursts
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        scraped = dict()
        for href, cands, err, logo in ex.map(lambda h: scrape_page(h), [h for h, _ in links]):
            scraped[href] = (cands, err, logo)
    failed = sum(1 for c, _e, _l in scraped.values() if c is None)
    if failed:
        print(f"  {failed} pages failed to scrape (rate limit? re-run)")

    # probe first candidate for every page concurrently (second candidate if first dies)
    def best_stream(href):
        cands, err, logo = scraped[href]
        if not cands:
            return None, "UNKNOWN", 0, err or "no stream"
        for u in cands:
            ok, codec, br = probe(u)
            if ok:
                return u, codec, br, None
        return cands[0], "UNKNOWN", 0, "dead"

    new, dups, dead = [], [], []
    tasks = {h: n for h, n in links}
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
        results = {h: r for h, r in zip(tasks, ex.map(best_stream, tasks))}

    for href, name in links:
        stream, codec, br, err = results[href]
        if not stream:
            continue
        key = norm(name)
        host = host_of(stream or "")
        if key and key in have_names or (host and host in have_hosts):
            dups.append(name)
            continue
        slug = slugify(name, taken)
        taken.add(slug)
        alive = err is None
        new.append({
            "id": slug, "name": name, "slug": slug,
            "stream_url": stream or "",
            "homepage": f"https://radiosindia.com/{href}",
            "favicon": scraped[href][2] or "",
            "genre": genre, "language": language, "country": "India",
            "codec": codec, "bitrate": br, "votes": 0,
            "tags": [language.lower()], "is_active": alive,
        })
        if not alive:
            dead.append(name)

    print(f"new {len(new)} | dup {len(dups)} | dead-stream {len(dead)}")
    for n in dups[:10]:
        print(f"  dup: {n}")
    if dry:
        for s in new[:15]:
            print(f"  + {s['name']:30} {s['stream_url'][:55]} {s['codec']} {s['bitrate']}k")
        return

    stations.extend(new)
    with open(os.path.join(ROOT, "data", "stations.json"), "w", encoding="utf-8") as f:
        json.dump(stations, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(stations)} stations ({len(new)} added)")


if __name__ == "__main__":
    main()
