"use client";

import { useAudio } from "./AudioProvider";
import Icon from "./Icon";
import StationRow from "./StationRow";

function relTime(at?: number): string | null {
  if (!at) return null;
  const m = Math.floor((Date.now() - at) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return d <= 1 ? "Yesterday" : `${d} d`;
}

/** Renders stations stored client-side (favorites map / recents). */
export default function ClientStationList({ kind }: { kind: "favorites" | "recents" }) {
  const { favoriteStations, recents, clearRecents } = useAudio();
  const list = kind === "favorites" ? favoriteStations : recents;

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[22px] border border-dashed border-border bg-surface px-6 py-12 text-center">
        <Icon
          name={kind === "favorites" ? "heart" : "clock"}
          size={34}
          strokeWidth={1.6}
          className="text-muted"
        />
        <p className="mt-4 font-display text-sm font-semibold text-ink">
          {kind === "favorites" ? "No favorites yet" : "Nothing played yet"}
        </p>
        <p className="mt-1.5 text-[11px] text-muted">
          {kind === "favorites"
            ? "Tap the heart on any station and it lands here."
            : "Pick a station to get started."}
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {list.map((s) => (
          <StationRow
            key={s.id}
            station={s}
            trailing={
              kind === "recents" && relTime(s.playedAt) ? (
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted">
                  <Icon name="clock" size={13} strokeWidth={1.8} />
                  {relTime(s.playedAt)}
                </span>
              ) : kind === "favorites" ? (
                <Icon name="heartF" size={18} className="shrink-0 text-rose" />
              ) : undefined
            }
          />
        ))}
      </div>
      {kind === "favorites" ? (
        <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-accent-soft px-4 py-3.5">
          <Icon name="heart" size={20} className="shrink-0 text-accent-ink" />
          <div>
            <p className="text-[12px] font-medium text-accent-ink">
              Tap ♡ on any station to keep it here.
            </p>
            <p className="mt-0.5 text-[10px] text-accent-ink/70">
              Favorites never leave your device.
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={clearRecents}
          className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-[14px] bg-surface-2 py-3 text-[12.5px] font-semibold text-muted transition hover:text-ink"
        >
          <Icon name="x" size={15} /> Clear history
        </button>
      )}
    </div>
  );
}
