import Link from "next/link";
import type { Genre } from "@/lib/types";
import { genreStyle } from "@/lib/genre-style";
import Icon from "./Icon";

/** Pastel language tile — letter badge, name, station count (design "genre tile"). */
export default function GenreTile({ genre }: { genre: Genre }) {
  const st = genreStyle(genre.slug);
  return (
    <Link
      href={`/genre/${genre.slug}`}
      className="group relative block overflow-hidden rounded-[22px] p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/10"
      style={{ backgroundColor: st.bg, color: st.fg }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 -top-4 h-[72px] w-[72px] rounded-full bg-white/35"
      />
      <span className="relative flex items-start justify-between">
        <span
          className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] font-display text-base font-bold text-white"
          style={{ backgroundColor: st.fg }}
        >
          {st.short}
        </span>
        <Icon name="note" size={20} className="mt-0.5" strokeWidth={1.8} />
      </span>
      <span className="mt-4 block font-display text-[15px] font-semibold">{genre.name}</span>
      <span className="mt-0.5 block text-[11px] font-medium">{genre.count} stations</span>
    </Link>
  );
}
