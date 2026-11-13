import Link from "next/link";
import type { PublicStation } from "@/lib/types";
import PlayButton from "./PlayButton";
import StationLogo from "./StationLogo";

export default function StationCard({ station }: { station: PublicStation }) {
  return (
    <div className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-brand-2/60 hover:shadow-lg hover:shadow-brand/10">
      <Link
        href={`/station/${station.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={station.name}
      />
      <div className="relative">
        <StationLogo src={station.favicon} name={station.name} size={88} className="h-22 w-22" />
        <div className="absolute -bottom-2 -right-2 z-10 transition group-hover:scale-110">
          <PlayButton station={station} size={38} />
        </div>
      </div>
      <div className="w-full text-center">
        <p className="truncate text-sm font-semibold text-ink">{station.name}</p>
        <p className="mt-0.5 truncate text-xs capitalize text-muted">
          {station.genre} {station.bitrate ? `· ${station.bitrate}k` : ""}
        </p>
      </div>
    </div>
  );
}
