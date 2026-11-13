"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/genres", label: "Genres" },
  { href: "/search", label: "Search" },
  { href: "/favorites", label: "Favorites" },
  { href: "/recent", label: "Recent" },
];

function Links() {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-[13px] transition ${
              active
                ? "bg-accent font-semibold text-accent-ink"
                : "font-medium text-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}

/** Desktop/tablet nav — replaces the floating tab bar at md+. */
export default function NavLinks() {
  return (
    <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 md:flex">
      <Suspense>
        <Links />
      </Suspense>
    </nav>
  );
}
