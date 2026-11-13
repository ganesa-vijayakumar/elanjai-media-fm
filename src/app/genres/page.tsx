import type { Metadata } from "next";
import GenreTile from "@/components/GenreTile";
import { getGenres, getStations } from "@/lib/data";

export const metadata: Metadata = {
  title: "All genres & languages",
  description: "Browse live radio stations by language — Tamil, Hindi, Malayalam, Telugu, Kannada, Punjabi, Urdu and more.",
};

export default function GenresPage() {
  const genres = getGenres();
  const total = getStations().length;
  return (
    <div className="py-6">
      <h1 className="font-display text-[27px] font-semibold leading-[1.15] tracking-tight text-ink sm:text-3xl">
        Browse by <br className="sm:hidden" />
        language
      </h1>
      <p className="mt-2 text-xs text-muted">
        {genres.length} languages · {total} live stations
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((g) => (
          <GenreTile key={g.slug} genre={g} />
        ))}
      </div>
    </div>
  );
}
