import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AudioProvider from "@/components/AudioProvider";
import BottomNav from "@/components/BottomNav";
import PlayerBar from "@/components/PlayerBar";
import SearchInput from "@/components/SearchInput";
import ThemeToggle from "@/components/ThemeToggle";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b3d2e" },
    { media: "(prefers-color-scheme: dark)", color: "#061009" },
  ],
};

// Set data-theme before first paint to avoid a flash of the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem("emfm:theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const genres = getGenres();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full bg-bg pb-40 font-sans text-ink md:pb-28">
        <AudioProvider>
          {/* Brand header — dark green */}
          <header className="sticky top-0 z-40 bg-brand text-brand-ink shadow-lg shadow-brand/20">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
              <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M4 12a8 8 0 0 1 16 0" />
                    <path d="M7 12a5 5 0 0 1 10 0" />
                    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
                    <path d="M8.5 16.5h7l-1.4 4h-4.2l-1.4-4z" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className="leading-none">
                  <span className="block text-[15px]">Elanjai Media FM</span>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-brand-ink/60">
                    Free Indian Radio
                  </span>
                </span>
              </Link>

              <nav className="ml-3 hidden items-center gap-0.5 text-sm text-brand-ink/80 lg:flex" aria-label="Genres">
                {genres.slice(0, 5).map((g) => (
                  <Link
                    key={g.slug}
                    href={`/genre/${g.slug}`}
                    className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-brand-ink"
                  >
                    {g.name}
                  </Link>
                ))}
                <Link
                  href="/genres"
                  className="rounded-full px-3 py-1.5 font-medium text-accent transition hover:bg-white/10"
                >
                  All →
                </Link>
              </nav>

              <div className="ml-auto flex items-center gap-1.5">
                <div className="hidden sm:block">
                  <Suspense fallback={<div className="h-9 w-52 rounded-full bg-white/10" />}>
                    <SearchInput />
                  </Suspense>
                </div>
                <Link
                  href="/favorites"
                  aria-label="Favorites"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/90 transition hover:bg-white/15"
                >
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s-7.5-4.9-9.8-9.2C.6 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.2 3.6 3.6 6.8C19.5 16.1 12 21 12 21z" />
                  </svg>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4">{children}</main>

          <footer className="mx-auto mt-16 max-w-6xl border-t border-border px-4 py-10 text-sm text-muted">
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
              <div>
                <p className="font-semibold text-ink">{SITE.name}</p>
                <p className="mt-1 max-w-sm">
                  Free online radio — {genres.length} languages, hundreds of live stations.
                  Streams are provided by the broadcasters; we just make them easy to find.
                </p>
              </div>
              <nav className="flex gap-10" aria-label="Footer">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-ink">Explore</span>
                  <Link href="/genres" className="hover:text-ink">All genres</Link>
                  <Link href="/favorites" className="hover:text-ink">Favorites</Link>
                  <Link href="/recent" className="hover:text-ink">Recently played</Link>
                  <Link href="/add-station" className="hover:text-ink">Add your station</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-ink">Legal</span>
                  <Link href="/dmca" className="hover:text-ink">DMCA</Link>
                  <Link href="/about" className="hover:text-ink">About</Link>
                </div>
              </nav>
            </div>
            <p className="mt-8">© 2026 {SITE.name}. All streams belong to their respective broadcasters.</p>
          </footer>

          <PlayerBar />
          <BottomNav />
        </AudioProvider>
      </body>
    </html>
  );
}
