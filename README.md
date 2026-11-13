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
- Station catalog: `data/stations.json` (seeded from the radio-browser community DB)

## Features

- Home page with featured + per-language sections
- 293 static station pages (`/station/<slug>`) with `RadioStation` + `BreadcrumbList` JSON-LD
- Genre landing pages (`/genre/<slug>`)
- Search (`/search?q=`)
- Favorites + recently played (localStorage, `/favorites`, `/recent`)
- Persistent bottom player — play/pause, volume, Media Session keys
- JSON API: `GET /api/stations`, `GET /api/stations?genre=tamil&q=`, `GET /api/stations/<slug>`
- HTTPS stream proxy `GET /api/stream?u=<base64url>` — allowlisted to catalog URLs,
  forwards ICY metadata headers, fixes mixed-content for `http://` streams
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

Stream endpoints die and move often; a periodic health-check that flips `is_active`
is the natural next step (see `docs/` roadmap below if present).

## Legal note

Station names, logos and streams belong to their owners. The directory links to
publicly published streams and honors removal requests via the DMCA page.
