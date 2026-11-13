import type { Metadata } from "next";
import { Suspense } from "react";
import StationCard from "@/components/StationCard";
import { searchStations, toPublic } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search stations",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

async function Results({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = searchStations(q).map(toPublic);

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight">
        {q ? `Results for “${q}”` : "Search"}
      </h1>
      {q && <p className="mt-1 text-zinc-400">{results.length} station{results.length === 1 ? "" : "s"} found</p>}
      {!q && <p className="mt-1 text-zinc-400">Type a station, language, or tag in the search box above.</p>}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>
    </>
  );
}

export default function SearchPage(props: Props) {
  return (
    <div className="py-8">
      <Suspense fallback={<h1 className="text-2xl font-extrabold tracking-tight">Searching…</h1>}>
        <Results {...props} />
      </Suspense>
    </div>
  );
}
