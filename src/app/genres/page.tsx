import type { Metadata } from "next";
import Link from "next/link";
import { getGenres } from "@/lib/data";

export const metadata: Metadata = {
  title: "All genres & languages",
  description: "Browse live radio stations by language — Tamil, Hindi, Malayalam, Telugu, Kannada, Punjabi, Urdu and more.",
};

export default function GenresPage() {
  const genres = getGenres();
  return (
    <div className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Browse by language</h1>
      <p className="mt-1 text-muted">Pick a language to see every live station in it.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((g) => (
          <Link
            key={g.slug}
            href={`/genre/${g.slug}`}
            className="group rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand-2 hover:shadow-lg"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-accent">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18V6l10-2v12" />
                <circle cx="6.5" cy="18" r="2.5" />
                <circle cx="16.5" cy="16" r="2.5" />
              </svg>
            </span>
            <p className="mt-3 font-bold capitalize text-ink group-hover:text-brand-2">
              {g.name}
            </p>
            <p className="text-sm text-muted">{g.count} stations</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
