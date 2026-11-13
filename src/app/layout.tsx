import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AudioProvider from "@/components/AudioProvider";
import PlayerBar from "@/components/PlayerBar";
import SearchInput from "@/components/SearchInput";
import { getGenres } from "@/lib/data";
import { SITE } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Free Indian Radio Online`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Free Indian Radio Online`,
    description: SITE.description,
    url: SITE.url,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const genres = getGenres();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 pb-24 font-sans text-zinc-100">
        <AudioProvider>
          <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
              <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M4 12a8 8 0 0 1 16 0" />
                    <path d="M7 12a5 5 0 0 1 10 0" />
                    <path d="M10 12a2 2 0 0 1 4 0" />
                    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
                    <path d="M8 17h8l-1.5 4h-5L8 17z" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className="hidden sm:inline">
                  Elanjai <span className="text-emerald-400">Media FM</span>
                </span>
              </Link>

              <nav className="ml-2 hidden items-center gap-1 text-sm text-zinc-400 lg:flex" aria-label="Genres">
                {genres.slice(0, 6).map((g) => (
                  <Link
                    key={g.slug}
                    href={`/genre/${g.slug}`}
                    className="rounded-full px-3 py-1.5 transition hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    {g.name}
                  </Link>
                ))}
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <Suspense fallback={<div className="h-9 w-40 rounded-full bg-zinc-900" />}>
                  <SearchInput />
                </Suspense>
                <Link
                  href="/favorites"
                  aria-label="Favorites"
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-rose-300"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s-7.5-4.9-9.8-9.2C.6 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.2 3.6 3.6 6.8C19.5 16.1 12 21 12 21z" />
                  </svg>
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4">{children}</main>

          <footer className="mx-auto mt-16 max-w-6xl border-t border-zinc-800 px-4 py-10 text-sm text-zinc-500">
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
              <div>
                <p className="font-semibold text-zinc-300">{SITE.name}</p>
                <p className="mt-1 max-w-sm">
                  Free online radio — {getGenres().length} languages, hundreds of live stations.
                  Streams are provided by the broadcasters; we just make them easy to find.
                </p>
              </div>
              <nav className="flex gap-8" aria-label="Footer">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-zinc-300">Explore</span>
                  <Link href="/favorites" className="hover:text-zinc-300">Favorites</Link>
                  <Link href="/recent" className="hover:text-zinc-300">Recently played</Link>
                  <Link href="/add-station" className="hover:text-zinc-300">Add your station</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-zinc-300">Legal</span>
                  <Link href="/dmca" className="hover:text-zinc-300">DMCA</Link>
                  <Link href="/about" className="hover:text-zinc-300">About</Link>
                </div>
              </nav>
            </div>
            <p className="mt-8">© 2026 {SITE.name}. All streams belong to their respective broadcasters.</p>
          </footer>

          <PlayerBar />
        </AudioProvider>
      </body>
    </html>
  );
}
