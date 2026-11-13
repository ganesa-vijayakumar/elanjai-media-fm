"use client";

import Link from "next/link";
import type { PublicStation } from "@/lib/types";
import { useAudio } from "./AudioProvider";
import EqBars from "./EqBars";
import PlayButton from "./PlayButton";
import StationLogo from "./StationLogo";

/** Compact list row — logo, title, meta (or "Playing now"), play badge. */
export default function StationRow({
  station,
  trailing,
}: {
  station: PublicStation;
  trailing?: React.ReactNode;
}) {
  const { current, status } = useAudio();
  const isCurrent = current?.id === station.id;
  const playing = isCurrent && status === "playing";

  return (
    <div
      className={`relative flex items-center gap-3 rounded-[18px] border bg-surface px-2.5 py-2 transition hover:border-brand-2/50 ${
        isCurrent ? "border-brand-2/40" : "border-border"
      }`}
    >
      <Link
        href={`/station/${station.slug}`}
        className="absolute inset-0 rounded-[18px]"
        aria-label={station.name}
      />
      <StationLogo src={station.favicon} fallbackSrc={station.faviconAlt} name={station.name} size={44} className="h-11 w-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-ink">{station.name}</p>
        {playing ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] font-medium text-brand-2 dark:text-accent">
            <EqBars /> Playing now
          </p>
        ) : (
          <p className="mt-0.5 truncate text-[10.5px] capitalize text-muted">
            {station.genre}
            {station.bitrate ? ` · ${station.bitrate} kbps` : ` · ${station.country}`}
          </p>
        )}
      </div>
      {trailing}
      <PlayButton station={station} size={32} className="relative z-10 shrink-0" />
    </div>
  );
}
