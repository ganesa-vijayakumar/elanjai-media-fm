import stationsJson from "../../data/stations.json";
import genresJson from "../../data/genres.json";
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

export function toPublic(s: Station): PublicStation {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    genre: s.genre,
    language: s.language,
    country: s.country,
    codec: s.codec,
    bitrate: s.bitrate,
    favicon: s.favicon,
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
export const getGenres = () =>
  [...genres].sort((a, b) => {
    const ia = GENRE_ORDER.indexOf(a.slug);
    const ib = GENRE_ORDER.indexOf(b.slug);
    if (ia !== -1 || ib !== -1)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.name.localeCompare(b.name);
  });
export const getGenre = (slug: string) =>
  genres.find((g) => g.slug === slug) ?? null;

export const getStationBySlug = (slug: string) =>
  getStations().find((s) => s.slug === slug) ?? null;

export const getStationsByGenre = (genre: string) =>
  getStations().filter((s) => s.genre === genre);

export const getFeatured = (n = 18) =>
  [...getStations()].sort((a, b) => b.votes - a.votes).slice(0, n);

export const getRelated = (station: Station, n = 8) =>
  getStationsByGenre(station.genre)
    .filter((s) => s.slug !== station.slug)
    .slice(0, n);

export function searchStations(q: string): Station[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return getStations().filter(
    (s) =>
      s.name.toLowerCase().includes(needle) ||
      s.genre.includes(needle) ||
      s.tags.some((t) => t.toLowerCase().includes(needle)) ||
      s.language.toLowerCase().includes(needle)
  );
}
