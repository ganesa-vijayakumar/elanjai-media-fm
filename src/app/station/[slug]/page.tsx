import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import Icon from "@/components/Icon";
import LiveBadge from "@/components/LiveBadge";
import NowPlayingCard from "@/components/NowPlayingCard";
import PlayButton from "@/components/PlayButton";
import ShareButton from "@/components/ShareButton";
import StationCard from "@/components/StationCard";
import StationLogo from "@/components/StationLogo";
import {
  getRelated,
  getStationBySlug,
  getStations,
  toPublic,
} from "@/lib/data";
import { breadcrumbJsonLd, radioStationJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getStations().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getStationBySlug(slug);
  if (!s) return { title: "Station not found" };
  const title = `${s.name} — Listen Live Free`;
  const description = `Listen to ${s.name} live online — free ${s.language} radio from ${s.country}, streaming 24/7 on ${SITE.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/station/${s.slug}` },
    openGraph: { title, description, url: `${SITE.url}/station/${s.slug}` },
  };
}

export default async function StationPage({ params }: Props) {
  const { slug } = await params;
  const s = getStationBySlug(slug);
  if (!s) notFound();

  const pub = toPublic(s);
  const related = getRelated(s).map(toPublic);
  const genreCount = getStations().filter((x) => x.genre === s.genre).length;

  return (
    <div className="py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(radioStationJsonLd(s)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: SITE.url },
              { name: s.genre, url: `${SITE.url}/genre/${s.genre}` },
              { name: s.name, url: `${SITE.url}/station/${s.slug}` },
            ])
          ),
        }}
      />

      {/* Header — back to genre + share */}
      <div className="flex items-center gap-3">
        <Link
          href={`/genre/${s.genre}`}
          aria-label={`Back to ${s.genre} stations`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink transition hover:border-brand-2/50"
        >
          <Icon name="chevL" size={16} />
        </Link>
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1 truncate text-[11px] text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/genre/${s.genre}`} className="capitalize hover:text-ink">
            {s.genre}
          </Link>
        </nav>
        <ShareButton slug={s.slug} name={s.name} />
      </div>

      {/* Hero card — deep green, big art, live chip, tags */}
      <section className="relative mt-4 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#11543c] to-brand p-5 text-brand-ink shadow-lg shadow-brand/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-accent/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-white/5"
        />
        <div className="relative md:flex md:items-center md:gap-6">
          <div className="flex items-start justify-between gap-3">
            <StationLogo
              src={s.favicon}
              name={s.name}
              size={84}
              className="h-[84px] w-[84px] shrink-0 md:h-[120px] md:w-[120px]"
            />
            <LiveBadge count={genreCount} />
          </div>
          <div className="min-w-0">
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight md:mt-0 md:text-3xl">
              {s.name}
            </h1>
            <p className="mt-1 text-xs text-brand-ink/75">
              {s.language} · {s.country}
              {s.bitrate ? ` · ${s.bitrate} kbps ${s.codec}` : ""}
            </p>
            {s.tags.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-2">
                {s.tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-brand-ink/85"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA row — play FAB + heart + homepage */}
      <div className="mt-5 flex items-center gap-4">
        <PlayButton station={pub} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">Tap to listen live</p>
          <p className="mt-0.5 text-[10.5px] text-muted">Free · no sign-up</p>
        </div>
        <FavoriteButton id={s.id} size={44} />
        {s.homepage && (
          <a
            href={s.homepage}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Official site"
            title="Official site"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-ink"
          >
            <Icon name="globe" size={20} strokeWidth={1.7} />
          </a>
        )}
      </div>

      <div className="mt-5">
        <NowPlayingCard station={pub} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="related" className="font-display text-[16.5px] font-semibold text-ink">
              More {s.genre} stations
            </h2>
            <Link
              href={`/genre/${s.genre}`}
              className="text-[11.5px] font-semibold text-brand-2 dark:text-accent"
            >
              All {genreCount} →
            </Link>
          </div>
          <div className="rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
            {related.map((r) => (
              <div key={r.id} className="w-[130px] shrink-0 lg:w-auto">
                <StationCard station={r} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
