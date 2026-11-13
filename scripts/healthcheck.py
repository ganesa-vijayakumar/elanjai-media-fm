"""Mark dead streams is_active=false in data/stations.json.

Usage:  python scripts/healthcheck.py
A stream is "dead" if it can't be reached at all; an ICY 200 OK response
counts as alive (Shoutcast replies with ICY instead of HTTP/1.1).
"""

import json, urllib.request, ssl, concurrent.futures, socket, os, re

PATH = os.path.join(os.path.dirname(__file__), "..", "data", "stations.json")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
socket.setdefaulttimeout(8)


def check(station):
    url = station["stream_url"]
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "ElanjaiMediaFM/1.0",
                "Range": "bytes=0-512",
                "Icy-MetaData": "1",
            },
        )
        r = urllib.request.urlopen(req, timeout=8, context=ctx)
        r.read(256)
        return station["slug"], r.status < 400, r.status
    except urllib.error.HTTPError as e:
        return station["slug"], False, f"HTTP {e.code}"
    except Exception as e:
        msg = str(e)
        # Shoutcast answers "ICY 200 OK" which isn't a valid HTTP status line —
        # urllib raises, but the stream is actually alive.
        if "ICY" in msg.upper():
            return station["slug"], True, "ICY 200 OK"
        return station["slug"], False, msg[:50]


def main():
    with open(PATH, encoding="utf-8") as f:
        data = json.load(f)

    dead = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=24) as ex:
        for slug, ok, info in ex.map(check, data):
            if not ok:
                dead.append((slug, info))

    deadset = {s for s, _ in dead}
    for s in data:
        s["is_active"] = s["slug"] not in deadset

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

    alive = sum(1 for s in data if s["is_active"])
    print(f"checked {len(data)} | alive {alive} | dead {len(dead)}")
    for slug, info in dead:
        print(f"  dead: {slug} ({info})")


if __name__ == "__main__":
    main()
