import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StationCard from "@/components/StationCard";
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

  return (
    <div className="py-8">
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
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {g.name} radio stations
      </h1>
      <p className="mt-1 text-zinc-400">{g.count} live stations — click any logo to listen.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {stations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>
    </div>
  );
}
