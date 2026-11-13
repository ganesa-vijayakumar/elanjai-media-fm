#!/usr/bin/env python3
"""Builds design/scripts/elanjai-fm-app.json — a FigCraft command script.

Elanjai Media FM redesigned as a compact, iPhone-app-style product:
  Page 1 "Foundations"   — colors, type, radii, icon set, components
  Page 2 "Screens"       — 8 iPhone 17 Pro light-mode screens + prototype links
  Page 3 "Dark & States" — dark variants + player/empty states
  Page 4 "Responsive"    — Desktop 1440 + iPad 834 layouts (nav in app bar,
                           multi-column grids, floating bottom-right player)

Run:  figcraft-cli run elanjai-fm-app.json --out ../elanjai-fm-app.figcraft
Then: figcraft-cli export ../elanjai-fm-app.figcraft --page Screens --scale 2 --out ../screens
"""
import json, os, re, math

C = []

def cmd(c, params=None, As=None):
    d = {"command": c}
    if params is not None:
        d["params"] = params
    if As:
        d["as"] = As
    C.append(d)
    return d

def clean(props):
    return {k: v for k, v in props.items() if v is not None}

# ---------------------------------------------------------------- palette
BG, SURF, SURF2, BORD = "#FCFCF6", "#FFFFFF", "#F5F2E4", "#E9E5D3"
INK, MUT = "#10241A", "#5F7268"
BRAND, BRAND2 = "#0B3D2E", "#0F5138"
ACC, ACCINK, ACCSOFT = "#FDE047", "#2A2300", "#FEF9C3"
ROSE, DANGER = "#E11D48", "#DC2626"

DBG, DSURF, DSURF2, DBORD = "#07130C", "#0E2015", "#15301F", "#1F4230"
DINK, DMUT = "#F0F6F2", "#8FAE9C"

LOGO_GRADS = [("#0F5138", "#0B3D2E"), ("#1E4B8F", "#16345C"),
              ("#A3480E", "#7C2D12"), ("#6D28D9", "#4C1D95"), ("#0F766E", "#115E59")]

GENRES = [
    ("Tamil",     79, "Ta", "#FFE9D6", "#C2410C"),
    ("Hindi",     40, "Hi", "#E0F2FE", "#0369A1"),
    ("Malayalam", 39, "Ma", "#DCFCE7", "#15803D"),
    ("Punjabi",   37, "Pu", "#EDE9FE", "#6D28D9"),
    ("Telugu",    27, "Te", "#FCE7F3", "#BE185D"),
    ("Urdu",      27, "Ur", "#CCFBF1", "#0F766E"),
    ("Kannada",   23, "Ka", "#FEF3C7", "#B45309"),
    ("India",     21, "In", "#F5F2E4", "#3F6212"),
]

POPULAR = [
    ("big fm tamil",           "Tamil · 128k", 0),
    ("KS CHITRA",              "Tamil · 128k", 1),
    ("Bollywood Gaane Purane", "Hindi · 128k", 2),
    ("Hits Of Bollywood",      "Hindi · 128k", 3),
]
TAMIL_RAIL = [
    ("Kalai FM",           "Tamil · 128k", 4),
    ("90s Tamil Melodies", "Tamil · 128k", 1),
    ("Sun Tamil Radio",    "Tamil · 128k", 2),
]
TAMIL_LIST = [
    ("Kalai FM",              "Tamil · 128 kbps", 4, True),
    ("KS CHITRA",             "Tamil · 128 kbps", 1, False),
    ("90s Tamil Melodies",    "Tamil · 128 kbps", 0, False),
    ("Sun Tamil Radio",       "Tamil · 128 kbps", 3, False),
    ("JN FM Tamil Classic",   "Tamil · 128 kbps", 2, False),
    ("M S Viswanathan FM",    "Tamil · 128 kbps", 1, False),
    ("Evergreen Tamil Radio", "Tamil · 128 kbps", 4, False),
    ("AIR Kodai FM",          "Tamil · —",        3, False),
]
FAVS = [
    ("Kalai FM",       "Tamil · 128k", 4),
    ("KS CHITRA",      "Tamil · 128k", 1),
    ("Radio BollyFm",  "Hindi · 128k", 2),
    ("Goldy Evergreen","Hindi · 128k", 3),
    ("Oli 968 Radio",  "Tamil · 48k",  0),
]
RECENT = [
    ("Kalai FM",                "Tamil · 128k", 4, "2 min"),
    ("Hits Of Lata Mangeshkar", "Hindi · 128k", 2, "1 h"),
    ("JN FM Tamil Classic",     "Tamil · 128k", 1, "3 h"),
    ("MY CLUB REMIX",           "Hindi · 128k", 3, "Yesterday"),
    ("Friends Tamil FM",        "Tamil · 128k", 0, "Yesterday"),
]
TRENDING = [
    ("Kalai FM",             "Tamil · 128k", 4),
    ("big fm tamil",         "Tamil · 128k", 0),
    ("Hits Of Bollywood",    "Hindi · 128k", 3),
    ("British Indian Tamil", "Tamil · 128k", 1),
]
MORE_TAMIL = [
    ("Sun Tamil Radio", "Tamil · 128k", 3),
    ("Evergreen Tamil", "Tamil · 128k", 1),
    ("AIR Kodai FM",    "Tamil",        2),
]

def initials(name):
    return "".join(w[0] for w in name.split()[:2]).upper()

# ---------------------------------------------------------------- icon paths (24×24)
def rr(x, y, w, h, r):
    return (f"M{x+r} {y}h{w-2*r}a{r} {r} 0 0 1 {r} {r}v{h-2*r}a{r} {r} 0 0 1 {-r} {r}h{-w+2*r}"
            f"a{r} {r} 0 0 1 {-r} {-r}v{-h+2*r}a{r} {r} 0 0 1 {r} {-r}z")

def circ(cx, cy, r):
    return f"M{cx-r} {cy}a{r} {r} 0 1 1 {2*r} 0a{r} {r} 0 1 1 {-2*r} 0z"

IC = {
    "home":  "M4.5 11 12 4l7.5 7M6 9.7V20h12V9.7",
    "grid":  rr(3.5,3.5,7,7,2)+rr(13.5,3.5,7,7,2)+rr(3.5,13.5,7,7,2)+rr(13.5,13.5,7,7,2),
    "search":"M11 4.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM20.5 20.5l-4.6-4.6",
    "heart": "M12 21s-7.5-4.9-9.8-9.2C.6 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.2 3.6 3.6 6.8C19.5 16.1 12 21 12 21z",
    "heartF":"M12 21s-7.5-4.9-9.8-9.2C.6 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.2 3.6 3.6 6.8C19.5 16.1 12 21 12 21z",
    "clock": "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM12 8v4.4l3 1.8",
    "play":  "M8.4 5.5v13c0 .9 1 1.5 1.8 1l10.2-6.5c.7-.4.7-1.6 0-2L10.2 4.5c-.8-.5-1.8 0-1.8 1z",
    "pause": rr(6.5,4.5,4,15,1.4)+rr(13.5,4.5,4,15,1.4),
    "next":  "M6.2 6.3v11.4c0 .9 1 1.5 1.8 1l7.7-4.9c.7-.4.7-1.6 0-2L8 6.4c-.8-.5-1.8 0-1.8.9z"+rr(17,5,2.4,14,1.2),
    "prev":  "M17.8 6.3v11.4c0 .9-1 1.5-1.8 1l-7.7-4.9c-.7-.4-.7-1.6 0-2l7.7-4.9c.8-.5 1.8 0 1.8.9z"+rr(4.6,5,2.4,14,1.2),
    "note":  "M10 17.2V7c0-.6.3-1 .9-1.2l8.4-2.4c.7-.2 1.4.3 1.4 1V15"+circ(7,18,3)+circ(17.7,15.7,3),
    "radio": "M4 12a8 8 0 0 1 16 0M7.2 12a4.8 4.8 0 0 1 9.6 0"+circ(12,12,1.5)+"M8.7 16.6h6.6l-1.3 3.9h-4z",
    "live":  "M8.9 8.9a4.4 4.4 0 0 0 0 6.2M15.1 8.9a4.4 4.4 0 0 1 0 6.2M6 6a8.5 8.5 0 0 0 0 12M18 6a8.5 8.5 0 0 1 0 12"+circ(12,12,1.5),
    "moon":  "M20.2 14.8A8.7 8.7 0 0 1 9.2 3.8a8.7 8.7 0 1 0 11 11z",
    "sun":   circ(12,12,4)+"M12 2.5v2.2M12 19.3v2.2M5 5l1.6 1.6M17.4 17.4 19 19M2.5 12h2.2M19.3 12h2.2M5 19l1.6-1.6M17.4 6.6 19 5",
    "share": circ(18,5,3)+circ(6,12,3)+circ(18,19,3)+"M8.6 10.6l6.8-4.2M8.6 13.4l6.8 4.2",
    "vol":   "M10.5 5 6.3 9H3v6h3.3l4.2 4V5zM14.6 9.2a4 4 0 0 1 0 5.6M17.5 6.3a8 8 0 0 1 0 11.4",
    "x":     "M6.5 6.5l11 11M17.5 6.5l-11 11",
    "chevR": "M9.5 5.5 16 12l-6.5 6.5",
    "chevL": "M14.5 5.5 8 12l6.5 6.5",
    "chevD": "M5.5 9.5 12 16l6.5-6.5",
    "star":  "M12 3.6l2.5 5.2 5.8.8-4.2 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.2-4 5.8-.8z",
    "globe": circ(12,12,8)+"M4 12h16M12 4c2.2 2.1 3.4 5 3.4 8s-1.2 5.9-3.4 8c-2.2-2.1-3.4-5-3.4-8S9.8 6.1 12 4z",
    "plus":  "M12 5.5v13M5.5 12h13",
    "hp":    "M4.5 15.5V12a7.5 7.5 0 0 1 15 0v3.5"+rr(3.5,14,4,7,1.6)+rr(16.5,14,4,7,1.6),
    "dots":  circ(5.5,12,1.6)+circ(12,12,1.6)+circ(18.5,12,1.6),
    "check": "M5 12.5l4.5 4.5L19 7.5",
    "wifi":  "M4.5 10a10.5 10.5 0 0 1 15 0M7.4 13.2a6.4 6.4 0 0 1 9.2 0M10.3 16.4a2.4 2.4 0 0 1 3.4 0"+circ(12,18.6,1.1),
    "signal":rr(2.5,14,2.6,5,0.8)+rr(7.5,11,2.6,8,0.8)+rr(12.5,8,2.6,11,0.8)+rr(17.5,5,2.6,14,0.8),
    "battery":rr(2.5,8,17,8,2.4)+rr(20.6,10.4,1.8,3.2,0.9)+rr(4.5,10,9,4,1),
    "eq":    rr(4,10,3.4,10,1.4)+rr(9.3,4.5,3.4,15.5,1.4)+rr(14.6,8,3.4,12,1.4)+rr(19.9,12,3.4,8,1.4),
}
FILL_ICONS = {"play","pause","next","prev","eq","signal","battery","heartF","note","dots"}

# ------------------------------------------------- icon path normalization
# The glyphs above are drawn in a 24x24 box, but several aren't geometrically
# centered inside it (play sits right-of-center, chevrons off-axis), which
# makes icons drift inside round buttons. recenter() computes each path's
# sampled bounding box and translates it so the box centers on (12, 12).

_TOK = re.compile(r"[A-Za-z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?")
_ARITY = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7}

def _arc_pts(x1, y1, rx, ry, rot, laf, sf, x2, y2):
    if not rx or not ry or (x1 == x2 and y1 == y2):
        return [(x2, y2)]
    phi = math.radians(rot % 360)
    dx2, dy2 = (x1 - x2) / 2, (y1 - y2) / 2
    x1p = math.cos(phi) * dx2 + math.sin(phi) * dy2
    y1p = -math.sin(phi) * dx2 + math.cos(phi) * dy2
    rx, ry = abs(rx), abs(ry)
    lam = x1p ** 2 / rx ** 2 + y1p ** 2 / ry ** 2
    if lam > 1:
        s = math.sqrt(lam)
        rx, ry = rx * s, ry * s
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    co = math.sqrt(max(0.0, num / den)) if den else 0.0
    if bool(laf) == bool(sf):
        co = -co
    cxp, cyp = co * rx * y1p / ry, -co * ry * x1p / rx
    cxx = math.cos(phi) * cxp - math.sin(phi) * cyp + (x1 + x2) / 2
    cyy = math.sin(phi) * cxp + math.cos(phi) * cyp + (y1 + y2) / 2

    def ang(ux, uy, vx, vy):
        d = math.hypot(ux, uy) * math.hypot(vx, vy)
        a = math.acos(max(-1.0, min(1.0, (ux * vx + uy * vy) / d)))
        return -a if ux * vy - uy * vx < 0 else a

    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not sf and dt > 0:
        dt -= 2 * math.pi
    elif sf and dt < 0:
        dt += 2 * math.pi
    n = max(4, int(abs(dt) / (math.pi / 12)))
    return [(cxx + rx * math.cos(t1 + dt * k / n) * math.cos(phi)
             - ry * math.sin(t1 + dt * k / n) * math.sin(phi),
             cyy + rx * math.cos(t1 + dt * k / n) * math.sin(phi)
             + ry * math.sin(t1 + dt * k / n) * math.cos(phi))
            for k in range(1, n + 1)]

def _path_bbox(path):
    toks, i, c = _TOK.findall(path), 0, None
    cx = cy = sx = sy = 0.0
    last_c2 = None
    xs, ys = [], []
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            c = t
            i += 1
            if c in "Zz":
                cx, cy = sx, sy
            continue
        n = _ARITY[c.upper()]
        v = [float(z) for z in toks[i:i + n]]
        i += n
        rel, u = c.islower(), c.upper()
        ox, oy = (cx, cy) if rel else (0.0, 0.0)
        if u in "MLT":
            px, py = v[-2] + ox, v[-1] + oy
            pts = [(px, py)]
        elif u == "H":
            px, py = v[0] + ox, cy
            pts = [(px, py)]
        elif u == "V":
            px, py = cx, v[0] + oy
            pts = [(px, py)]
        elif u in "CS":
            c1x, c1y = ((2 * cx - last_c2[0], 2 * cy - last_c2[1])
                        if (u == "S" and last_c2) else (cx, cy))
            if u == "C":
                c1x, c1y = v[0] + ox, v[1] + oy
                c2x, c2y = v[2] + ox, v[3] + oy
            else:
                c2x, c2y = v[0] + ox, v[1] + oy
            px, py = v[-2] + ox, v[-1] + oy
            last_c2 = (c2x, c2y)
            pts = [((1 - k / 12) ** 3 * cx + 3 * (1 - k / 12) ** 2 * (k / 12) * c1x
                    + 3 * (1 - k / 12) * (k / 12) ** 2 * c2x + (k / 12) ** 3 * px,
                    (1 - k / 12) ** 3 * cy + 3 * (1 - k / 12) ** 2 * (k / 12) * c1y
                    + 3 * (1 - k / 12) * (k / 12) ** 2 * c2y + (k / 12) ** 3 * py)
                   for k in range(1, 13)]
        elif u == "Q":
            qx, qy = v[0] + ox, v[1] + oy
            px, py = v[2] + ox, v[3] + oy
            pts = [((1 - k / 12) ** 2 * cx + 2 * (1 - k / 12) * (k / 12) * qx
                    + (k / 12) ** 2 * px,
                    (1 - k / 12) ** 2 * cy + 2 * (1 - k / 12) * (k / 12) * qy
                    + (k / 12) ** 2 * py) for k in range(1, 13)]
        else:  # A
            px, py = v[5] + ox, v[6] + oy
            pts = _arc_pts(cx, cy, v[0], v[1], v[2], v[3], v[4], px, py)
        if u not in "CS":
            last_c2 = None
        for a, b in pts:
            xs.append(a)
            ys.append(b)
        cx, cy = px, py
        if u == "M":
            sx, sy = cx, cy
            c = "l" if rel else "L"
    return min(xs), min(ys), max(xs), max(ys)

def _fmt(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return s if s not in ("", "-0") else "0"

def recenter(path):
    x0, y0, x1, y1 = _path_bbox(path)
    dx, dy = 12 - (x0 + x1) / 2, 12 - (y0 + y1) / 2
    if abs(dx) < 0.05 and abs(dy) < 0.05:
        return path
    toks, i, c, out = _TOK.findall(path), 0, None, []
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            c = t
            out.append(t)
            i += 1
            continue
        n = _ARITY[c.upper()]
        v = [float(z) for z in toks[i:i + n]]
        i += n
        if c.isupper():
            if c == "A":
                v[5] += dx
                v[6] += dy
            elif c == "H":
                v[0] += dx
            elif c == "V":
                v[0] += dy
            else:
                v = [z + (dx if j % 2 == 0 else dy) for j, z in enumerate(v)]
        out.extend(_fmt(z) for z in v)
        if c == "M":
            c = "L"
        elif c == "m":
            c = "l"
    return " ".join(out)

IC = {k: recenter(v) for k, v in IC.items()}
ICON_FILL = FILL_ICONS

# ---------------------------------------------------------------- primitives
def F(parent, x, y, w, h, name=None, As=None, **props):
    p = {"type": "frame", "x": x, "y": y, "width": w, "height": h, "props": clean(props)}
    if parent: p["parent"] = {"$ref": parent}
    if name: p["name"] = name
    return cmd("node.create", p, As)

def R(parent, x, y, w, h, As=None, name=None, **props):
    p = {"x": x, "y": y, "width": w, "height": h, "props": clean(props)}
    if parent: p["parent"] = {"$ref": parent}
    if name: p["name"] = name
    return cmd("shape.rectangle", p, As)

def E(parent, x, y, w, h, As=None, **props):
    p = {"x": x, "y": y, "width": w, "height": h, "props": clean(props)}
    if parent: p["parent"] = {"$ref": parent}
    return cmd("shape.ellipse", p, As)

def T(parent, x, y, s, size=14, fam="Inter", style=None, color=INK, w=None,
      align=None, lh=None, ls=None, As=None, name=None, maxLines=None, case=None):
    props = clean({"fontSize": size, "fontFamily": fam, "fill": color,
                   "fontStyle": style, "textAlign": align, "lineHeight": lh,
                   "letterSpacing": ls, "textCase": case})
    if maxLines:
        props["maxLines"] = maxLines
        props["textAutoResize"] = "truncate"
    p = {"text": s, "x": x, "y": y, "props": props}
    if w: p["width"] = w
    if parent: p["parent"] = {"$ref": parent}
    if name: p["name"] = name
    return cmd("text.create", p, As)

def V(parent, x, y, path, w=24, h=24, As=None, **props):
    p = {"path": path, "x": x, "y": y, "width": w, "height": h, "props": clean(props)}
    if parent: p["parent"] = {"$ref": parent}
    return cmd("vector.create", p, As)

def icon(parent, key, x, y, size=22, color=INK, sw=1.9):
    if key in FILL_ICONS:
        props = {"fill": color}
    else:
        props = {"stroke": color, "strokeWeight": sw, "strokeCap": "round",
                 "strokeJoin": "round", "fill": "none"}
    p = {"path": IC[key], "x": x, "y": y, "width": size, "height": size, "props": props}
    if parent: p["parent"] = {"$ref": parent}
    return cmd("vector.create", p)

def shadow(y=10, r=24, a=0.10):
    return [{"type": "dropShadow", "offset": [0, y], "radius": r, "spread": 0,
             "color": f"#0B3D2E{int(a*255):02X}"}]

def grad(stops, f=(0, 0), t=(1, 1)):
    return [{"type": "linearGradient", "stops": list(stops), "from": list(f), "to": list(t)}]

# ---------------------------------------------------------------- atoms
def status_bar(scr, dark=False):
    c = "#F0F6F2" if dark else INK
    T(scr, 26, 15, "9:41", 15, "Poppins", "Semi Bold", c)
    V(scr, 296, 18, IC["signal"], w=19, h=19, fill=c)
    icon(scr, "wifi", 323, 17, 18, c, sw=2.0)
    V(scr, 354, 17.5, IC["battery"], w=25, h=25, fill=c)

def home_indicator(scr, dark=False):
    R(scr, 134, 858, 134, 5, fill=("#FFFFFF" if dark else "#0F1C14"),
      cornerRadius=2.5, opacity=0.9)

LOGO_PNG = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                        "..", "assets", "elanjai-logo.png"))

def logo_mark(parent, x, y, size, As=None):
    aid = As or f"logo_{len(C)}"
    R(parent, x, y, size, size, As=aid, name="BrandLogo", fill=BRAND,
      cornerRadius=size*0.30, effects=shadow(4, 12, 0.22))
    cmd("image.place", {"path": LOGO_PNG, "target": {"$ref": aid}, "mode": "fill"})

def app_bar(scr, dark=False):
    surf, bord, mut = (DSURF, DBORD, DMUT) if dark else (SURF, BORD, MUT)
    logo_mark(scr, 16, 50, 34)
    T(scr, 58, 52, "Elanjai FM", 16.5, "Poppins", "Semi Bold", DINK if dark else INK)
    T(scr, 58, 72, "FREE INDIAN RADIO", 8.5, "Inter", None, mut, ls=1.6)
    E(scr, 316, 50, 34, 34, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "sun" if dark else "moon", 324.5, 58.5, 17, mut, sw=1.8)
    E(scr, 352, 50, 34, 34, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "heart", 360.5, 58.5, 17, mut, sw=1.8)

def tab_bar(scr, active, dark=False):
    surf, bord, mut = (DSURF, DBORD, DMUT) if dark else (SURF, BORD, MUT)
    R(scr, 16, 800, 370, 64, name="TabBar", fill=surf, cornerRadius=32,
      stroke=bord, strokeWeight=1, effects=shadow(12, 30, 0.14))
    items = [("home", "home", "Home"), ("grid", "grid", "Genres"),
             ("search", "search", "Search"), ("heart", "heart", "Favorites")]
    refs = {}
    for i, (key, ic, label) in enumerate(items):
        cx = 16 + i * 92.5 + 46.25
        if key == active:
            R(scr, cx-28, 810, 56, 30, fill=ACC, cornerRadius=15)
            icon(scr, ic, cx-10, 815, 20, ACCINK, sw=2.0)
            T(scr, cx-27, 846, label, 9.5, "Inter", "Semi Bold",
              ACC if dark else BRAND, w=54, align="center")
        else:
            icon(scr, ic, cx-10, 815, 20, mut, sw=1.8)
            T(scr, cx-27, 846, label, 9.5, "Inter", None, mut, w=54, align="center")
        hit = f"{scr}_tab_{key}"
        R(scr, 16+i*92.5+6, 804, 80, 56, As=hit, name=f"hit/{label}", fill="#00000000")
        refs[key] = hit
    home_indicator(scr, dark)
    return refs

def eq_bars(scr, x, y, scale=1.0, color=ACC):
    for i, h in enumerate((10, 16, 12, 18)):
        R(scr, x + i*6*scale, y + (18-h)*scale, 3.4*scale, h*scale,
          fill=color, cornerRadius=1.6*scale)

def station_logo(parent, x, y, size, text, gi=0):
    R(parent, x, y, size, size, fills=grad(LOGO_GRADS[gi % len(LOGO_GRADS)]),
      cornerRadius=size*0.28, effects=shadow(3, 8, 0.18))
    T(parent, x, y + size*0.30, text, size*0.36, "Poppins", "Bold", ACC,
      w=size, align="center")

def live_chip(scr, x, y, w=118):
    R(scr, x, y, w, 24, fill=ACC, cornerRadius=12)
    eq_bars(scr, x+10, y+4, 0.55, ACCINK)
    T(scr, x+32, y+5.5, "LIVE · 293", 10.5, "Poppins", "Bold", ACCINK, ls=0.4)

def chip(scr, x, y, label, active=False, w=None, dark=False):
    w = w or (len(label) * 7.2 + 34)
    if active:
        R(scr, x, y, w, 32, fill=ACC, cornerRadius=16)
        T(scr, x, y+8.5, label, 12, "Inter", "Semi Bold", ACCINK, w=w, align="center")
    else:
        R(scr, x, y, w, 32, fill=DSURF2 if dark else SURF2, cornerRadius=16,
          stroke=DBORD if dark else BORD, strokeWeight=1)
        T(scr, x, y+8.5, label, 12, "Inter", "Medium", DINK if dark else INK,
          w=w, align="center")
    return w

def lang_chip(scr, x, y, name, short, bg, fg):
    w = 46 + len(name) * 7.4 + 14
    R(scr, x, y, w, 40, fill=bg, cornerRadius=20)
    E(scr, x+9, y+9, 22, 22, fill=fg)
    T(scr, x+9, y+13.5, short[0], 10.5, "Poppins", "Bold", "#FFFFFF", w=22, align="center")
    T(scr, x+38, y+12.5, name, 12.5, "Inter", "Semi Bold", fg)
    return w

def section_head(scr, y, title, action=None, dark=False):
    T(scr, 16, y, title, 16.5, "Poppins", "Semi Bold", DINK if dark else INK)
    if action:
        T(scr, 266, y+4, action, 11.5, "Inter", "Semi Bold",
          ACC if dark else BRAND2, w=120, align="right")

def play_badge(scr, x, y, size=32, playing=False, As=None):
    E(scr, x, y, size, size, As=As, fill=ACC, effects=shadow(4, 10, 0.28))
    icon(scr, "pause" if playing else "play", x+size*0.29, y+size*0.29,
         size*0.42, ACCINK)

def mini_player(scr, state="playing", dark=False):
    surf, bord = (DSURF, DBORD) if dark else (SURF, BORD)
    ink, mut = (DINK, DMUT) if dark else (INK, MUT)
    R(scr, 16, 716, 370, 68, name="MiniPlayer", As=f"{scr}_mp", fill=surf,
      cornerRadius=22, stroke=bord, strokeWeight=1, effects=shadow(10, 26, 0.16))
    station_logo(scr, 28, 728, 44, "KF", 4)
    T(scr, 82, 733, "Kalai FM", 13.5, "Inter", "Semi Bold", ink, w=170, maxLines=1)
    if state == "error":
        T(scr, 82, 752, "Stream unavailable — retry", 10.5, "Inter", None, DANGER,
          w=170, maxLines=1)
    elif state == "loading":
        T(scr, 82, 752, "Connecting…", 10.5, "Inter", None, mut)
    elif state == "paused":
        T(scr, 82, 752, "Paused", 10.5, "Inter", None, mut)
    else:
        eq_bars(scr, 82, 753, 0.62, ACC if dark else BRAND2)
        T(scr, 110, 752, "Ilaiyaraaja — Mellisai", 10.5, "Inter", None, mut,
          w=140, maxLines=1)
    if state == "loading":
        E(scr, 340, 731, 40, 40, fill=DSURF2 if dark else SURF2)
        R(scr, 351, 747, 18, 3.4, fill="#E3E0D0", cornerRadius=1.7)
        R(scr, 351, 747, 9, 3.4, fill=ACC if dark else BRAND2, cornerRadius=1.7)
    else:
        E(scr, 340, 731, 40, 40, As=f"{scr}_mp_play", fill=ACC,
          effects=shadow(4, 10, 0.25))
        icon(scr, "pause" if state == "playing" else "play", 351, 742, 18, ACCINK)
    icon(scr, "next", 302, 740, 22, mut)

def card_tile(scr, x, y, w, name, meta, gi, dark=False):
    surf, mut = (DSURF, DMUT) if dark else (SURF, MUT)
    R(scr, x, y, w, w+22, fill=surf, cornerRadius=20,
      stroke=DBORD if dark else BORD, strokeWeight=1)
    station_logo(scr, x+14, y+14, w-28, initials(name), gi)
    T(scr, x+14, y+w-8, name, 11, "Inter", "Semi Bold", DINK if dark else INK,
      w=w-28, maxLines=1)
    T(scr, x+14, y+w+8, meta, 9.5, "Inter", None, mut, w=w-28, maxLines=1)
    play_badge(scr, x+w-42, y+w-44, 30)

def compact_row(scr, x, y, w, name, meta, gi, live=False, dark=False):
    surf, bord = (DSURF, DBORD) if dark else (SURF, BORD)
    ink, mut = (DINK, DMUT) if dark else (INK, MUT)
    R(scr, x, y, w, 68, fill=surf, cornerRadius=18, stroke=bord, strokeWeight=1)
    station_logo(scr, x+9, y+9, 40, initials(name), gi)
    T(scr, x+57, y+11, name, 12, "Inter", "Semi Bold", ink, w=w-104, maxLines=1)
    T(scr, x+57, y+32, meta, 9.5, "Inter", None, mut, w=w-104, maxLines=1)
    if live:
        eq_bars(scr, x+57, y+47, 0.45, BRAND2 if not dark else ACC)
    E(scr, x+w-40, y+17, 34, 34, fill=ACC, effects=shadow(3, 8, 0.25))
    icon(scr, "pause" if live else "play", x+w-30.25, y+26.75, 14.5, ACCINK)

# ---------------------------------------------------------------- screens
GX = [0, 500, 1000, 1500]
GY = [60, 1120]

def phone(x, y, name, As, dark=False):
    cmd("frame.create", {"preset": "iPhone 17 Pro", "x": x, "y": y, "name": name,
                         "props": {"fill": DBG if dark else BG, "clip": True}}, As)
    return As

def caption(x, y, s):
    T(None, x+16, y, s, 13, "Poppins", "Semi Bold", "#4A5B51")

def scr_home(dark=False, pos=(0, 0)):
    scr = "s_home_d" if dark else "s_home"
    phone(GX[pos[0]], GY[pos[1]], "Home — Dark" if dark else "Home", scr, dark)
    status_bar(scr, dark); app_bar(scr, dark)
    surf, bord = (DSURF, DBORD) if dark else (SURF, BORD)

    F(scr, 16, 108, 370, 150, name="Hero", fills=grad(("#10533B", "#0B3D2E")),
      cornerRadius=26, clip=True, effects=shadow(14, 34, 0.22))
    E(scr, 268, 70, 190, 190, fill="#FDE047", opacity=0.14)
    E(scr, 300, 40, 110, 110, fill="#FFFFFF", opacity=0.07)
    logo_mark(scr, 290, 126, 84)
    live_chip(scr, 36, 128)
    T(scr, 36, 162, "Every Indian radio.\nOne tap away.", 23, "Poppins", "Semi Bold",
      "#FDFCF6", lh="118%")
    T(scr, 36, 226, "Tamil · Hindi · Malayalam · +5 more", 11.5, "Inter", None, "#D8E7DC")
    play_badge(scr, 322, 188, 52, As=f"{scr}_hero_play")

    section_head(scr, 286, "Languages", "See all →", dark)
    xx = 16
    for name, _c, short, bgc, fgc in GENRES[:5]:
        xx += lang_chip(scr, xx, 314, name, short, bgc, fgc) + 10

    section_head(scr, 382, "Popular now", None, dark)
    for i, (nm, meta, gi) in enumerate(POPULAR):
        compact_row(scr, 16+(i % 2)*189, 412+(i//2)*78, 181, nm, meta, gi,
                    live=(i == 0), dark=dark)

    section_head(scr, 580, "Tamil radio", "All 79 →", dark)
    for i, (nm, meta, gi) in enumerate(TAMIL_RAIL):
        card_tile(scr, 16+i*126, 610, 114, nm, meta, gi, dark)

    mini_player(scr, "playing", dark)
    return tab_bar(scr, "home", dark)

def scr_nowplaying(dark=False, pos=(1, 0)):
    scr = "s_np_d" if dark else "s_np"
    phone(GX[pos[0]], GY[pos[1]], "Now Playing — Dark" if dark else "Now Playing", scr, dark)
    status_bar(scr, dark)
    ink, mut, surf, bord = ((DINK, DMUT, DSURF, DBORD) if dark
                            else (INK, MUT, SURF, BORD))
    E(scr, 16, 56, 36, 36, As=f"{scr}_back", fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "chevD", 26, 66, 16, mut)
    T(scr, 0, 63, "NOW PLAYING", 10, "Inter", "Semi Bold", mut, w=402,
      align="center", ls=2.2)
    E(scr, 350, 56, 36, 36, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "dots", 358, 64, 20, mut)

    F(scr, 51, 112, 300, 300, name="Artwork", fills=grad(LOGO_GRADS[4]),
      cornerRadius=30, clip=True, effects=shadow(18, 44, 0.30))
    E(scr, 220, 70, 220, 220, fill="#FFFFFF", opacity=0.10)
    E(scr, -60, 300, 200, 200, fill="#FDE047", opacity=0.12)
    T(scr, 51, 206, "KF", 92, "Poppins", "Bold", ACC, w=300, align="center")
    icon(scr, "radio", 168, 330, 66, "#FDE047", sw=2.2)

    live_chip(scr, 142, 432, w=118)
    T(scr, 16, 470, "Kalai FM", 24, "Poppins", "Semi Bold", ink, w=370, align="center")
    T(scr, 16, 502, "Tamil · 128 kbps MP3", 12.5, "Inter", None, mut, w=370, align="center")

    R(scr, 16, 532, 370, 48, fill=surf, cornerRadius=16, stroke=bord, strokeWeight=1)
    V(scr, 30, 545, IC["eq"], w=22, h=22, fill=ACC if dark else BRAND2)
    T(scr, 60, 543, "Ilaiyaraaja — Mellisai Maname", 12.5, "Inter", "Semi Bold", ink,
      w=250, maxLines=1)
    T(scr, 60, 560, "Now playing · via ICY metadata", 9.5, "Inter", None, mut)

    icon(scr, "prev", 118, 611, 34, ink)
    E(scr, 169, 596, 64, 64, As=f"{scr}_toggle", fill=ACC, effects=shadow(8, 20, 0.30))
    icon(scr, "pause", 188, 615, 26, ACCINK)
    icon(scr, "next", 250, 611, 34, ink)

    for i, ic in enumerate(("heart", "moon", "share", "hp")):
        cx = 83.5 + i*65
        E(scr, cx, 688, 40, 40, fill=surf, stroke=bord, strokeWeight=1)
        icon(scr, ic, cx+10, 698, 20, mut, sw=1.8)

    icon(scr, "vol", 24, 755.5, 18, mut)
    R(scr, 52, 762, 298, 5, fill=DSURF2 if dark else SURF2, cornerRadius=2.5)
    R(scr, 52, 762, 186, 5, fill=ACC if dark else BRAND2, cornerRadius=2.5)
    E(scr, 231, 756, 17, 17, fill=surf, stroke=bord, strokeWeight=1,
      effects=shadow(2, 6, 0.15))
    icon(scr, "vol", 360, 755.5, 18, ink)

    T(scr, 16, 792, "UP NEXT", 9.5, "Inter", "Semi Bold", mut, ls=1.8)
    R(scr, 16, 812, 370, 46, As=f"{scr}_upnext", fill=surf, cornerRadius=14,
      stroke=bord, strokeWeight=1)
    station_logo(scr, 24, 819, 32, "ST", 3)
    T(scr, 64, 821, "Sun Tamil Radio", 12.5, "Inter", "Semi Bold", ink)
    T(scr, 64, 838, "Tamil · 128k", 9.5, "Inter", None, mut)
    icon(scr, "chevR", 352, 826, 18, mut)
    home_indicator(scr, dark)

def scr_genres(dark=False, pos=(2, 0)):
    scr = "s_genres"
    phone(GX[pos[0]], GY[pos[1]], "Genres", scr, dark)
    status_bar(scr, dark); app_bar(scr, dark)
    ink, mut = (DINK, DMUT) if dark else (INK, MUT)
    T(scr, 16, 112, "Browse by\nlanguage", 27, "Poppins", "Semi Bold", ink, lh="115%")
    T(scr, 16, 180, "8 languages · 293 live stations", 12, "Inter", None, mut)
    for i, (name, count, short, bgc, fgc) in enumerate(GENRES):
        tx, ty = 16 + (i % 2) * 189, 218 + (i // 2) * 140
        R(scr, tx, ty, 181, 128, name=f"Genre/{name}", As=f"gtile_{name.lower()}",
          fill=bgc, cornerRadius=22)
        E(scr, tx+124, ty-14, 72, 72, fill="#FFFFFF", opacity=0.35)
        R(scr, tx+16, ty+16, 46, 46, fill=fgc, cornerRadius=14)
        T(scr, tx+16, ty+26, short, 16, "Poppins", "Bold", "#FFFFFF", w=46, align="center")
        icon(scr, "note", tx+140, ty+20, 20, fgc, sw=1.8)
        T(scr, tx+16, ty+76, name, 15, "Poppins", "Semi Bold", fgc)
        T(scr, tx+16, ty+98, f"{count} stations", 11, "Inter", "Medium", fgc)
    mini_player(scr, "playing", dark)
    return tab_bar(scr, "grid", dark)

def scr_genre_detail(dark=False, pos=(3, 0)):
    scr = "s_gt"
    phone(GX[pos[0]], GY[pos[1]], "Genre — Tamil", scr, dark)
    status_bar(scr, dark)
    ink, mut, surf, bord = ((DINK, DMUT, DSURF, DBORD) if dark
                            else (INK, MUT, SURF, BORD))
    E(scr, 16, 52, 36, 36, As="gt_back", fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "chevL", 26, 62, 16, ink)
    T(scr, 60, 57, "Tamil", 18, "Poppins", "Semi Bold", ink)
    E(scr, 350, 52, 36, 36, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "search", 359, 61, 18, mut)

    xx = 16
    for name, _c, _s, _b, _f in GENRES:
        ww = chip(scr, xx, 104, name, active=(name == "Tamil"), dark=dark)
        xx += ww + 8
        if xx > 340:
            break
    T(scr, 16, 152, "79 live stations — tap to play", 11.5, "Inter", None, mut)

    yy = 178
    for i, (nm, meta, gi, live) in enumerate(TAMIL_LIST):
        R(scr, 16, yy, 370, 62, As="gt_row_live" if live else None, fill=surf,
          cornerRadius=18, stroke=bord, strokeWeight=1)
        station_logo(scr, 26, yy+9, 44, initials(nm), gi)
        T(scr, 82, yy+11, nm, 13.5, "Inter", "Semi Bold", ink, w=220, maxLines=1)
        if live:
            eq_bars(scr, 82, yy+37, 0.55, BRAND2 if not dark else ACC)
            T(scr, 108, yy+36, "Playing now", 10.5, "Inter", "Medium",
              ACC if dark else BRAND2)
        else:
            T(scr, 82, yy+36, meta, 10.5, "Inter", None, mut)
        play_badge(scr, 340, yy+15, 32, playing=live)
        yy += 72
    mini_player(scr, "playing", dark)
    return tab_bar(scr, "grid", dark)

def scr_search(dark=False, pos=(0, 1)):
    scr = "s_search"
    phone(GX[pos[0]], GY[pos[1]], "Search", scr, dark)
    status_bar(scr, dark); app_bar(scr, dark)
    ink, mut, surf, bord = ((DINK, DMUT, DSURF, DBORD) if dark
                            else (INK, MUT, SURF, BORD))
    R(scr, 16, 108, 370, 48, As="search_field", fill=DSURF2 if dark else SURF2,
      cornerRadius=24, stroke=ACC if dark else BRAND2, strokeWeight=1.5)
    icon(scr, "search", 32, 122, 20, mut)
    T(scr, 62, 121, "kalai", 14, "Inter", None, ink)
    icon(scr, "x", 346, 123, 18, mut)

    T(scr, 16, 176, "RECENT SEARCHES", 9.5, "Inter", "Semi Bold", mut, ls=1.8)
    xx = 16
    for s in ("big fm", "ilaiyaraaja", "punjabi", "gaane"):
        xx += chip(scr, xx, 198, s, dark=dark) + 8

    T(scr, 16, 252, "TRENDING NOW", 9.5, "Inter", "Semi Bold", mut, ls=1.8)
    yy = 276
    for i, (nm, meta, gi) in enumerate(TRENDING):
        R(scr, 16, yy, 370, 62, fill=surf, cornerRadius=18, stroke=bord, strokeWeight=1)
        T(scr, 26, yy+17, f"{i+1}", 15, "Poppins", "Bold", BRAND2 if not dark else ACC, w=22)
        station_logo(scr, 52, yy+9, 44, initials(nm), gi)
        T(scr, 108, yy+12, nm, 13.5, "Inter", "Semi Bold", ink, w=200, maxLines=1)
        T(scr, 108, yy+35, meta, 10.5, "Inter", None, mut)
        play_badge(scr, 340, yy+15, 32)
        yy += 72
    mini_player(scr, "playing", dark)
    return tab_bar(scr, "search", dark)

def scr_favorites(dark=False, pos=(1, 1)):
    scr = "s_fav"
    phone(GX[pos[0]], GY[pos[1]], "Favorites", scr, dark)
    status_bar(scr, dark); app_bar(scr, dark)
    ink, mut, surf, bord = ((DINK, DMUT, DSURF, DBORD) if dark
                            else (INK, MUT, SURF, BORD))
    T(scr, 16, 112, "Favorites", 27, "Poppins", "Semi Bold", ink)
    T(scr, 16, 148, f"{len(FAVS)} stations · saved on this device", 12, "Inter", None, mut)
    yy = 182
    for i, (nm, meta, gi) in enumerate(FAVS):
        R(scr, 16, yy, 370, 62, As="fav_row_1" if i == 0 else None, fill=surf,
          cornerRadius=18, stroke=bord, strokeWeight=1)
        station_logo(scr, 26, yy+9, 44, initials(nm), gi)
        T(scr, 82, yy+11, nm, 13.5, "Inter", "Semi Bold", ink, w=200, maxLines=1)
        T(scr, 82, yy+36, meta, 10.5, "Inter", None, mut)
        icon(scr, "heartF", 304, yy+19, 24, ROSE)
        play_badge(scr, 346, yy+15, 32)
        yy += 72
    R(scr, 16, yy+8, 370, 56, fill=ACCSOFT, cornerRadius=18)
    icon(scr, "heart", 32, yy+26, 20, ACCINK)
    T(scr, 62, yy+19, "Tap ♡ on any station to keep it here.", 12, "Inter", "Medium", ACCINK)
    T(scr, 62, yy+37, "Favorites never leave your device.", 10, "Inter", None, "#7A6C1E")
    mini_player(scr, "playing", dark)
    return tab_bar(scr, "heart", dark)

def scr_station(dark=False, pos=(2, 1)):
    scr = "s_st"
    phone(GX[pos[0]], GY[pos[1]], "Station — Kalai FM", scr, dark)
    status_bar(scr, dark)
    ink, mut, surf, bord = ((DINK, DMUT, DSURF, DBORD) if dark
                            else (INK, MUT, SURF, BORD))
    E(scr, 16, 52, 36, 36, As="st_back", fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "chevL", 26, 62, 16, ink)
    E(scr, 350, 52, 36, 36, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "share", 358, 60, 20, mut)

    F(scr, 16, 104, 370, 236, name="StationHero", fills=grad(("#11543C", "#0B3D2E")),
      cornerRadius=26, clip=True, effects=shadow(14, 34, 0.22))
    E(scr, 260, 64, 180, 180, fill="#FDE047", opacity=0.13)
    E(scr, -70, 260, 190, 190, fill="#FFFFFF", opacity=0.06)
    station_logo(scr, 40, 128, 84, "KF", 4)
    live_chip(scr, 294, 128, w=92)
    T(scr, 40, 226, "Kalai FM", 24, "Poppins", "Semi Bold", "#FDFCF6")
    T(scr, 40, 256, "Tamil · India · 128 kbps MP3", 12, "Inter", None, "#CBDFD1")
    xx = 40
    for tg in ("classic", "melody", "ilaiyaraaja"):
        w = len(tg)*6.6 + 24
        R(scr, xx, 288, w, 26, fill="#FFFFFF1F", cornerRadius=13)
        T(scr, xx, 294, tg, 10.5, "Inter", "Medium", "#DCE8DF", w=w, align="center")
        xx += w + 8

    E(scr, 40, 356, 56, 56, As="st_play", fill=ACC, effects=shadow(8, 18, 0.3))
    icon(scr, "play", 56.5, 372.5, 23, ACCINK)
    T(scr, 108, 366, "Tap to listen live", 13, "Inter", "Semi Bold", ink)
    T(scr, 108, 386, "Free · no sign-up", 10.5, "Inter", None, mut)
    E(scr, 296, 362, 44, 44, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "heart", 307, 373, 22, ROSE)
    E(scr, 348, 362, 44, 44, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "globe", 359, 373, 22, mut)

    R(scr, 16, 436, 370, 52, fill=surf, cornerRadius=18, stroke=bord, strokeWeight=1)
    V(scr, 30, 450, IC["eq"], w=24, h=24, fill=BRAND2 if not dark else ACC)
    T(scr, 64, 448, "NOW PLAYING", 9, "Inter", "Semi Bold", mut, ls=1.4)
    T(scr, 64, 462, "Ilaiyaraaja — Mellisai Maname", 12.5, "Inter", "Semi Bold", ink,
      w=280, maxLines=1)

    section_head(scr, 516, "More Tamil stations", "All 79 →", dark)
    for i, (nm, meta, gi) in enumerate(MORE_TAMIL):
        card_tile(scr, 16+i*126, 546, 114, nm, meta, gi, dark)
    mini_player(scr, "playing", dark)
    return tab_bar(scr, "home", dark)

def scr_recent(dark=False, pos=(3, 1)):
    scr = "s_recent"
    phone(GX[pos[0]], GY[pos[1]], "Recently Played", scr, dark)
    status_bar(scr, dark); app_bar(scr, dark)
    ink, mut, surf, bord = ((DINK, DMUT, DSURF, DBORD) if dark
                            else (INK, MUT, SURF, BORD))
    T(scr, 16, 112, "Recently played", 27, "Poppins", "Semi Bold", ink)
    T(scr, 16, 148, "Last 20 stations · this device only", 12, "Inter", None, mut)
    yy = 182
    for nm, meta, gi, when in RECENT:
        R(scr, 16, yy, 370, 62, fill=surf, cornerRadius=18, stroke=bord, strokeWeight=1)
        station_logo(scr, 26, yy+9, 44, initials(nm), gi)
        T(scr, 82, yy+11, nm, 13.5, "Inter", "Semi Bold", ink, w=170, maxLines=1)
        T(scr, 82, yy+36, meta, 10.5, "Inter", None, mut)
        icon(scr, "clock", 250, yy+21, 15, mut)
        T(scr, 272, yy+22, when, 10.5, "Inter", None, mut, w=76)
        icon(scr, "play", 354, yy+21, 20, BRAND2 if not dark else ACC)
        yy += 72
    R(scr, 16, yy+8, 370, 44, fill=DSURF2 if dark else SURF2, cornerRadius=14)
    icon(scr, "x", 30, yy+20, 16, mut)
    T(scr, 56, yy+20, "Clear history", 12, "Inter", "Semi Bold", mut)
    mini_player(scr, "playing", dark)
    return tab_bar(scr, None, dark)

# ---------------------------------------------------------------- states frame
def mini_player_state(scr, x, y, state, label):
    T(scr, x, y-22, label.upper(), 9.5, "Inter", "Semi Bold", MUT, ls=1.5)
    R(scr, x, y, 370, 68, fill=SURF, cornerRadius=22, stroke=BORD, strokeWeight=1,
      effects=shadow(8, 20, 0.10))
    station_logo(scr, x+12, y+12, 44, "KF", 4)
    T(scr, x+66, y+16, "Kalai FM", 13.5, "Inter", "Semi Bold", INK, w=170, maxLines=1)
    subs = {"playing": "Ilaiyaraaja — Mellisai", "loading": "Connecting…",
            "paused": "Paused", "error": "Stream unavailable — retry"}
    if state == "playing":
        eq_bars(scr, x+66, y+38, 0.6, BRAND2)
        T(scr, x+94, y+37, subs[state], 10.5, "Inter", None, MUT, w=140, maxLines=1)
    else:
        col = DANGER if state == "error" else MUT
        T(scr, x+66, y+37, subs[state], 10.5, "Inter", None, col, w=190, maxLines=1)
    if state == "loading":
        E(scr, x+316, y+14, 40, 40, fill=SURF2)
        R(scr, x+327, y+30, 18, 3.4, fill="#E3E0D0", cornerRadius=1.7)
        R(scr, x+327, y+30, 8, 3.4, fill=BRAND2, cornerRadius=1.7)
    else:
        play_badge(scr, x+316, y+18, 32, playing=(state == "playing"))

def scr_states(pos=(0, 0)):
    scr = "s_states"
    phone(GX[pos[0]], GY[pos[1]], "Player & Empty States", scr)
    status_bar(scr)
    T(scr, 16, 52, "Mini player", 15, "Poppins", "Semi Bold", INK)
    for i, (st, lb) in enumerate((("playing", "Playing"), ("loading", "Connecting"),
                                  ("paused", "Paused"), ("error", "Error"))):
        mini_player_state(scr, 16, 100 + i*96, st, lb)
    T(scr, 16, 504, "Alerts", 15, "Poppins", "Semi Bold", INK)
    R(scr, 16, 532, 370, 56, fill=SURF, cornerRadius=18, stroke=BORD, strokeWeight=1)
    icon(scr, "vol", 32, 550, 20, MUT)
    T(scr, 62, 544, "Buffering…", 13, "Inter", "Semi Bold", INK)
    T(scr, 62, 562, "Retrying the stream automatically", 10.5, "Inter", None, MUT)
    R(scr, 308, 542, 66, 36, fill=ACC, cornerRadius=18)
    T(scr, 308, 552, "Retry", 11.5, "Inter", "Semi Bold", ACCINK, w=66, align="center")
    R(scr, 16, 600, 370, 56, fill="#FDF1F1", cornerRadius=18, stroke="#F3C8C8",
      strokeWeight=1)
    icon(scr, "x", 32, 618, 20, DANGER)
    T(scr, 62, 612, "Station offline", 13, "Inter", "Semi Bold", INK)
    T(scr, 62, 630, "Marked inactive — try a related station", 10.5, "Inter", None, MUT)
    T(scr, 16, 688, "Empty state", 15, "Poppins", "Semi Bold", INK)
    R(scr, 16, 716, 370, 140, fill=SURF, cornerRadius=22, stroke=BORD,
      strokeWeight=1.5, dashes=[6, 5])
    icon(scr, "heart", 184, 736, 34, MUT, sw=1.6)
    T(scr, 16, 782, "No favorites yet", 14, "Poppins", "Semi Bold", INK, w=370,
      align="center")
    T(scr, 16, 804, "Tap the heart on any station and it lands here.", 11, "Inter",
      None, MUT, w=370, align="center")
    R(scr, 141, 826, 120, 30, fill=ACC, cornerRadius=15)
    T(scr, 141, 834, "Browse stations", 10.5, "Inter", "Semi Bold", ACCINK, w=120,
      align="center")

# ---------------------------------------------------------------- foundations
def foundations():
    F(None, 0, 0, 1240, 1340, name="Foundations", As="pg_found",
      fill="#F8F7F0", clip=True)
    T("pg_found", 48, 40, "Elanjai FM — Design Foundations", 28, "Poppins", "Bold", INK)
    T("pg_found", 48, 80, "Dark forest + warm yellow on cream. Rounded, compact, app-native.",
      13, "Inter", None, MUT)

    T("pg_found", 48, 124, "COLOR", 11, "Inter", "Semi Bold", MUT, ls=2.4)
    sw = [("bg", BG, "page"), ("surface", SURF, "cards"), ("surface-2", SURF2, "chips"),
          ("border", BORD, "hairlines"), ("ink", INK, "text"), ("muted", MUT, "secondary"),
          ("brand", BRAND, "primary"), ("brand-2", BRAND2, "interactive"),
          ("accent", ACC, "play / CTA"), ("accent-soft", ACCSOFT, "highlights"),
          ("accent-ink", ACCINK, "on accent"), ("rose", ROSE, "favorites"),
          ("dark bg", DBG, "dark page"), ("dark surface", DSURF, "dark cards"),
          ("dark surf-2", DSURF2, "dark chips"), ("dark ink", DINK, "dark text"),
          ("dark muted", DMUT, "dark sub"), ("dark border", DBORD, "dark hairline")]
    for i, (nm, col, use) in enumerate(sw):
        sx, sy = 48 + (i % 6) * 196, 150 + (i // 6) * 118
        R("pg_found", sx, sy, 176, 64, fill=col, cornerRadius=14,
          stroke=BORD, strokeWeight=1)
        T("pg_found", sx+2, sy+70, nm, 11, "Inter", "Semi Bold", INK)
        T("pg_found", sx+2, sy+86, f"{col} · {use}", 9, "Inter", None, MUT)

    T("pg_found", 48, 520, "TYPE — Poppins display / Inter UI", 11, "Inter", "Semi Bold",
      MUT, ls=2.4)
    T("pg_found", 48, 546, "Every Indian radio.", 30, "Poppins", "Bold", INK)
    T("pg_found", 372, 562, "Poppins Bold 30 — display", 10.5, "Inter", None, MUT)
    T("pg_found", 48, 602, "Tamil radio stations", 20, "Poppins", "Semi Bold", INK)
    T("pg_found", 372, 610, "Poppins SemiBold 20 — page title", 10.5, "Inter", None, MUT)
    T("pg_found", 48, 638, "Kalai FM", 15, "Inter", "Semi Bold", INK)
    T("pg_found", 372, 640, "Inter SemiBold 13.5–15 — titles", 10.5, "Inter", None, MUT)
    T("pg_found", 48, 664, "Tamil · 128 kbps MP3 — metadata at a glance.", 13, "Inter", None, MUT)
    T("pg_found", 48, 690, "LIVE · 293 STATIONS", 10, "Inter", "Semi Bold", MUT, ls=2.0)
    T("pg_found", 372, 692, "Inter SemiBold 10 — eyebrow", 10.5, "Inter", None, MUT)

    T("pg_found", 640, 520, "RADII & ELEVATION", 11, "Inter", "Semi Bold", MUT, ls=2.4)
    for i, (nm, r) in enumerate((("chip · 16", 16), ("card · 20", 20),
                                 ("sheet · 26", 26), ("pill · full", 60))):
        R("pg_found", 640 + i*140, 550, 120, 72, fill=SURF, cornerRadius=r,
          stroke=BORD, strokeWeight=1, effects=shadow(6, 16, 0.10))
        T("pg_found", 640 + i*140, 630, nm, 10.5, "Inter", None, MUT, w=120, align="center")

    T("pg_found", 640, 676, "ICON SET — 24px · round caps · 1.9 stroke · filled transport",
      11, "Inter", "Semi Bold", MUT, ls=1.4)
    icon_names = ["home","grid","search","heart","clock","play","pause","next","prev",
                  "note","radio","live","moon","sun","share","vol","x","chevR","chevL",
                  "chevD","star","globe","plus","hp","dots","check","wifi","eq","heartF"]
    for i, k in enumerate(icon_names):
        ix, iy = 640 + (i % 10) * 58, 706 + (i // 10) * 60
        R("pg_found", ix, iy, 44, 44, fill=SURF, cornerRadius=12, stroke=BORD,
          strokeWeight=1)
        icon("pg_found", k, ix+10, iy+10, 24, INK)
        T("pg_found", ix, iy+46, k, 8, "Inter", None, MUT, w=44, align="center")

    logo_mark("pg_found", 48, 756, 80)
    T("pg_found", 144, 762, "BRAND", 11, "Inter", "Semi Bold", MUT, ls=2.4)
    T("pg_found", 144, 786, "ELANJAI pin mark", 15, "Poppins", "Semi Bold", INK)
    T("pg_found", 144, 810,
      "Image fill on a rounded tile (design/assets/elanjai-logo.png).\n"
      "Used as app icon, nav-bar mark and hero artwork.",
      10.5, "Inter", None, MUT, lh="160%")

    T("pg_found", 48, 920, "COMPONENTS", 11, "Inter", "Semi Bold", MUT, ls=2.4)
    R("pg_found", 48, 950, 150, 44, fill=BRAND, cornerRadius=22)
    T("pg_found", 48, 963, "Listen live", 13, "Inter", "Semi Bold", "#FDFCF6",
      w=150, align="center")
    E("pg_found", 216, 944, 56, 56, fill=ACC, effects=shadow(6, 16, 0.28))
    icon("pg_found", "play", 232, 960, 24, ACCINK)
    E("pg_found", 292, 954, 36, 36, fill=SURF, stroke=BORD, strokeWeight=1)
    icon("pg_found", "heart", 301, 963, 18, ROSE)
    chip("pg_found", 356, 956, "Tamil", active=True)
    chip("pg_found", 444, 956, "Hindi")
    T("pg_found", 48, 1010, "Buttons · FAB · icon · chips", 10, "Inter", None, MUT)
    card_tile("pg_found", 560, 950, 96, "Kalai FM", "Tamil · 128k", 4)
    T("pg_found", 560, 1078, "Station card", 10, "Inter", None, MUT, w=96,
      align="center")

    R("pg_found", 700, 950, 370, 62, fill=SURF, cornerRadius=18, stroke=BORD,
      strokeWeight=1)
    station_logo("pg_found", 710, 959, 44, "KF", 4)
    T("pg_found", 766, 960, "Kalai FM", 13.5, "Inter", "Semi Bold", INK)
    T("pg_found", 766, 985, "Tamil · 128 kbps", 10.5, "Inter", None, MUT)
    play_badge("pg_found", 1024, 965, 32)
    T("pg_found", 700, 1024, "List row", 10, "Inter", None, MUT)

    R("pg_found", 48, 1104, 370, 64, fill=SURF, cornerRadius=32, stroke=BORD,
      strokeWeight=1, effects=shadow(10, 26, 0.12))
    items = [("home","Home",True),("grid","Genres",False),("search","Search",False),
             ("heart","Favorites",False)]
    for i, (ic, lb, act) in enumerate(items):
        cx = 48 + i*92.5 + 46.25
        if act:
            R("pg_found", cx-28, 1114, 56, 30, fill=ACC, cornerRadius=15)
            icon("pg_found", ic, cx-10, 1119, 20, ACCINK)
            T("pg_found", cx-27, 1150, lb, 9.5, "Inter", "Semi Bold", BRAND, w=54,
              align="center")
        else:
            icon("pg_found", ic, cx-10, 1119, 20, MUT)
            T("pg_found", cx-27, 1150, lb, 9.5, "Inter", None, MUT, w=54,
              align="center")
    T("pg_found", 48, 1180, "Floating tab bar — active tab takes the accent pill",
      10, "Inter", None, MUT)
    R("pg_found", 440, 1102, 370, 68, fill=SURF, cornerRadius=22, stroke=BORD,
      strokeWeight=1, effects=shadow(10, 26, 0.12))
    station_logo("pg_found", 452, 1114, 44, "KF", 4)
    T("pg_found", 506, 1119, "Kalai FM", 13.5, "Inter", "Semi Bold", INK)
    eq_bars("pg_found", 506, 1141, 0.62, BRAND2)
    T("pg_found", 534, 1140, "Ilaiyaraaja — Mellisai", 10.5, "Inter", None, MUT)
    play_badge("pg_found", 764, 1117, 34, playing=True)
    T("pg_found", 440, 1180, "Mini player — docks above the tab bar", 10, "Inter",
      None, MUT)

    T("pg_found", 880, 920, "GENRE TILES — one pastel pair per language", 11, "Inter",
      "Semi Bold", MUT, ls=1.4)
    for i, (name, count, short, bgc, fgc) in enumerate(GENRES):
        tx, ty = 880 + (i % 4) * 90, 942 + (i // 4) * 96
        R("pg_found", tx, ty, 80, 84, fill=bgc, cornerRadius=18)
        R("pg_found", tx+8, ty+8, 30, 30, fill=fgc, cornerRadius=9)
        T("pg_found", tx+8, ty+14, short, 10, "Poppins", "Bold", "#FFF", w=30,
          align="center")
        T("pg_found", tx+8, ty+44, name, 10, "Poppins", "Semi Bold", fgc, w=64,
          maxLines=1)
        T("pg_found", tx+8, ty+60, str(count), 9.5, "Inter", None, fgc)

    T("pg_found", 48, 1224, "LAYOUT", 11, "Inter", "Semi Bold", MUT, ls=2.4)
    T("pg_found", 48, 1248,
      "Screen 402×874 (iPhone 17 Pro) · page padding 16 · card gap 12 · section gap 32\n"
      "Floating chrome: mini player 68h @ y716 · tab pill 64h @ y800 · content scrolls behind\n"
      "Tap targets ≥ 44px · logos fall back to gradient + initials (mirrors StationLogo)",
      12, "Inter", None, MUT, lh="170%")

# ---------------------------------------------------------------- responsive
# Desktop (1440) and iPad (834) variants — same language, wider layout:
# app bar carries nav links + search; no tab bar; grids go multi-column;
# the mini player becomes a floating card docked bottom-right.
def desk(x, y, name, As, W=1440, H=1024, dark=False):
    cmd("frame.create", {"x": x, "y": y, "width": W, "height": H, "name": name,
                         "props": {"fill": DBG if dark else BG, "clip": True}}, As)

def d_appbar(scr, W, mx, dark=False):
    surf, bord = (DSURF, DBORD) if dark else (SURF, BORD)
    ink, mut = (DINK, DMUT) if dark else (INK, MUT)
    R(scr, 0, 0, W, 64, name="AppBar", fill=surf)
    R(scr, 0, 63, W, 1, fill=bord)
    logo_mark(scr, mx, 15, 34)
    T(scr, mx+44, 13, "Elanjai FM", 15.5, "Poppins", "Semi Bold", ink)
    T(scr, mx+44, 36, "FREE INDIAN RADIO", 8, "Inter", None, mut, ls=1.6)
    x = mx + 210
    for lbl in ("Genres", "Search", "Favorites", "Recent"):
        w = len(lbl) * 7.6 + 30
        T(scr, x, 23, lbl, 13, "Inter", "Medium", mut, w=w, align="center")
        x += w + 10
    E(scr, W-mx-36, 14, 36, 36, fill=surf, stroke=bord, strokeWeight=1)
    icon(scr, "sun" if dark else "moon", W-mx-27, 23, 18, mut, sw=1.8)
    sw = 230 if W > 1000 else 170
    sx = W - mx - 36 - 14 - sw
    R(scr, sx, 14, sw, 36, fill=DSURF2 if dark else SURF2, cornerRadius=18,
      stroke=bord, strokeWeight=1)
    icon(scr, "search", sx+13, 23, 17, mut, sw=1.8)
    T(scr, sx+38, 23, "Search stations", 12, "Inter", None, mut)

def d_player(scr, W, H, dark=False):
    surf, bord = (DSURF, DBORD) if dark else (SURF, BORD)
    ink, mut = (DINK, DMUT) if dark else (INK, MUT)
    w, h = (380, 76) if W > 1000 else (340, 68)
    x, y = W - w - 28, H - h - 24
    R(scr, x, y, w, h, name="MiniPlayer", As=f"{scr}_mp", fill=surf,
      cornerRadius=22, stroke=bord, strokeWeight=1, effects=shadow(12, 30, 0.16))
    station_logo(scr, x+14, y+(h-44)//2, 44, "KF", 4)
    T(scr, x+68, y+18, "Kalai FM", 13.5, "Inter", "Semi Bold", ink, w=160, maxLines=1)
    eq_bars(scr, x+68, y+40, 0.62, ACC if dark else BRAND2)
    T(scr, x+96, y+39, "Ilaiyaraaja — Mellisai", 10.5, "Inter", None, mut,
      w=132, maxLines=1)
    icon(scr, "next", x+w-82, y+(h-22)//2, 22, mut)
    E(scr, x+w-56, y+(h-40)//2, 40, 40, As=f"{scr}_mp_play", fill=ACC,
      effects=shadow(4, 10, 0.25))
    icon(scr, "pause", x+w-45, y+(h-18)//2, 18, ACCINK)

def d_head(scr, x, rx, y, title, action=None, dark=False):
    T(scr, x, y, title, 17, "Poppins", "Semi Bold", DINK if dark else INK)
    if action:
        T(scr, rx-140, y+4, action, 11.5, "Inter", "Semi Bold",
          ACC if dark else BRAND2, w=140, align="right")

def scr_dhome(pos=(0, 0)):
    scr, X, W, H, mx = "d_home", pos[0]*1560, 1440, 1024, 40
    desk(X, 60, "Home — Desktop", scr, W, H)
    d_appbar(scr, W, mx)
    cw = W - 2*mx
    F(scr, mx, 88, cw, 236, name="Hero", fills=grad(("#10533B", "#0B3D2E")),
      cornerRadius=26, clip=True, effects=shadow(14, 34, 0.22))
    E(scr, W-290, 20, 250, 250, fill="#FDE047", opacity=0.13)
    E(scr, W-210, -40, 150, 150, fill="#FFFFFF", opacity=0.07)
    live_chip(scr, mx+32, 112)
    T(scr, mx+32, 148, "Every Indian radio.\nOne tap away.", 33, "Poppins",
      "Semi Bold", "#FDFCF6", lh="118%")
    T(scr, mx+32, 242, "Tamil · Hindi · Malayalam · +5 more", 12.5, "Inter",
      None, "#D8E7DC")
    E(scr, mx+32, 272, 44, 44, As=f"{scr}_hero_play", fill=ACC,
      effects=shadow(5, 12, 0.3))
    icon(scr, "play", mx+32+13.5, 272+13.5, 17, ACCINK)
    T(scr, mx+88, 285, "Start with big fm tamil", 11.5, "Inter", "Medium",
      "#D8E7DC")
    logo_mark(scr, W-mx-56-96, 158, 96)

    d_head(scr, mx, W-mx, 356, "Languages", "See all →")
    xx = mx
    for name, _c, short, bgc, fgc in GENRES:
        xx += lang_chip(scr, xx, 386, name, short, bgc, fgc) + 12

    d_head(scr, mx, W-mx, 456, "Popular now")
    colw = (cw - 40) // 3
    for i, (nm, meta, gi) in enumerate(POPULAR + POPULAR[:2]):
        compact_row(scr, mx+(i % 3)*(colw+20), 486+(i//3)*78, colw, nm, meta, gi,
                    live=(i == 0))

    d_head(scr, mx, W-mx, 668, "Tamil radio", "All 79 →")
    cw6 = (cw - 5*14) // 6
    for i, (nm, meta, gi) in enumerate(TAMIL_RAIL + MORE_TAMIL):
        card_tile(scr, mx+i*(cw6+14), 698, cw6, nm, meta, gi)
    d_player(scr, W, H)
    return scr

def scr_dgenre(pos=(1, 0)):
    scr, X, W, H, mx = "d_gt", pos[0]*1560, 1440, 1024, 40
    desk(X, 60, "Genre — Desktop", scr, W, H)
    d_appbar(scr, W, mx)
    E(scr, mx, 90, 38, 38, As=f"{scr}_back", fill=SURF, stroke=BORD, strokeWeight=1)
    icon(scr, "chevL", mx+11, 101, 16, INK)
    T(scr, mx+50, 92, "Tamil", 24, "Poppins", "Semi Bold", INK)
    T(scr, mx+50, 124, "79 live stations — tap to play", 11.5, "Inter", None, MUT)
    xx = mx
    for name, _c, _s, _b, _f in GENRES:
        xx += chip(scr, xx, 162, name, active=(name == "Tamil")) + 10
    colw = (W - 2*mx - 24) // 2
    for i, (nm, meta, gi, live) in enumerate(TAMIL_LIST):
        compact_row(scr, mx+(i % 2)*(colw+24), 214+(i//2)*78, colw, nm, meta, gi,
                    live=live)
    d_player(scr, W, H)
    return scr

def scr_dst(pos=(2, 0)):
    scr, X, W, H, mx = "d_st", pos[0]*1560, 1440, 1024, 40
    desk(X, 60, "Station — Desktop", scr, W, H)
    d_appbar(scr, W, mx)
    E(scr, mx, 90, 38, 38, As=f"{scr}_back", fill=SURF, stroke=BORD, strokeWeight=1)
    icon(scr, "chevL", mx+11, 101, 16, INK)
    T(scr, mx+50, 101, "Home  /  tamil", 11, "Inter", None, MUT)
    E(scr, W-mx-38, 90, 38, 38, fill=SURF, stroke=BORD, strokeWeight=1)
    icon(scr, "share", W-mx-38+10.5, 101, 17, MUT, sw=1.8)

    F(scr, mx, 148, W-2*mx, 196, name="Hero", fills=grad(("#11543C", "#0B3D2E")),
      cornerRadius=26, clip=True, effects=shadow(14, 34, 0.22))
    E(scr, W-280, 90, 220, 220, fill="#FDE047", opacity=0.13)
    E(scr, -60, 240, 190, 190, fill="#FFFFFF", opacity=0.05)
    station_logo(scr, mx+32, 186, 120, "KF", 4)
    live_chip(scr, W-mx-32-118, 176)
    T(scr, mx+176, 186, "Kalai FM", 30, "Poppins", "Semi Bold", "#FDFCF6")
    T(scr, mx+176, 230, "Tamil · India · 128 kbps MP3", 12.5, "Inter", None,
      "#D8E7DC")
    xx = mx+176
    for t in ("tamil", "melody", "classic", "24/7"):
        w = len(t)*7.2 + 22
        R(scr, xx, 262, w, 26, fill="#FFFFFF", opacity=0.12, cornerRadius=13)
        T(scr, xx, 269, t, 10.5, "Inter", "Medium", "#EDF5EE", w=w, align="center")
        xx += w + 8

    E(scr, mx+32, 372, 56, 56, As=f"{scr}_play", fill=ACC,
      effects=shadow(6, 14, 0.3))
    icon(scr, "play", mx+32+16.5, 372+16.5, 23, ACCINK)
    T(scr, mx+102, 380, "Tap to listen live", 14, "Inter", "Semi Bold", INK)
    T(scr, mx+102, 401, "Free · no sign-up", 11, "Inter", None, MUT)
    E(scr, mx+236, 378, 44, 44, fill=SURF, stroke=BORD, strokeWeight=1)
    icon(scr, "heart", mx+236+12, 390, 20, ROSE, sw=1.8)
    E(scr, mx+292, 378, 44, 44, fill=SURF, stroke=BORD, strokeWeight=1)
    icon(scr, "globe", mx+292+12, 390, 20, MUT, sw=1.7)

    R(scr, mx+380, 372, W-2*mx-380, 60, fill=SURF, cornerRadius=18,
      stroke=BORD, strokeWeight=1)
    icon(scr, "eq", mx+398, 390, 22, BRAND2)
    T(scr, mx+430, 383, "Ilaiyaraaja — Mellisai", 12.5, "Inter", "Semi Bold", INK)
    T(scr, mx+430, 403, "Now playing · via ICY metadata", 9.5, "Inter", None, MUT)
    eq_bars(scr, W-mx-90, 396, 0.8, BRAND2)

    d_head(scr, mx, W-mx, 470, "More tamil stations", "All 79 →")
    cw6 = (W-2*mx - 5*14) // 6
    for i, (nm, meta, gi) in enumerate(MORE_TAMIL + TAMIL_RAIL):
        card_tile(scr, mx+i*(cw6+14), 500, cw6, nm, meta, gi)
    d_player(scr, W, H)
    return scr

def scr_ipad(pos=(3, 0)):
    scr, X, W, H, mx = "t_home", pos[0]*1560, 834, 1194, 24
    cmd("frame.create", {"preset": 'iPad Pro 11"', "x": X, "y": 60,
                         "name": "Home — iPad",
                         "props": {"fill": BG, "clip": True}}, As=scr)
    d_appbar(scr, W, mx)
    cw = W - 2*mx
    F(scr, mx, 88, cw, 216, name="Hero", fills=grad(("#10533B", "#0B3D2E")),
      cornerRadius=26, clip=True, effects=shadow(14, 34, 0.22))
    E(scr, W-230, 20, 210, 210, fill="#FDE047", opacity=0.13)
    live_chip(scr, mx+28, 112)
    T(scr, mx+28, 148, "Every Indian radio.\nOne tap away.", 28, "Poppins",
      "Semi Bold", "#FDFCF6", lh="118%")
    T(scr, mx+28, 232, "Tamil · Hindi · Malayalam · +5 more", 12, "Inter", None,
      "#D8E7DC")
    logo_mark(scr, W-mx-40-88, 152, 88)

    d_head(scr, mx, W-mx, 336, "Languages", "See all →")
    xx = mx
    for name, _c, short, bgc, fgc in GENRES[:4]:
        xx += lang_chip(scr, xx, 366, name, short, bgc, fgc) + 12

    d_head(scr, mx, W-mx, 436, "Popular now")
    colw = (cw - 16) // 2
    for i, (nm, meta, gi) in enumerate(POPULAR):
        compact_row(scr, mx+(i % 2)*(colw+16), 466+(i//2)*78, colw, nm, meta, gi,
                    live=(i == 0))

    d_head(scr, mx, W-mx, 646, "Tamil radio", "All 79 →")
    cw4 = (cw - 3*14) // 4
    for i, (nm, meta, gi) in enumerate(TAMIL_RAIL + MORE_TAMIL[:1]):
        card_tile(scr, mx+i*(cw4+14), 676, cw4, nm, meta, gi)
    d_player(scr, W, H)
    return scr

# ---------------------------------------------------------------- assemble
cmd("file.new", {"name": "Elanjai FM — App Redesign"})
foundations()

cmd("page.add", {"name": "Screens"})
tabs_home   = scr_home()
scr_nowplaying()
tabs_genres = scr_genres()
tabs_gt     = scr_genre_detail()
tabs_search = scr_search()
tabs_fav    = scr_favorites()
tabs_st     = scr_station()
tabs_recent = scr_recent()

for s, cx, cy in [("01 · Home", 0, 26), ("02 · Now Playing — sheet", 500, 26),
                  ("03 · Genres", 1000, 26), ("04 · Genre — Tamil", 1500, 26),
                  ("05 · Search", 0, 1086), ("06 · Favorites", 500, 1086),
                  ("07 · Station — Kalai FM", 1000, 1086),
                  ("08 · Recently Played", 1500, 1086)]:
    caption(cx, cy, s)

cmd("page.add", {"name": "Dark & States"})
scr_states(pos=(0, 0))
scr_home(dark=True, pos=(1, 0))
scr_nowplaying(dark=True, pos=(2, 0))
for s, cx, cy in [("Player & empty states", 0, 26), ("Home — dark", 500, 26),
                  ("Now Playing — dark", 1000, 26)]:
    caption(cx, cy, s)

cmd("page.add", {"name": "Responsive"})
scr_dhome()
scr_dgenre()
scr_dst()
scr_ipad()
for s, cx in [("D1 · Home — Desktop 1440", 0), ("D2 · Genre — Desktop 1440", 1560),
              ("D3 · Station — Desktop 1440", 3120), ("T1 · Home — iPad 834", 4680)]:
    caption(cx, 26, s)

# ---------------- prototype wiring (Screens page)
cmd("page.select", {"index": 1})

def link(a, b, trans=None):
    p = {"id": {"$ref": a}, "dest": {"$ref": b}}
    if trans:
        p["transition"] = {"type": trans[0]}
        if trans[1]:
            p["transition"]["direction"] = trans[1]
        p["durationMs"] = 280
        p["easing"] = "easeOut"
    cmd("proto.interaction.add", p)

# every screen's tab bar routes to the four roots
for tabs in (tabs_home, tabs_genres, tabs_gt, tabs_search, tabs_fav,
             tabs_st, tabs_recent):
    link(tabs["home"], "s_home", ("dissolve", None))
    link(tabs["grid"], "s_genres", ("dissolve", None))
    link(tabs["search"], "s_search", ("dissolve", None))
    link(tabs["heart"], "s_fav", ("dissolve", None))
    # tapping the docked mini player opens Now Playing
    link(f"{tabs['home'].rsplit('_tab_',1)[0]}_mp", "s_np", ("moveIn", "top"))

link("s_home_hero_play", "s_np", ("moveIn", "top"))
link("s_np_back", "s_home", ("moveOut", "bottom"))
link("s_np_upnext", "s_st", ("push", "left"))
link("gtile_tamil", "s_gt", ("push", "left"))
link("gt_back", "s_genres", ("push", "right"))
link("gt_row_live", "s_np", ("moveIn", "top"))
link("st_back", "s_gt", ("push", "right"))
link("st_play", "s_np", ("moveIn", "top"))
link("fav_row_1", "s_np", ("moveIn", "top"))
link("search_field", "s_gt", ("dissolve", None))

cmd("proto.flow.add", {"start": {"$ref": "s_home"}, "name": "App map"})
cmd("proto.settings", {"device": "iPhone 17 Pro"})

out = os.path.join(os.path.dirname(__file__), "elanjai-fm-app.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(C, f, indent=1, ensure_ascii=False)
print(f"{len(C)} commands -> {out}")
