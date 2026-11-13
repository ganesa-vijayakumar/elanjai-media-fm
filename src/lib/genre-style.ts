/** Pastel bg + saturated fg pair per language (design "genre tiles"). */
export const GENRE_STYLE: Record<string, { bg: string; fg: string; short: string }> = {
  tamil:     { bg: "#FFE9D6", fg: "#C2410C", short: "Ta" },
  hindi:     { bg: "#E0F2FE", fg: "#0369A1", short: "Hi" },
  malayalam: { bg: "#DCFCE7", fg: "#15803D", short: "Ma" },
  punjabi:   { bg: "#EDE9FE", fg: "#6D28D9", short: "Pu" },
  telugu:    { bg: "#FCE7F3", fg: "#BE185D", short: "Te" },
  urdu:      { bg: "#CCFBF1", fg: "#0F766E", short: "Ur" },
  kannada:   { bg: "#FEF3C7", fg: "#B45309", short: "Ka" },
  india:     { bg: "#F5F2E4", fg: "#3F6212", short: "In" },
};

export function genreStyle(slug: string) {
  return (
    GENRE_STYLE[slug] ?? {
      bg: "#E5E7EB",
      fg: "#374151",
      short: slug.slice(0, 1).toUpperCase() + slug.slice(1, 2),
    }
  );
}
