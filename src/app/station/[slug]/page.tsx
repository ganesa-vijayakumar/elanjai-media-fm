import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import PlayButton from "@/components/PlayButton";
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

  return (
    <div className="py-8">
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

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/genre/${s.genre}`} className="capitalize hover:text-ink">
          {s.genre}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{s.name}</span>
      </nav>

      <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-brand p-6 text-brand-ink sm:flex-row sm:items-center sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/15 blur-2xl"
        />
        <StationLogo src={s.favicon} name={s.name} size={144} className="h-36 w-36 shadow-xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{s.name}</h1>
          <p className="mt-1 text-brand-ink/70">
            {s.language} · {s.country}
            {s.bitrate ? ` · ${s.bitrate} kbps ${s.codec}` : ""}
          </p>
          {s.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {s.tags.slice(0, 5).map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-brand-ink/80">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 flex items-center gap-3">
            <PlayButton station={pub} size={56} />
            <span className="text-sm font-medium text-accent">Tap to listen live</span>
            <FavoriteButton id={s.id} />
            {s.homepage && (
              <a
                href={s.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-brand-ink/80 underline-offset-4 hover:text-accent hover:underline"
              >
                Official site ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-12">
          <h2 id="related" className="mb-4 text-xl font-bold sm:text-2xl">
            More {s.genre} stations
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {related.map((r) => (
              <StationCard key={r.id} station={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
