"use client";

import Link from "next/link";
import { useState } from "react";
import { useAudio } from "./AudioProvider";
import EqBars from "./EqBars";
import Icon from "./Icon";
import NowPlayingSheet from "./NowPlayingSheet";
import StationLogo from "./StationLogo";

/** Floating mini player docked above the tab bar; expands into the Now Playing sheet. */
export default function PlayerChrome({ total }: { total: number }) {
  const { current, status, error, nowPlaying, toggle, next, play } = useAudio();
  const [open, setOpen] = useState(false);
  if (!current) return open ? <NowPlayingSheet total={total} onClose={() => setOpen(false)} /> : null;

  const playing = status === "playing";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setOpen(true);
        }}
        aria-label="Expand player"
        className="fixed inset-x-4 bottom-[calc(5.375rem+max(0.875rem,env(safe-area-inset-bottom)))] z-40 cursor-pointer md:inset-x-auto md:bottom-6 md:right-6 md:w-[370px]"
      >
        <div className="mx-auto flex h-[68px] max-w-[370px] items-center gap-3 rounded-[22px] border border-border bg-surface px-3 shadow-xl shadow-brand/10">
          <StationLogo src={current.favicon} fallbackSrc={current.faviconAlt} name={current.name} size={44} className="h-11 w-11 shrink-0" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/station/${current.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-[13.5px] font-semibold text-ink hover:text-brand-2"
            >
              {current.name}
            </Link>
            <p
              className={`mt-0.5 flex items-center gap-1.5 truncate text-[10.5px] ${
                status === "error" ? "text-danger" : "text-muted"
              }`}
            >
              {status === "error" ? (
                error ?? "Stream unavailable — retry"
              ) : status === "loading" ? (
                "Connecting…"
              ) : playing ? (
                <>
                  <EqBars />
                  <span className="truncate">{nowPlaying ?? "Live"}</span>
                </>
              ) : (
                "Paused"
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next station"
            className="shrink-0 text-muted transition hover:text-ink"
          >
            <Icon name="next" size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (status === "idle") play(current);
              else toggle();
            }}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md shadow-brand/25 transition hover:brightness-105 active:scale-95"
          >
            {status === "loading" ? (
              <span className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-accent-ink/30 border-t-accent-ink" />
            ) : (
              <Icon name={playing ? "pause" : "play"} size={18} />
            )}
          </button>
        </div>
        {status === "loading" && (
          <div className="mx-auto mt-1 h-0.5 max-w-[340px] overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-1/3 animate-pulse bg-accent" />
          </div>
        )}
      </div>
      {open && <NowPlayingSheet total={total} onClose={() => setOpen(false)} />}
    </>
  );
}
