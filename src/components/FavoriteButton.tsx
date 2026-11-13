"use client";

import { useAudio } from "./AudioProvider";

export default function FavoriteButton({ id }: { id: string }) {
  const { favorites, toggleFavorite } = useAudio();
  const on = favorites.has(id);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      className={`rounded-full p-2 transition ${
        on ? "text-rose-400" : "text-zinc-500 hover:text-rose-300"
      }`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7.5-4.9-9.8-9.2C.6 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.2 3.6 3.6 6.8C19.5 16.1 12 21 12 21z" />
      </svg>
    </button>
  );
}
