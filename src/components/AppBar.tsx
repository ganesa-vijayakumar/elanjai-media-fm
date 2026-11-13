import Link from "next/link";
import { Suspense } from "react";
import BrandLogo from "./BrandLogo";
import Icon from "./Icon";
import NavLinks from "./NavLinks";
import SearchInput from "./SearchInput";
import ThemeToggle from "./ThemeToggle";

/** Slim app bar — brand mark + desktop nav + search + theme + favorites. */
export default function AppBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-[54px] max-w-2xl items-center gap-2.5 px-4 md:max-w-4xl xl:max-w-6xl">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Elanjai FM — home">
          <BrandLogo size={32} />
          <span className="leading-none">
            <span className="block font-display text-[15px] font-semibold tracking-tight text-ink">
              Elanjai FM
            </span>
            <span className="mt-0.5 block text-[7.5px] font-medium uppercase tracking-[0.2em] text-muted">
              Free Indian Radio
            </span>
          </span>
        </Link>

        <NavLinks />

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden w-52 lg:block xl:w-64">
            <Suspense fallback={<div className="h-9 rounded-full bg-surface-2" />}>
              <SearchInput />
            </Suspense>
          </div>
          <ThemeToggle />
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-rose md:hidden"
          >
            <Icon name="heart" size={17} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </header>
  );
}
