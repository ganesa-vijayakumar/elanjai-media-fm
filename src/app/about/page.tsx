import type { Metadata } from "next";
import { getGenres, getStations } from "@/lib/data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.name} — a free directory of live Indian radio streams.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl py-10 text-sm leading-7">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        About {SITE.name}
      </h1>
      <p className="mt-4 text-muted">
        {SITE.name} is a free directory of live Indian internet radio — {getStations().length}+
        stations across {getGenres().length} languages, playable instantly in your browser.
      </p>
      <h2 className="mt-6 font-bold text-ink">How it works</h2>
      <p className="mt-2 text-muted">
        Radio broadcasters publish live audio streams (Shoutcast, Icecast, HLS) so listeners can
        tune in. We catalog those public endpoints, add search, genres and a player, and your
        browser connects to the broadcaster&apos;s stream through our lightweight proxy — we
        never re-host or modify the audio.
      </p>
      <h2 className="mt-6 font-bold text-ink">Free, how?</h2>
      <p className="mt-2 text-muted">
        Because the audio comes from the broadcasters&apos; own servers, running the directory is
        cheap. No accounts, no paywall. Broadcasters keep full control of their streams and can
        request removal anytime via our DMCA page.
      </p>
    </div>
  );
}
