import Link from "next/link";
import type { PublicStation } from "@/lib/types";
import PlayButton from "./PlayButton";
import StationLogo from "./StationLogo";

/** Logo-forward card tile — big art, name+meta, corner play badge (design "card_tile"). */
export default function StationCard({ station }: { station: PublicStation }) {
  return (
    <div className="group relative rounded-[20px] border border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-brand-2/50 hover:shadow-lg hover:shadow-brand/10">
      <Link
        href={`/station/${station.slug}`}
        className="absolute inset-0 z-[5] rounded-[20px]"
        aria-label={station.name}
      />
      <div className="relative">
        <StationLogo
          src={station.favicon}
          name={station.name}
          size={200}
          className="aspect-square w-full"
        />
        <div className="absolute -bottom-2 -right-1.5 z-10 transition group-hover:scale-110">
          <PlayButton station={station} size={30} />
        </div>
      </div>
      <p className="mt-2.5 truncate text-[12.5px] font-semibold text-ink">{station.name}</p>
      <p className="mt-0.5 truncate text-[10px] capitalize text-muted">
        {station.genre} {station.bitrate ? `· ${station.bitrate}k` : ""}
      </p>
    </div>
  );
}
