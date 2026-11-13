import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-black text-border">404</p>
      <h1 className="mt-2 text-xl font-bold text-ink">Station not found</h1>
      <p className="mt-2 text-muted">This frequency doesn&apos;t reach us.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-accent px-6 py-2 font-semibold text-accent-ink shadow-md transition hover:brightness-105"
      >
        Back to all stations
      </Link>
    </div>
  );
}
