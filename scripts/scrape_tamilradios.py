"""Scrape tamilradios.com station pages → merge missing stations.

The index links to /<slug> pages whose RSC payload embeds a station object:
{"id","name","slug","url"(real stream),"bitrate","genre","image",...}.
Probes streams (ICY-aware), dedupes by name/host, appends to stations.json.

Usage:  python scripts/scrape_tamilradios.py [--dry]
"""

import io, json, os, re, ssl, socket, sys, urllib.request, concurrent.futures

ROOT = os.path.join(os.path.dirname(__file__), "..")
BASE = "https://www.tamilradios.com"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
socket.setdefaulttimeout(10)
SKIP = re.compile(r"^(add-station|contact|dmca|about|genre|search|favorites|recent|api|_next)$")


def fetch(url, n=600_000, timeout=12, tries=3):
    import time
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            return urllib.request.urlopen(req, timeout=timeout, context=ctx).read(n)
        except Exception as e:
            last = e
            time.sleep(1.5 * (i + 1))
    raise last


def norm(name):
    t = re.sub(r"[^a-z0-9]", "", name.lower())
    for w in ("fm", "radio", "radios", "tamil", "online", "live", "hd"):
        t = t.replace(w, "")
    return re.sub(r"\d+", "", t)  # drop freq numbers: "hello1064" == "hello"


def is_dup(name, have):
    k = norm(name)
    if not k:
        return False
    return k in have or any(len(k) >= 4 and len(h) >= 4 and
                            (k.startswith(h) or h.startswith(k)) for h in have)


def host_of(url):
    m = re.match(r"https?://([^/:]+)", url or "")
    return m.group(1).lower() if m else ""


DEC = json.JSONDecoder()


def station_from_page(slug):
    try:
        h = fetch(f"{BASE}/{slug}").decode("utf-8", "replace")
    except Exception as e:
        return slug, None, f"page error {str(e)[:40]}"
    u = h.replace('\\"', '"')
    for m in re.finditer(r'"station":(\s*\{)', u):
        try:
            obj, _e = DEC.raw_decode(u, m.start(1))
            if isinstance(obj, dict) and obj.get("url"):
                return slug, obj, None
        except Exception:
            continue
    return slug, None, "no station json"


def probe(url):
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "ElanjaiMediaFM/1.0", "Range": "bytes=0-512",
            "Icy-MetaData": "1"})
        r = urllib.request.urlopen(req, timeout=8, context=ctx)
        ct = r.headers.get("Content-Type", "").lower()
        r.read(256)
        codec = ("MP3" if "mpeg" in ct or "mp3" in ct else
                 "AAC" if "aac" in ct else "UNKNOWN")
        return True, codec
    except urllib.error.HTTPError:
        return False, "UNKNOWN"
    except Exception as e:
        return ("ICY" in str(e).upper()), "MP3" if "ICY" in str(e).upper() else "UNKNOWN"


def slugify(name, taken):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "station"
    if s not in taken:
        return s
    i = 2
    while f"{s}-{i}" in taken:
        i += 1
    return f"{s}-{i}"


def main():
    dry = "--dry" in sys.argv
    idx = fetch(BASE + "/").decode("utf-8", "replace")
    slugs = sorted({s for s in re.findall(r'href="/([a-z0-9-]+)"', idx)
                    if not SKIP.match(s)})
    print(f"{len(slugs)} station pages on tamilradios.com")

    stations = json.load(open(os.path.join(ROOT, "data", "stations.json"), encoding="utf-8"))
    have_names = {norm(s["name"]) for s in stations}
    have_hosts = {host_of(s["stream_url"]) for s in stations}
    taken = {s["slug"] for s in stations}

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        pages = {slug: (obj, err) for slug, obj, err in ex.map(station_from_page, slugs)}
    failed = sum(1 for s, e in pages.values() if s is None)
    if failed:
        print(f"  {failed} pages failed — re-run to retry")

    def pick(slug):
        obj, err = pages[slug]
        if not obj:
            return slug, obj, None, False, "UNKNOWN"
        url = obj["url"]
        ok, codec = probe(url)
        return slug, obj, url, ok, codec

    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
        results = {r[0]: r[1:] for r in ex.map(pick, slugs)}

    new, dups, dead = [], [], []
    for slug in slugs:
        obj, url, ok, codec = results[slug]
        if not obj or not url:
            continue
        name = re.sub(r"\s*-\s*(live|listen|online).*$", "", obj.get("name", ""), flags=re.I).strip() or obj.get("slug", slug)
        host = host_of(url)
        if is_dup(name, have_names) or (host and host in have_hosts):
            dups.append(name)
            continue
        s2 = slugify(obj.get("slug") or name, taken)
        taken.add(s2)
        tags = [t.lower() for t in re.split(r"[,/]", obj.get("genre") or "") if t.strip()] or ["tamil"]
        if "tamil" not in tags:
            tags.append("tamil")
        new.append({
            "id": s2, "name": name, "slug": s2, "stream_url": url,
            "homepage": f"{BASE}/{obj.get('slug') or slug}",
            "favicon": obj.get("image") or "",
            "genre": "tamil", "language": "Tamil", "country": "India",
            "codec": codec if codec != "UNKNOWN" else "MP3",
            "bitrate": int(obj.get("bitrate") or 0), "votes": 0,
            "tags": tags, "is_active": ok,
        })
        if not ok:
            dead.append(name)

    print(f"new {len(new)} | dup {len(dups)} | dead-stream {len(dead)}")
    for n in dups[:10]:
        print(f"  dup: {n}")
    if dry:
        for s in new[:15]:
            print(f"  + {s['name'][:36]:38} {s['stream_url'][:52]} {s['codec']} {s['bitrate']}k")
        return
    stations.extend(new)
    with open(os.path.join(ROOT, "data", "stations.json"), "w", encoding="utf-8") as f:
        json.dump(stations, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(stations)} stations ({len(new)} added)")


if __name__ == "__main__":
    main()
