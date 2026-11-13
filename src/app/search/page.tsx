import type { Metadata } from "next";
import { Suspense } from "react";
import RecentSearches from "@/components/RecentSearches";
import SearchInput from "@/components/SearchInput";
import StationRow from "@/components/StationRow";
import { getFeatured, searchStations, toPublic } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search stations",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

async function Results({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = searchStations(q).map(toPublic);
  const trending = getFeatured(6).map(toPublic);

  if (!q.trim()) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        <RecentSearches />
        <section aria-labelledby="trending">
          <h2 className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">
            Trending now
          </h2>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {trending.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center font-display text-[15px] font-bold text-brand-2 dark:text-accent">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <StationRow station={s} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-[11.5px] text-muted">
        {results.length} station{results.length === 1 ? "" : "s"} for “{q}”
      </p>
      {results.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[22px] border border-dashed border-border bg-surface px-6 py-12 text-center">
          <p className="font-display text-sm font-semibold text-ink">No matches</p>
          <p className="mt-1.5 text-[11px] text-muted">
            Try a station name, language, or tag.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {results.map((s) => (
            <StationRow key={s.id} station={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage(props: Props) {
  return (
    <div className="py-5">
      <Suspense fallback={<div className="h-12 rounded-full bg-surface-2" />}>
        <SearchInput autoFocus />
      </Suspense>
      <Suspense fallback={<p className="mt-6 text-sm text-muted">Searching…</p>}>
        <Results {...props} />
      </Suspense>
    </div>
  );
}
