"use client";

import { useAudio } from "./AudioProvider";
import type { PublicStation } from "@/lib/types";

export default function PlayButton({
  station,
  size = 44,
  className = "",
}: {
  station: PublicStation;
  size?: number;
  className?: string;
}) {
  const { current, status, play, toggle } = useAudio();
  const isCurrent = current?.id === station.id;
  const playing = isCurrent && status === "playing";
  const loading = isCurrent && status === "loading";

  return (
    <button
      type="button"
      aria-label={playing ? `Pause ${station.name}` : `Play ${station.name}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCurrent) toggle();
        else play(station);
      }}
      className={`flex items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-400 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
    >
      {loading ? (
        <span
          className="block animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-900"
          style={{ width: size * 0.45, height: size * 0.45 }}
        />
      ) : playing ? (
        <svg viewBox="0 0 24 24" width={size * 0.45} height={size * 0.45} fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={size * 0.45} height={size * 0.45} fill="currentColor">
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
      )}
    </button>
  );
}
