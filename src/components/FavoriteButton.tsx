"use client";

import { useAudio } from "./AudioProvider";
import Icon from "./Icon";

/** Bordered-circle favorite toggle (design action button). */
export default function FavoriteButton({
  id,
  size = 44,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const { favorites, toggleFavorite } = useAudio();
  const on = favorites.has(id);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      title={on ? "Remove from favorites" : "Add to favorites"}
      className={`flex items-center justify-center rounded-full border transition hover:border-rose/60 ${
        on
          ? "border-rose/40 bg-rose/10 text-rose"
          : "border-border bg-surface text-muted hover:text-rose"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon name={on ? "heartF" : "heart"} size={size * 0.48} />
    </button>
  );
}
