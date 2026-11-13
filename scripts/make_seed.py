"""Regenerate data/stations.json + data/genres.json from radio-browser.info.

Usage:  python scripts/make_seed.py
Fetches top stations per language from the community radio-browser API,
dedupes by stream URL, slugifies names, and writes the catalog the app bundles.
"""

import json, re, os, hashlib, urllib.request

LANGUAGES = ["tamil", "hindi", "malayalam", "telugu", "kannada", "punjabi", "urdu"]
API = "https://de1.api.radio-browser.info/json/stations/search"
UA = {"User-Agent": "elanjai-media-fm-seed/1.0"}
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def fetch(lang: str, limit: int):
    url = f"{API}?language={lang}&limit={limit}&order=votes&reverse=true&hidebroken=true"
    req = urllib.request.Request(url, headers=UA)
    return json.load(urllib.request.urlopen(req, timeout=30))


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower().strip())
    return s.strip("-")[:60] or "station"


def main() -> None:
    stations = {}
    for lang in LANGUAGES:
        limit = 80 if lang == "tamil" else 40
        try:
            data = fetch(lang, limit)
        except Exception as e:
            print(f"{lang}: fetch failed: {e}")
            continue
        for st in data:
            name = re.sub(r"\s+", " ", (st.get("name") or "").strip())
            url = st.get("url_resolved") or st.get("url") or ""
            if not name or not url.startswith("http") or len(name) > 60:
                continue
            key = url.split("?")[0].rstrip("/").lower()
            if key in stations:
                continue
            languages = [l.strip().lower() for l in (st.get("language") or "").split(",") if l.strip()]
            genre = lang if lang in LANGUAGES else (languages[0] if languages else "india")
            stations[key] = {
                "id": hashlib.sha1(key.encode()).hexdigest()[:8],
                "name": name,
                "slug": slugify(name),
                "stream_url": url,
                "homepage": st.get("homepage") or "",
                "favicon": st.get("favicon") or "",
                "genre": genre,
                "language": ", ".join(languages[:3]) or lang,
                "country": st.get("country") or "India",
                "codec": st.get("codec") or "",
                "bitrate": st.get("bitrate") or 0,
                "votes": st.get("votes") or 0,
                "tags": [t.strip() for t in (st.get("tags") or "").split(",") if t.strip()][:6],
                "is_active": True,
            }
        print(f"{lang}: cumulative {len(stations)}")

    # also pull top India stations regardless of declared language
    try:
        req = urllib.request.Request(
            f"{API}?countrycode=IN&limit=60&order=votes&reverse=true&hidebroken=true",
            headers=UA,
        )
        for st in json.load(urllib.request.urlopen(req, timeout=30)):
            name = re.sub(r"\s+", " ", (st.get("name") or "").strip())
            url = st.get("url_resolved") or st.get("url") or ""
            if not name or not url.startswith("http") or len(name) > 60:
                continue
            key = url.split("?")[0].rstrip("/").lower()
            if key in stations:
                continue
            languages = [l.strip().lower() for l in (st.get("language") or "").split(",") if l.strip()]
            genre = next((l for l in languages if l in LANGUAGES), "india")
            stations[key] = {
                "id": hashlib.sha1(key.encode()).hexdigest()[:8],
                "name": name,
                "slug": slugify(name),
                "stream_url": url,
                "homepage": st.get("homepage") or "",
                "favicon": st.get("favicon") or "",
                "genre": genre,
                "language": ", ".join(languages[:3]) or "india",
                "country": st.get("country") or "India",
                "codec": st.get("codec") or "",
                "bitrate": st.get("bitrate") or 0,
                "votes": st.get("votes") or 0,
                "tags": [t.strip() for t in (st.get("tags") or "").split(",") if t.strip()][:6],
                "is_active": True,
            }
    except Exception as e:
        print(f"india: fetch failed: {e}")

    seen = set()
    out = sorted(stations.values(), key=lambda x: (-x["votes"], x["name"]))
    for s in out:
        if s["slug"] in seen:
            s["slug"] = f"{s['slug']}-{s['id']}"
        seen.add(s["slug"])

    genres = {}
    for s in out:
        genres[s["genre"]] = genres.get(s["genre"], 0) + 1

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "stations.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    with open(os.path.join(OUT_DIR, "genres.json"), "w", encoding="utf-8") as f:
        json.dump(
            [{"slug": g, "name": g.title(), "count": c} for g, c in sorted(genres.items())],
            f, indent=1,
        )
    print(f"done: {len(out)} stations, {len(genres)} genres")


if __name__ == "__main__":
    main()
