"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAudio } from "./AudioProvider";
import StationLogo from "./StationLogo";

const SLEEP_OPTIONS = [15, 30, 45, 60];

function SleepMenu() {
  const { sleepRemaining, setSleepTimer } = useAudio();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const active = sleepRemaining !== null;
  const mm = active ? Math.floor(sleepRemaining / 60) : 0;
  const ss = active ? String(sleepRemaining % 60).padStart(2, "0") : "00";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Sleep timer"
        aria-expanded={open}
        title={active ? `Sleeping in ${mm}:${ss}` : "Sleep timer"}
        className={`relative rounded-lg p-2 transition hover:bg-surface-2 ${
          active ? "text-brand-2 dark:text-accent" : "text-muted hover:text-ink"
        }`}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2.5M5 3 3 5m16-2 2 2" />
        </svg>
        {active && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-ink">
            {mm}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute bottom-12 right-0 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <p className="border-b border-border px-3 py-2 text-xs font-semibold text-muted">
            Sleep timer {active && <span className="text-brand-2 dark:text-accent">· {mm}:{ss} left</span>}
          </p>
          {SLEEP_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setSleepTimer(m);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-ink transition hover:bg-surface-2"
            >
              {m} minutes
            </button>
          ))}
          {active && (
            <button
              type="button"
              onClick={() => {
                setSleepTimer(null);
                setOpen(false);
              }}
              className="block w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-danger transition hover:bg-surface-2"
            >
              Cancel timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlayerBar() {
  const {
    current, status, error, nowPlaying, toggle, stop, next, prev,
    volume, setVolume, muted, toggleMute, favorites, toggleFavorite,
  } = useAudio();
  const [shared, setShared] = useState(false);
  if (!current) return null;
  const playing = status === "playing";
  const isFav = favorites.has(current.id);

  const share = async () => {
    const url = `${location.origin}/station/${current.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: current.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-50 border-t border-border bg-surface/95 backdrop-blur md:bottom-0">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <StationLogo src={current.favicon} name={current.name} size={44} className="h-11 w-11 shrink-0" />

        {/* Title block: station name + live song / status */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/station/${current.slug}`}
            className="block truncate text-sm font-semibold text-ink hover:text-brand-2"
            title={current.name}
          >
            {current.name}
          </Link>
          <p
            className={`flex items-center gap-1.5 truncate text-xs ${
              status === "error" ? "text-danger" : "text-muted"
            }`}
            title={nowPlaying ?? undefined}
          >
            {status === "error" ? (
              error ?? "Stream unavailable"
            ) : status === "loading" ? (
              "Connecting…"
            ) : playing && nowPlaying ? (
              <>
                <span className="flex h-3 shrink-0 items-end gap-[2px]" aria-hidden>
                  <span className="eq-bar h-full w-[3px] rounded-sm bg-brand-2 dark:bg-accent" />
                  <span className="eq-bar h-full w-[3px] rounded-sm bg-brand-2 dark:bg-accent" />
                  <span className="eq-bar h-full w-[3px] rounded-sm bg-brand-2 dark:bg-accent" />
                </span>
                <span className="truncate font-medium text-ink/80">{nowPlaying}</span>
              </>
            ) : playing ? (
              <>
                <span className="flex h-3 shrink-0 items-end gap-[2px]" aria-hidden>
                  <span className="eq-bar h-full w-[3px] rounded-sm bg-brand-2 dark:bg-accent" />
                  <span className="eq-bar h-full w-[3px] rounded-sm bg-brand-2 dark:bg-accent" />
                  <span className="eq-bar h-full w-[3px] rounded-sm bg-brand-2 dark:bg-accent" />
                </span>
                Live{current.bitrate ? ` · ${current.bitrate}k ${current.codec || ""}` : ""}
              </>
            ) : (
              "Paused"
            )}
          </p>
        </div>

        {/* Skip back */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous station"
          title="Previous station (P)"
          className="hidden rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink sm:block"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        {/* Play / pause */}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md transition hover:brightness-105"
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

        {/* Skip forward */}
        <button
          type="button"
          onClick={next}
          aria-label="Next station"
          title="Next station (N)"
          className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
          </svg>
        </button>

        {/* Favorite */}
        <button
          type="button"
          onClick={() => toggleFavorite(current.id)}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFav}
          className={`hidden rounded-lg p-2 transition hover:bg-surface-2 sm:block ${
            isFav ? "text-rose-500 dark:text-rose-400" : "text-muted hover:text-rose-400"
          }`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7.5-4.9-9.8-9.2C.6 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.2 3.6 3.6 6.8C19.5 16.1 12 21 12 21z" />
          </svg>
        </button>

        <div className="hidden sm:block">
          <SleepMenu />
        </div>

        {/* Mute + volume */}
        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            title="Mute (M)"
            className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            {muted || volume === 0 ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                <path d="m22 9-6 6m0-6 6 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="w-20 accent-brand-2 lg:w-24"
          />
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={share}
          aria-label="Share station"
          title={shared ? "Link copied!" : "Share station"}
          className={`hidden rounded-lg p-2 transition hover:bg-surface-2 md:block ${
            shared ? "text-brand-2 dark:text-accent" : "text-muted hover:text-ink"
          }`}
        >
          {shared ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.6 10.6 6.8-4.2m-6.8 7 6.8 4.2" />
            </svg>
          )}
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={stop}
          aria-label="Stop"
          className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {status === "loading" && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-pulse bg-accent" />
        </div>
      )}
    </div>
  );
}
