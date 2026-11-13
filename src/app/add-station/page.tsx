import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Add your station",
  description: `Get your radio station listed on ${SITE.name} — free directory submission for broadcasters.`,
};

export default function AddStationPage() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Add your station</h1>
      <p className="mt-3 text-zinc-400">
        Run a radio station? Listing is free. Send us the details below and we&apos;ll review
        and add it — usually within a few days. Stations must own the rights to their stream
        or hold a valid broadcast license.
      </p>
      <ul className="mt-6 space-y-3 text-sm text-zinc-300">
        {[
          "Station name",
          "Public stream URL (Shoutcast / Icecast / HLS .m3u8 / AAC / MP3)",
          "Language & country",
          "Logo (link or attachment)",
          "Official website",
        ].map((item, i) => (
          <li key={item} className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
      <a
        href="mailto:stations@elanjai.example?subject=New%20station%20submission"
        className="mt-6 inline-block rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-zinc-950 transition hover:bg-emerald-400"
      >
        Submit by email
      </a>
      <p className="mt-4 text-xs text-zinc-500">
        Removal requests are handled the same way — see our <a href="/dmca" className="underline">DMCA page</a>.
      </p>
    </div>
  );
}
