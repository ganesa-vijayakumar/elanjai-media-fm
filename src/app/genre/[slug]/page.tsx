import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import StationRow from "@/components/StationRow";
import { getGenre, getGenres, getStationsByGenre, toPublic } from "@/lib/data";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getGenres().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getGenre(slug);
  if (!g) return { title: "Genre not found" };
  const title = `${g.name} Radio — ${g.count} Live Stations`;
  const description = `Listen to ${g.count} live ${g.name} radio stations online for free — 24/7 streaming on ${SITE.name}, no sign-up needed.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/genre/${g.slug}` },
  };
}

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const g = getGenre(slug);
  if (!g) notFound();
  const stations = getStationsByGenre(g.slug).map(toPublic);
  const genres = getGenres();

  return (
    <div className="py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: SITE.url },
              { name: g.name, url: `${SITE.url}/genre/${g.slug}` },
            ])
          ),
        }}
      />

      {/* App-style header — back, title, search shortcut */}
      <div className="flex items-center gap-3">
        <Link
          href="/genres"
          aria-label="Back to genres"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink transition hover:border-brand-2/50"
        >
          <Icon name="chevL" size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold capitalize text-ink">{g.name}</h1>
        <Link
          href="/search"
          aria-label="Search"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-ink"
        >
          <Icon name="search" size={18} />
        </Link>
      </div>

      {/* Genre switcher chips */}
      <div className="rail -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {genres.map((x) =>
          x.slug === g.slug ? (
            <span
              key={x.slug}
              className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-ink"
            >
              {x.name}
            </span>
          ) : (
            <Link
              key={x.slug}
              href={`/genre/${x.slug}`}
              className="shrink-0 rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-medium text-ink transition hover:border-brand-2/50"
            >
              {x.name}
            </Link>
          )
        )}
      </div>
      <p className="mt-3 text-[11.5px] text-muted">
        {g.count} live stations — tap to play
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {stations.map((s) => (
          <StationRow key={s.id} station={s} />
        ))}
      </div>
    </div>
  );
}
