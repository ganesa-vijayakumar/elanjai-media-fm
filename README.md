# Elanjai Media FM

Free online radio directory — 290+ live Indian stations (Tamil, Hindi, Malayalam,
Telugu, Kannada, Punjabi, Urdu and more), playable instantly in the browser.

Modeled on how directories like tamilradios.com / radiosindia.com work: broadcasters
already publish public streams (Shoutcast / Icecast / HLS); this app catalogs those
endpoints and adds search, genres, a persistent player and SEO landing pages. No audio
is hosted or re-encoded — the browser connects to the broadcaster's own stream
(or to our thin `/api/stream` proxy when a station only serves plain `http://`).

## Stack

- **Next.js 16** (App Router, Turbopack, Cache Components, React Server Components)
- **React 19**, TypeScript, Tailwind CSS 4
- **hls.js** for `.m3u8` streams (lazy-loaded only when needed)
- Station catalog: `data/stations.json` (seeded from the radio-browser community DB,
  health-checked — dead stations are marked `is_active: false`)

## Design

- Theme tokens in `globals.css` — dark green primary (`--brand`), light yellow
  accent (`--accent`), white/black neutrals
- Light / dark / system theme with a header toggle (`data-theme`, persisted to
  localStorage, no flash-of-wrong-theme)
- Mobile-first: bottom tab bar (Home / Genres / Search / Favorites), the player
  docks above it; desktop gets a full top nav instead
- Live equalizer indicator in the player bar while a stream plays

## Features

- Home page with hero + featured + per-language sections
- 283 static station pages (`/station/<slug>`) with `RadioStation` + `BreadcrumbList` JSON-LD
- Genre landing pages (`/genre/<slug>`) + `/genres` index
- Search (`/search?q=`)
- Favorites + recently played (localStorage, `/favorites`, `/recent`)
- Persistent bottom player — play/pause, volume, Media Session keys, 12s
  connect watchdog with clear offline errors
- JSON API: `GET /api/stations`, `GET /api/stations?genre=tamil&q=`, `GET /api/stations/<slug>`
- Same-origin stream proxy `GET /api/stream?u=<base64url>` — **all** playback
  goes through it (like tamilradios' `private-stream`): fixes mixed content for
  `http://` streams, dodges CORS for `hls.js`, forwards ICY metadata headers,
  and **rewrites HLS manifests** so playlists + segments stay same-origin.
  Origin-allowlisted to catalog hosts (not an open proxy).
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, PWA icon
- Add-station / DMCA / About pages

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 300+ prerendered pages
npm run start   # production server
npm run lint
```

## Refreshing the catalog

The seed data lives in `data/stations.json`. To regenerate from radio-browser:

```bash
# fetch per-language dumps, merge, dedupe, slugify — see scripts/make_seed.py
python scripts/make_seed.py
```

Stream endpoints die and move often. Re-run the health check periodically:

```bash
python scripts/healthcheck.py   # flips is_active=false on dead streams
```

## Legal note

Station names, logos and streams belong to their owners. The directory links to
publicly published streams and honors removal requests via the DMCA page.
