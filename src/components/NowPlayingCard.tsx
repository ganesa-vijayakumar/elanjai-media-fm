"use client";

import type { PublicStation } from "@/lib/types";
import { useAudio } from "./AudioProvider";
import EqBars from "./EqBars";
import Icon from "./Icon";

/** "Now playing · via ICY metadata" card on the station page. */
export default function NowPlayingCard({ station }: { station: PublicStation }) {
  const { current, status, nowPlaying } = useAudio();
  const isCurrent = current?.id === station.id;
  const playing = isCurrent && status === "playing";

  return (
    <div className="flex items-center gap-3.5 rounded-[18px] border border-border bg-surface px-4 py-3.5">
      <Icon name="eq" size={24} className="shrink-0 text-brand-2 dark:text-accent" />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
          Now playing
        </p>
        <p className="mt-0.5 truncate text-[12.5px] font-semibold text-ink">
          {isCurrent
            ? status === "error"
              ? "Stream unavailable — tap play to retry"
              : status === "loading"
                ? "Connecting…"
                : playing
                  ? (nowPlaying ?? "Live")
                  : "Paused"
            : "Tap play to hear what's on"}
        </p>
      </div>
      {playing && <EqBars />}
    </div>
  );
}
