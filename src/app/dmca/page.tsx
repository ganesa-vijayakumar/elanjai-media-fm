import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "DMCA & takedown policy",
  robots: { index: false },
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-2xl py-10 text-sm leading-7 text-zinc-300">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">DMCA & takedown policy</h1>
      <p className="mt-4">
        {SITE.name} is a directory. We do not host, re-encode, or restream any audio — playback
        connects your browser directly to the broadcaster&apos;s own public stream, the same
        stream they publish for their own listeners.
      </p>
      <p className="mt-3">
        If you operate a listed station and want it removed or the metadata corrected, email
        <a href="mailto:dmca@elanjai.example" className="mx-1 text-emerald-400 underline">dmca@elanjai.example</a>
        from a domain associated with the station, including the station name and its page URL.
        Verified removal requests are processed within 7 days.
      </p>
      <p className="mt-3">
        All station names, logos, and streams remain the property of their respective owners.
        Logos are displayed under fair-use nominative principles solely to identify the station.
      </p>
    </div>
  );
}
