import stationsJson from "../../data/stations.json";
import genresJson from "../../data/genres.json";
import type { Genre, PublicStation, Station } from "./types";

const stations = stationsJson as Station[];
const genres = genresJson as Genre[];

/**
 * Streams served over plain http:// cannot be loaded from an https page
 * (mixed content), and some endpoints set hostile CORS headers. Both cases
 * go through our same-origin /api/stream proxy — same trick as the
 * `private-stream` proxy used by tamilradios.com.
 */
export function playableUrl(streamUrl: string): string {
  if (streamUrl.startsWith("http://")) {
    return `/api/stream?u=${Buffer.from(streamUrl).toString("base64url")}`;
  }
  return streamUrl;
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
  };
}

export const getStations = () => stations.filter((s) => s.is_active);
export const getGenres = () => genres;
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
