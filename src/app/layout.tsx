import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import AudioProvider from "@/components/AudioProvider";
import AppBar from "@/components/AppBar";
import PlayerChrome from "@/components/PlayerChrome";
import TabBar from "@/components/TabBar";
import { getGenres, getStations } from "@/lib/data";
import { SITE } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

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
    { media: "(prefers-color-scheme: light)", color: "#fcfcf6" },
    { media: "(prefers-color-scheme: dark)", color: "#07130c" },
  ],
};

// Set data-theme before first paint to avoid a flash of the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem("emfm:theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const genres = getGenres();
  const total = getStations().length;
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full bg-bg pb-44 font-sans text-ink md:pb-32">
        <AudioProvider>
          <AppBar />

          <main className="mx-auto w-full max-w-2xl px-4 md:max-w-4xl xl:max-w-6xl">{children}</main>

          <footer className="mx-auto mt-14 w-full max-w-2xl px-4 pb-4 text-[11px] text-muted md:max-w-4xl xl:max-w-6xl">
            <div className="rounded-[18px] border border-border bg-surface px-5 py-4">
              <p className="font-display text-[13px] font-semibold text-ink">{SITE.name}</p>
              <p className="mt-1 leading-relaxed">
                Free online radio — {genres.length} languages, hundreds of live
                stations. Streams belong to their broadcasters.
              </p>
              <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Footer">
                <Link href="/genres" className="hover:text-ink">All genres</Link>
                <Link href="/recent" className="hover:text-ink">Recently played</Link>
                <Link href="/add-station" className="hover:text-ink">Add your station</Link>
                <Link href="/about" className="hover:text-ink">About</Link>
                <Link href="/dmca" className="hover:text-ink">DMCA</Link>
              </nav>
              <p className="mt-3 text-[10px]">© 2026 {SITE.name}</p>
            </div>
          </footer>

          <PlayerChrome total={total} />
          <TabBar />
        </AudioProvider>
      </body>
    </html>
  );
}
