"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicStation } from "@/lib/types";
import { useAudio } from "./AudioProvider";
import EqBars from "./EqBars";
import Icon from "./Icon";
import LiveBadge from "./LiveBadge";
import StationLogo from "./StationLogo";

const SLEEP_OPTIONS = [15, 30, 45, 60];

function SleepCircle() {
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
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition ${
          active ? "text-brand-2 dark:text-accent" : "text-muted hover:text-ink"
        }`}
      >
        <Icon name="moon" size={20} strokeWidth={1.8} />
        {active && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-ink">
            {mm}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute bottom-12 left-1/2 z-10 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
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

/** Full-screen bottom sheet — artwork, transport, actions, volume, up next. */
export default function NowPlayingSheet({
  total,
  onClose,
}: {
  total: number;
  onClose: () => void;
}) {
  const {
    current, status, error, nowPlaying, toggle, stop, next, prev,
    volume, setVolume, muted, toggleMute, favorites, toggleFavorite, peekNext,
  } = useAudio();
  const [upNext, setUpNext] = useState<PublicStation | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let live = true;
    peekNext().then((s) => {
      if (live) setUpNext(s);
    });
    return () => {
      live = false;
    };
  }, [peekNext, current?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!current) return null;
  const playing = status === "playing";
  const isFav = favorites.has(current.id);
  const vol = muted ? 0 : volume;

  const share = async () => {
    const url = `${location.origin}/station/${current.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: current.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Now playing">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fade-in absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div className="sheet-in absolute inset-x-0 bottom-0 max-h-[94dvh] overflow-y-auto rounded-t-[26px] bg-bg pb-[max(1.5rem,env(safe-area-inset-bottom))] md:inset-x-1/2 md:bottom-6 md:max-h-[calc(100dvh-3rem)] md:w-[min(92vw,34rem)] md:-translate-x-1/2 md:rounded-[26px] md:border md:border-border md:shadow-2xl">
        <div className="mx-auto w-full max-w-md px-4 pt-3">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border md:hidden" />
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={onClose}
              aria-label="Collapse player"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-ink"
            >
              <Icon name="chevD" size={16} />
            </button>
            <p className="absolute inset-x-0 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              Now playing
            </p>
            <button
              type="button"
              onClick={() => {
                stop();
                onClose();
              }}
              aria-label="Stop playback"
              title="Stop"
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-danger"
            >
              <Icon name="x" size={15} />
            </button>
          </div>

          <div className="mt-5 flex justify-center">
            <StationLogo
              src={current.favicon}
              name={current.name}
              size={280}
              className="h-auto w-full max-w-[280px] rounded-[30px] shadow-2xl shadow-brand/30"
            />
          </div>

          <div className="mt-4 flex justify-center">
            <LiveBadge count={total} />
          </div>
          <h2 className="mt-3 truncate text-center font-display text-2xl font-semibold text-ink">
            {current.name}
          </h2>
          <p className="mt-1 text-center text-[12.5px] capitalize text-muted">
            {current.language} · {current.bitrate ? `${current.bitrate} kbps ` : ""}
            {current.codec || "MP3"}
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3">
            <Icon name="eq" size={22} className="shrink-0 text-brand-2 dark:text-accent" />
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-ink">
                {status === "error"
                  ? error ?? "Stream unavailable"
                  : status === "loading"
                    ? "Connecting…"
                    : playing
                      ? (nowPlaying ?? "Live")
                      : "Paused"}
              </p>
              <p className="mt-0.5 text-[9.5px] text-muted">
                {status === "error" ? "Tap play to retry" : "Now playing · via ICY metadata"}
              </p>
            </div>
            {playing && !nowPlaying && <EqBars className="ml-auto" />}
          </div>

          {/* Transport */}
          <div className="mt-5 flex items-center justify-center gap-9">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous station"
              className="text-ink transition hover:text-brand-2 dark:hover:text-accent"
            >
              <Icon name="prev" size={34} />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg shadow-brand/30 transition hover:brightness-105 active:scale-95"
            >
              {status === "loading" ? (
                <span className="block h-7 w-7 animate-spin rounded-full border-2 border-accent-ink/30 border-t-accent-ink" />
              ) : (
                <Icon name={playing ? "pause" : "play"} size={26} />
              )}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next station"
              className="text-ink transition hover:text-brand-2 dark:hover:text-accent"
            >
              <Icon name="next" size={34} />
            </button>
          </div>

          {/* Secondary actions */}
          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => toggleFavorite(current.id)}
              aria-pressed={isFav}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition ${
                isFav ? "text-rose" : "text-muted hover:text-rose"
              }`}
            >
              <Icon name={isFav ? "heartF" : "heart"} size={20} strokeWidth={1.8} />
            </button>
            <SleepCircle />
            <button
              type="button"
              onClick={share}
              aria-label="Share station"
              title={shared ? "Link copied!" : "Share station"}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition ${
                shared ? "text-brand-2 dark:text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <Icon name={shared ? "check" : "share"} size={18} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition ${
                muted ? "text-brand-2 dark:text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <Icon name={muted ? "x" : "vol"} size={18} strokeWidth={1.8} />
            </button>
          </div>

          {/* Volume */}
          <div className="mt-6 flex items-center gap-3.5">
            <Icon name="vol" size={18} className="shrink-0 text-muted" strokeWidth={1.8} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={vol}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="vol w-full"
              style={{ "--fill": `${vol * 100}%` } as React.CSSProperties}
            />
            <Icon name="vol" size={18} className="shrink-0 text-ink" strokeWidth={1.8} />
          </div>

          {/* Up next */}
          {upNext && (
            <>
              <p className="mt-6 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                Up next
              </p>
              <button
                type="button"
                onClick={next}
                className="mt-2 flex w-full items-center gap-3 rounded-[14px] border border-border bg-surface px-2.5 py-2 text-left transition hover:border-brand-2/50"
              >
                <StationLogo src={upNext.favicon} name={upNext.name} size={32} className="h-8 w-8 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-ink">
                    {upNext.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[9.5px] capitalize text-muted">
                    {upNext.genre} {upNext.bitrate ? `· ${upNext.bitrate}k` : ""}
                  </span>
                </span>
                <Icon name="chevR" size={18} className="text-muted" />
              </button>
            </>
          )}
          <p className="mt-5 text-center text-[10px] text-muted">
            <Link href={`/station/${current.slug}`} onClick={onClose} className="font-medium text-brand-2 underline-offset-2 hover:underline dark:text-accent">
              Open station page →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
