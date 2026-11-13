"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RECENT_SEARCHES_KEY } from "./SearchInput";

/** Recent-search chips (stored in localStorage by SearchInput). */
export default function RecentSearches() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setItems(JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]"));
      } catch {
        /* private mode */
      }
    });
  }, []);
  if (!items.length) return null;
  return (
    <section aria-label="Recent searches">
      <h2 className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted">
        Recent searches
      </h2>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((q) => (
          <Link
            key={q}
            href={`/search?q=${encodeURIComponent(q)}`}
            className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-medium text-ink transition hover:border-brand-2/50"
          >
            {q}
          </Link>
        ))}
      </div>
    </section>
  );
}
