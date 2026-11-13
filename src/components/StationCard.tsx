import Link from "next/link";
import type { PublicStation } from "@/lib/types";
import PlayButton from "./PlayButton";
import StationLogo from "./StationLogo";

export default function StationCard({ station }: { station: PublicStation }) {
  return (
    <div className="group relative flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-emerald-500/40 hover:bg-zinc-900">
      <Link
        href={`/station/${station.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={station.name}
      />
      <div className="relative">
        <StationLogo src={station.favicon} name={station.name} size={88} className="h-22 w-22" />
        <div className="absolute -bottom-2 -right-2 z-10 opacity-95 transition group-hover:scale-110">
          <PlayButton station={station} size={38} />
        </div>
      </div>
      <div className="w-full text-center">
        <p className="truncate text-sm font-semibold text-zinc-100">{station.name}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {station.language} {station.bitrate ? `· ${station.bitrate}k` : ""}
        </p>
      </div>
    </div>
  );
}
