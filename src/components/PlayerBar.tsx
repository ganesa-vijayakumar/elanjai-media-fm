"use client";

import Link from "next/link";
import { useAudio } from "./AudioProvider";
import StationLogo from "./StationLogo";

export default function PlayerBar() {
  const { current, status, error, toggle, stop, volume, setVolume } = useAudio();
  if (!current) return null;
  const playing = status === "playing";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-3 px-4">
        <StationLogo src={current.favicon} name={current.name} size={44} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/station/${current.slug}`}
            className="block truncate text-sm font-semibold text-zinc-100 hover:text-emerald-400"
          >
            {current.name}
          </Link>
          <p className={`truncate text-xs ${status === "error" ? "text-red-400" : "text-zinc-500"}`}>
            {status === "error"
              ? error ?? "Stream unavailable"
              : status === "loading"
                ? "Connecting…"
                : `${current.language} · live`}
          </p>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 transition hover:bg-emerald-400"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
            <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="w-24 accent-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={stop}
          aria-label="Stop"
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {status === "loading" && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-pulse bg-emerald-500" />
        </div>
      )}
    </div>
  );
}
