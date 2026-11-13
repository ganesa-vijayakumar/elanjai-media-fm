import Link from "next/link";
import StationCard from "@/components/StationCard";
import { getFeatured, getGenres, getStations, getStationsByGenre, toPublic } from "@/lib/data";
import { websiteJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  const featured = getFeatured(18).map(toPublic);
  const genres = getGenres();
  const total = getStations().length;

  return (
    <div className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      <section className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Free Indian radio, <span className="text-emerald-400">live</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-400">
          {total}+ stations in {genres.length} languages — click a logo and listen.
          No sign-up, no app, works on any device.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {genres.map((g) => (
            <Link
              key={g.slug}
              href={`/genre/${g.slug}`}
              className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              {g.name} <span className="text-zinc-500">({g.count})</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured">
        <h2 id="featured" className="mb-4 text-xl font-bold">Popular right now</h2>
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
              <h2 id={`g-${g.slug}`} className="text-xl font-bold">
                {g.name} radio
              </h2>
              <Link href={`/genre/${g.slug}`} className="text-sm text-emerald-400 hover:underline">
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
