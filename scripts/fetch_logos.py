"""Fetch/generate local station logos → public/logos/<genre>/<slug>.png.

For each active station of a genre:
  1. download the catalog favicon (the broadcaster's own brand image)
  2. if broken/empty, mine the homepage for og:image / apple-touch-icon
  3. if still nothing, generate a design-system tile (gradient + initials)
Every file is normalized to a 256×256 PNG. A manifest
data/local-logos.json maps slug → public path so the app can prefer the
local asset and keep the remote favicon as a runtime fallback.

Usage:  python scripts/fetch_logos.py [genre ...]        (default: tamil)
"""

import io, json, os, re, ssl, socket, urllib.request, concurrent.futures
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "logos")
MANIFEST = os.path.join(ROOT, "data", "local-logos.json")
SIZE = 256

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
socket.setdefaulttimeout(10)

GRADS = [((0x0F,0x51,0x38),(0x0B,0x3D,0x2E)), ((0x1E,0x4B,0x8F),(0x16,0x34,0x5C)),
         ((0xA3,0x48,0x0E),(0x7C,0x2D,0x12)), ((0x6D,0x28,0xD9),(0x4C,0x1D,0x95)),
         ((0x0F,0x76,0x6E),(0x11,0x5E,0x59))]
ACCENT = (0xFD, 0xE0, 0x47)
FONT_CANDIDATES = [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf",
                   "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]


def fetch(url, binary=True, timeout=10):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ElanjaiFM/1.0"})
    return urllib.request.urlopen(req, timeout=timeout, context=ctx).read()


def to_png(raw):
    img = Image.open(io.BytesIO(raw)).convert("RGBA")
    img.thumbnail((SIZE, SIZE), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    canvas.paste(img, ((SIZE - img.width) // 2, (SIZE - img.height) // 2), img)
    return canvas


def save_png(img, slug, genre):
    d = os.path.join(OUT, genre)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, f"{slug}.png")
    img.save(p, "PNG", optimize=True)
    return f"/logos/{genre}/{slug}.png"


def homepage_candidates(homepage):
    """Best-effort real brand images from a station homepage."""
    if not homepage or "/" not in homepage.replace("://", ""):
        return []
    try:
        html = fetch(homepage, binary=False).decode("utf-8", "replace")
    except Exception:
        return []
    base = re.match(r"https?://[^/]+", homepage)
    base = base.group(0) if base else homepage.rstrip("/")
    out = []
    for pat in (r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
                r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)',
                r'<link[^>]+rel=["\'](?:apple-touch-icon|icon)["\'][^>]+href=["\']([^"\']+)'):
        for u in re.findall(pat, html, re.I)[:2]:
            if u.startswith("//"):
                u = "https:" + u
            elif u.startswith("/"):
                u = base + u
            elif not u.startswith("http"):
                u = base + "/" + u
            out.append(u)
    out.append(base + "/apple-touch-icon.png")
    out.append(base + "/favicon.ico")
    return out


def initials(name):
    return "".join(w[0] for w in name.split()[:2]).upper()


def gen_tile(name, gi):
    """Design-system fallback tile — brand gradient, accent initials, deco ring."""
    c1, c2 = GRADS[gi % len(GRADS)]
    img = Image.new("RGBA", (SIZE, SIZE))
    dr = ImageDraw.Draw(img)
    for y in range(SIZE):  # diagonal-ish vertical gradient
        t = y / SIZE
        dr.line([(0, y), (SIZE, y)],
                fill=tuple(int(c1[k] + (c2[k] - c1[k]) * t) for k in range(3)))
    dr.ellipse([SIZE*0.62, -SIZE*0.18, SIZE*1.18, SIZE*0.38], fill=(*ACCENT, 28))
    dr.ellipse([SIZE*0.78, -SIZE*0.10, SIZE*1.10, SIZE*0.22], fill=(255, 255, 255, 16))
    font_path = next((p for p in FONT_CANDIDATES if os.path.exists(p)), None)
    big = ImageFont.truetype(font_path, 96) if font_path else ImageFont.load_default()
    txt = initials(name)
    bb = dr.textbbox((0, 0), txt, font=big)
    dr.text(((SIZE - (bb[2]-bb[0]))/2 - bb[0], (SIZE - (bb[3]-bb[1]))/2 - bb[1] - 8),
            txt, font=big, fill=ACCENT)
    small = ImageFont.truetype(font_path, 20) if font_path else ImageFont.load_default()
    tag = "LIVE RADIO"
    bb = dr.textbbox((0, 0), tag, font=small)
    dr.text(((SIZE - (bb[2]-bb[0]))/2, SIZE*0.74), tag, font=small,
            fill=(216, 231, 220, 200))
    return img


def process(args):
    s, genre, gi = args
    slug, fav = s["slug"], s.get("favicon") or ""
    candidates = [fav] if fav else []
    for u in candidates + ([] if fav else homepage_candidates(s.get("homepage"))):
        if not u:
            continue
        try:
            raw = fetch(u)
            img = to_png(raw)
            if img.getbbox():
                return slug, save_png(img, slug, genre), "favicon" if u == fav else "homepage"
        except Exception:
            continue
    if fav:  # favicon URL broken → still try homepage mining before generating
        for u in homepage_candidates(s.get("homepage")):
            try:
                img = to_png(fetch(u))
                if img.getbbox():
                    return slug, save_png(img, slug, genre), "homepage"
            except Exception:
                continue
    return slug, save_png(gen_tile(s["name"], gi), slug, genre), "generated"


def main():
    import sys
    genres = sys.argv[1:] or ["tamil"]
    stations = json.load(open(os.path.join(ROOT, "data", "stations.json"),
                             encoding="utf-8"))
    manifest = {}
    if os.path.exists(MANIFEST):
        manifest = json.load(open(MANIFEST, encoding="utf-8"))
    stats = {}
    for genre in genres:
        todo = [(s, genre, i) for i, s in enumerate(
            x for x in stations if x.get("genre") == genre and x.get("is_active"))]
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
            for slug, path, how in ex.map(process, todo):
                manifest[slug] = path
                stats[how] = stats.get(how, 0) + 1
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=1, sort_keys=True)
    print(f"{sum(stats.values())} logos -> {OUT} | {stats}")


if __name__ == "__main__":
    main()
