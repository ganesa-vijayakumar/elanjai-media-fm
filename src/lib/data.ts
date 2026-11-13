import stationsJson from "../../data/stations.json";
import genresJson from "../../data/genres.json";
import localLogosJson from "../../data/local-logos.json";
import type { Genre, PublicStation, Station } from "./types";

const stations = stationsJson as Station[];
const genres = genresJson as Genre[];

/**
 * All playback goes through our same-origin /api/stream proxy — the same
 * `private-stream` trick tamilradios.com uses. It normalizes http/https,
 * dodges hostile CORS on hls.js XHR fetches, rewrites HLS manifests, and
 * keeps broadcaster origins hidden from the page.
 */
export function playableUrl(streamUrl: string): string {
  return `/api/stream?u=${Buffer.from(streamUrl).toString("base64url")}`;
}

const localLogos = localLogosJson as Record<string, string>;

export function toPublic(s: Station): PublicStation {
  const local = localLogos[s.slug];
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    genre: s.genre,
    language: s.language,
    country: s.country,
    codec: s.codec,
    bitrate: s.bitrate,
    favicon: local ?? s.favicon,
    faviconAlt: local ? s.favicon : undefined,
    votes: s.votes,
    stream: playableUrl(s.stream_url),
    hls: /\.m3u8?($|\?)/i.test(s.stream_url),
  };
}

/** Canonical language ordering — priority languages first, rest alphabetical. */
const GENRE_ORDER = [
  "india",
  "tamil",
  "hindi",
  "telugu",
  "malayalam",
  "kannada",
  "punjabi",
];

export const getStations = () => stations.filter((s) => s.is_active);
export const getGenres = () => {
  const live = new Map<string, number>();
  for (const s of getStations()) live.set(s.genre, (live.get(s.genre) ?? 0) + 1);
  return genres
    .map((g) => ({ ...g, count: live.get(g.slug) ?? 0 }))
    .sort((a, b) => {
      const ia = GENRE_ORDER.indexOf(a.slug);
      const ib = GENRE_ORDER.indexOf(b.slug);
      if (ia !== -1 || ib !== -1)
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.name.localeCompare(b.name);
    });
};
export const getGenre = (slug: string) =>
  getGenres().find((g) => g.slug === slug) ?? null;

export const getStationBySlug = (slug: string) =>
  getStations().find((s) => s.slug === slug) ?? null;

/**
 * Ranking = popularity × quality × reliability:
 *  - popularity: listener votes
 *  - quality:    stream bitrate, capped at 192k → up to +37.5%
 *  - reliability: https transport +5%, known codec & bitrate +5%
 */
const rankScore = (s: Station) => {
  const quality = Math.min(s.bitrate ?? 0, 192) / 512;
  const https = s.stream_url.startsWith("https") ? 0.05 : 0;
  const known = s.codec !== "UNKNOWN" && s.bitrate > 0 ? 0.05 : 0;
  return s.votes * (1 + quality + https + known);
};

export const rankStations = (list: Station[]) =>
  [...list].sort((a, b) => rankScore(b) - rankScore(a));

export const getStationsByGenre = (genre: string) =>
  rankStations(getStations().filter((s) => s.genre === genre));

export const getFeatured = (n = 18) => rankStations(getStations()).slice(0, n);

export const getRelated = (station: Station, n = 8) =>
  getStationsByGenre(station.genre)
    .filter((s) => s.slug !== station.slug)
    .slice(0, n);

export function searchStations(q: string): Station[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return rankStations(getStations()).filter(
    (s) =>
      s.name.toLowerCase().includes(needle) ||
      s.genre.includes(needle) ||
      s.tags.some((t) => t.toLowerCase().includes(needle)) ||
      s.language.toLowerCase().includes(needle)
  );
}
