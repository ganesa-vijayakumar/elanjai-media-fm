# Elanjai FM — Responsive Redesign

A compact, app-native redesign of Elanjai Media FM for phones, tablets and
desktops. Dark forest green + warm yellow on cream; rounded cards; floating
chrome. Breakpoints follow Tailwind defaults — mobile is the base layer.

## Files

| Path | Contents |
|---|---|
| `assets/elanjai-logo.png` | ELANJAI pin brand mark — placed as an image fill on rounded tiles (`logo_mark`); used as app icon, nav-bar mark and Home hero artwork. |
| `elanjai-fm-app.figcraft` | The design file — open with the FigCraft desktop app. Contains a prototype flow ("App map") set to iPhone 17 Pro, 402×874. |
| `screens/*.png` | 2x renders of the 8 light-theme phone screens |
| `screens/dark/*.png` | Dark theme + player/empty-state variants |
| `screens/responsive/*.png` | Desktop 1440 (Home / Genre / Station) + iPad 834 (Home) |
| `screens/foundations.png` | Design-system sheet (colors, type, radii, icons, components) |
| `scripts/build.py` | Generator — emits the FigCraft command JSON below |
| `scripts/elanjai-fm-app.json` | ~1300 command batch executed by `figcraft-cli` |

Regenerate:

```bash
cd design/scripts
python build.py
"/c/Program Files/FigCraft/figcraft-cli.exe" run elanjai-fm-app.json --out ../elanjai-fm-app.figcraft
```

## Screen inventory

8 light screens, 3 dark/state screens, 1 foundations sheet:

1. **Home** — greeting hero ("Every Indian radio. One tap away."), language
   chips rail, "Popular now" card rail, Tamil section header, station rows,
   mini player, floating tab bar.
2. **Now Playing** — full sheet: large artwork, live badge, station meta,
   metadata line (eq icon + ICY "now playing"), transport (prev / play /
   next), secondary actions (favorite, sleep timer, share, cast), volume
   slider, up-next card. Sheet dismisses via chevron.
3. **Genres** — "Browse by language", 2-col pastel tile grid (8 languages
   w/ station counts), bottom-docked list row.
4. **Genre — Tamil** — chip filter row, station list rows with play buttons,
   playing row shows pause + "Playing now" label.
5. **Search** — search field with clear (x), recent-search chips, "Trending
   now" numbered list.
6. **Favorites** — saved stations w/ heart-filled icons + play buttons,
   empty-state hint card.
7. **Station — Kalai FM** — deep-green hero card (logo, name, meta, tag
   chips, live badge), "Tap to listen live" CTA, favorite + website actions,
   now-playing metadata card, "More Tamil stations" rail.
8. **Recently Played** — timestamped rows (clock icon + relative time),
   clear-history button.

Dark & States: Home dark, Now Playing dark, Player & Empty States
(buffering / error / empty favorites / no search results).

**Responsive page** — how the system stretches:

- **Desktop 1440 (Home, Genre, Station)** — app bar carries the nav links
  (Genres · Search · Favorites · Recent) + a search field; the floating tab
  bar disappears. Hero stays one wide banner with a bigger mark and headline.
  Popular rows go 3-col, genre station lists 2-col, station cards 6-col.
  The mini player becomes a floating card docked bottom-right (380×76).
- **iPad 834 (Home)** — same desktop chrome; grids drop to 2-col rows /
  4-col cards; player card 340×68.
- **Phone (<768)** — unchanged: pill tab bar + stacked mini player,
  single-column rows, 2-col genre tiles.

## Design system

### Color

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FCFCF6` | `#07130C` | page |
| `surface` | `#FFFFFF` | `#0E2015` | cards |
| `surface-2` | `#F5F2E4` | `#15301F` | chips, pressed |
| `border` | `#E9E5D3` | `#1F4230` | hairlines |
| `ink` | `#10241A` | `#F0F6F2` | text |
| `muted` | `#5F7268` | `#8FAE9C` | secondary text |
| `brand` | `#0B3D2E` | — | primary fills, hero |
| `brand-2` | `#0F5138` | — | interactive green |
| `accent` | `#FDE047` | — | play buttons, CTAs, active tab pill |
| `accent-soft` | `#FEF9C3` | — | highlights, hint cards |
| `accent-ink` | `#2A2300` | — | text/icons on accent |
| `rose` | `#E11D48` | — | favorites heart |

Genre tiles: one pastel bg + saturated fg pair per language (Tamil, Hindi,
Malayalam, Punjabi, Telugu, Urdu, Kannada, India).

### Type

- **Poppins Bold 30** — display ("Every Indian radio.")
- **Poppins SemiBold 20** — page titles, hero station name
- **Inter SemiBold 13.5–15** — card/row titles, buttons
- **Inter Regular 10.5–12** — meta lines
- **Inter SemiBold 10**, letter-spaced — eyebrows ("LIVE · 293 STATIONS")

Current app uses Geist; the design specifies Poppins display + Inter UI —
map to `next/font/google` when implementing.

### Shape & spacing

- Phone 402×874, iPad 834×1194, Desktop 1440×1024
- Page padding 16 (phone) / 24 (iPad) / 40 (desktop); card gap 12,
  section gap 32
- Radii: chip 16 · card 20 · sheet 26 · pill full
- Floating chrome: phone = mini player 68h above a 64h tab pill;
  tablet/desktop = 380×76 player card bottom-right, nav moves to app bar
- Tap targets ≥ 44px

### Breakpoints

| Token | Width | Layout |
|---|---|---|
| base | < 768px | app-column `max-w-2xl`, tab bar + stacked mini player, 1–2 col |
| `md` | ≥ 768px | app-bar nav replaces tab bar, 2-col rows, player card bottom-right |
| `lg` | ≥ 1024px | `max-w-4xl`, 3-col rows on home |
| `xl` | ≥ 1280px | `max-w-6xl`, 4-col genre tiles, 6-col card rails |

### Iconography

Hand-drawn 24px vectors, round caps, 1.9 stroke; transport icons filled.
~29 glyphs: home, grid, search, heart (line + filled), clock, play, pause,
next, prev, note, radio, live, moon, sun, share, volume, x, chevrons,
star, globe, plus, headphones, dots, check, wifi, eq, cast.

Every glyph's bounding box is recentered on (12, 12) at build time
(`recenter()` in `build.py`) — place an icon's 24×24 box centered in its
button and the glyph will sit exactly in the middle.

### Components

- **Station logo** — rounded square, per-station gradient + initials;
  mirrors existing `StationLogo` fallback behavior
- **Station card** — 114w logo card w/ name + meta + corner play badge
- **List row** — 62h: logo, title, meta, play/pause button
- **Mini player** — logo, title, eq-bars + metadata, prev + play/pause
- **Tab bar** — floating pill; active tab gets accent pill behind icon
- **Genre tile** — pastel card, letter badge, name, count
- **Chip** — filter/recent-search pill; active = accent fill

## Mapping to the codebase

- Tab bar → `src/components/TabBar.tsx` (hidden `md:`+)
- App-bar nav links → `src/components/NavLinks.tsx` (visible `md:`+)
- Mini player → `src/components/PlayerChrome.tsx` (bottom-right card `md:`+);
  expands to `src/components/NowPlayingSheet.tsx`
- Genre tiles → `src/app/genres/page.tsx` + `src/app/genres.json` counts
- Station rows/cards → `StationCard`/`StationRow` under `src/components/`
- Theme tokens → Tailwind v4 tokens in `globals.css` (`@theme`)
- Live badge count → `is_active` stations count from `data/stations.json`
