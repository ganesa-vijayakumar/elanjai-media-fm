import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import Icon from "@/components/Icon";
import LiveBadge from "@/components/LiveBadge";
import PlayButton from "@/components/PlayButton";
import StationCard from "@/components/StationCard";
import StationRow from "@/components/StationRow";
import { getFeatured, getGenres, getStations, getStationsByGenre, toPublic } from "@/lib/data";
import { genreStyle } from "@/lib/genre-style";
import { websiteJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  const featured = getFeatured(8).map(toPublic);
  const genres = getGenres();
  const total = getStations().length;
  const tamil = getStationsByGenre("tamil").slice(0, 8).map(toPublic);
  const tamilGenre = genres.find((g) => g.slug === "tamil");

  return (
    <div className="py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />

      {/* Hero — deep green gradient, brand mark, live chip, play FAB */}
      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#10533b] to-brand px-5 pb-6 pt-5 text-brand-ink shadow-lg shadow-brand/20 md:px-10 md:pb-9 md:pt-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-20 h-44 w-44 rounded-full bg-accent/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-24 h-28 w-28 rounded-full bg-white/10"
        />
        <div className="relative flex items-start justify-between gap-3">
          <LiveBadge count={total} />
          <BrandLogo size={84} className="shrink-0 md:hidden" />
          <BrandLogo size={104} className="hidden shrink-0 md:block" />
        </div>
        <h1 className="relative mt-3 font-display text-[26px] font-semibold leading-[1.18] tracking-tight sm:text-[32px] lg:text-[38px]">
          Every Indian radio.
          <br />
          One tap away.
        </h1>
        <p className="relative mt-2 text-[11.5px] text-brand-ink/75">
          {genres.slice(0, 3).map((g) => g.name).join(" · ")} · +{Math.max(genres.length - 3, 0)} more
        </p>
        {featured[0] && (
          <div className="relative mt-4 flex items-center gap-3">
            <PlayButton station={featured[0]} size={52} />
            <span className="text-[11px] font-medium text-brand-ink/70">
              Start with {featured[0].name}
            </span>
          </div>
        )}
      </section>

      {/* Languages — pastel chip rail */}
      <section aria-labelledby="languages" className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="languages" className="font-display text-[16.5px] font-semibold text-ink">
            Languages
          </h2>
          <Link href="/genres" className="text-[11.5px] font-semibold text-brand-2 dark:text-accent">
            See all →
          </Link>
        </div>
        <div className="rail -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
          {genres.map((g) => {
            const st = genreStyle(g.slug);
            return (
              <Link
                key={g.slug}
                href={`/genre/${g.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-full py-2 pl-2.5 pr-4 transition hover:brightness-95"
                style={{ backgroundColor: st.bg }}
              >
                <span
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full font-display text-[10.5px] font-bold text-white"
                  style={{ backgroundColor: st.fg }}
                >
                  {st.short[0]}
                </span>
                <span className="text-[12.5px] font-semibold" style={{ color: st.fg }}>
                  {g.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular now — compact rows */}
      <section aria-labelledby="popular" className="mt-8">
        <h2 id="popular" className="mb-3 font-display text-[16.5px] font-semibold text-ink lg:text-lg">
          Popular now
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map((s) => (
            <StationRow key={s.id} station={s} />
          ))}
        </div>
      </section>

      {/* Tamil radio — card rail */}
      {tamilGenre && tamil.length > 0 && (
        <section aria-labelledby="tamil-rail" className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="tamil-rail" className="font-display text-[16.5px] font-semibold text-ink">
              Tamil radio
            </h2>
            <Link
              href="/genre/tamil"
              className="text-[11.5px] font-semibold text-brand-2 dark:text-accent"
            >
              All {tamilGenre.count} →
            </Link>
          </div>
          <div className="rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {tamil.map((s) => (
              <div key={s.id} className="w-[130px] shrink-0">
                <StationCard station={s} />
              </div>
            ))}
            <Link
              href="/genre/tamil"
              className="flex w-[80px] shrink-0 flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-border text-muted transition hover:border-brand-2 hover:text-brand-2"
            >
              <Icon name="chevR" size={20} />
              <span className="text-[10px] font-semibold">All {tamilGenre.count}</span>
            </Link>
          </div>
        </section>
      )}

      {/* Other languages — section per genre, rows */}
      {genres
        .filter((g) => g.slug !== "tamil")
        .slice(0, 3)
        .map((g) => {
          const list = getStationsByGenre(g.slug).slice(0, 4).map(toPublic);
          if (!list.length) return null;
          return (
            <section key={g.slug} aria-labelledby={`g-${g.slug}`} className="mt-8">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id={`g-${g.slug}`} className="font-display text-[16.5px] font-semibold text-ink">
                  {g.name} radio
                </h2>
                <Link
                  href={`/genre/${g.slug}`}
                  className="text-[11.5px] font-semibold text-brand-2 dark:text-accent"
                >
                  All {g.count} →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <StationRow key={s.id} station={s} />
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
