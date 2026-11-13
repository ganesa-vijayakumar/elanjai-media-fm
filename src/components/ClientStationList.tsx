"use client";

import { useAudio } from "./AudioProvider";
import StationCard from "./StationCard";

/** Renders stations stored client-side (favorites map / recents). */
export default function ClientStationList({ kind }: { kind: "favorites" | "recents" }) {
  const { favoriteStations, recents } = useAudio();
  const list = kind === "favorites" ? favoriteStations : recents;

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
        <p className="text-muted">
          {kind === "favorites"
            ? "No favorites yet — tap the heart on any station."
            : "Nothing played yet — pick a station to get started."}
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {list.map((s) => (
        <StationCard key={s.id} station={s} />
      ))}
    </div>
  );
}
