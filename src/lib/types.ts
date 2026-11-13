export type Station = {
  id: string;
  name: string;
  slug: string;
  stream_url: string;
  homepage: string;
  favicon: string;
  genre: string;
  language: string;
  country: string;
  codec: string;
  bitrate: number;
  votes: number;
  tags: string[];
  is_active: boolean;
};

export type Genre = {
  slug: string;
  name: string;
  count: number;
};

export type PublicStation = Pick<
  Station,
  | "id"
  | "name"
  | "slug"
  | "genre"
  | "language"
  | "country"
  | "codec"
  | "bitrate"
  | "favicon"
  | "votes"
> & { stream: string; hls: boolean; playedAt?: number };
