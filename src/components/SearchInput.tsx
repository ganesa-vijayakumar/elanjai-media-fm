"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";

export const RECENT_SEARCHES_KEY = "emfm:searches";

function remember(q: string) {
  try {
    const prev = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]") as string[];
    const next = [q, ...prev.filter((x) => x !== q)].slice(0, 6);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

/** Pill search field — surface-2 fill, accent focus ring (design "search field"). */
export default function SearchInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) remember(term);
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
      }}
      className="relative w-full"
    >
      <Icon
        name="search"
        size={20}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search stations, languages…"
        aria-label="Search stations"
        autoFocus={autoFocus}
        className="w-full rounded-full border border-transparent bg-surface-2 py-3 pl-11 pr-11 text-sm text-ink placeholder-muted outline-none transition focus:border-brand-2 focus:bg-surface dark:focus:border-accent [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push("/search");
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-ink"
        >
          <Icon name="x" size={15} />
        </button>
      )}
    </form>
  );
}
