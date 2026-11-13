import Link from "next/link";
import StationCard from "@/components/StationCard";
import { getFeatured, getGenres, getStations, getStationsByGenre, toPublic } from "@/lib/data";
import { websiteJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  const featured = getFeatured(18).map(toPublic);
  const genres = getGenres();
  const total = getStations().length;

  return (
    <div className="py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      {/* Hero — dark green panel, light yellow accent */}
      <section className="relative overflow-hidden rounded-3xl bg-brand px-6 py-10 text-brand-ink sm:px-10 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-ink">
            <span className="flex h-2 w-2 rounded-full bg-brand-2" />
            Live now · {total} stations
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Every Indian radio station. One tap away.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-brand-ink/75 sm:text-base">
            Tamil, Hindi, Malayalam, Telugu, Kannada, Punjabi & more — streaming
            free in your browser. No sign-up, no app, no ads in your ears.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {genres.slice(0, 5).map((g) => (
              <Link
                key={g.slug}
                href={`/genre/${g.slug}`}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-accent hover:text-accent-ink"
              >
                {g.name}
              </Link>
            ))}
            <Link
              href="/genres"
              className="rounded-full border border-accent/60 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-accent-ink"
            >
              All {genres.length} languages →
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="featured" className="text-xl font-bold sm:text-2xl">
            Popular right now
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {featured.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </div>
      </section>

      {genres.slice(0, 4).map((g) => {
        const list = getStationsByGenre(g.slug).slice(0, 12).map(toPublic);
        if (!list.length) return null;
        return (
          <section key={g.slug} aria-labelledby={`g-${g.slug}`} className="mt-12">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id={`g-${g.slug}`} className="text-xl font-bold sm:text-2xl">
                {g.name} radio
              </h2>
              <Link
                href={`/genre/${g.slug}`}
                className="text-sm font-medium text-brand-2 hover:underline dark:text-accent"
              >
                All {g.count} →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {list.map((s) => (
                <StationCard key={s.id} station={s} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
