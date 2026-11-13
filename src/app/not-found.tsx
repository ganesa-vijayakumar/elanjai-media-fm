import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-black text-zinc-800">404</p>
      <h1 className="mt-2 text-xl font-bold">Station not found</h1>
      <p className="mt-2 text-zinc-400">This frequency doesn&apos;t reach us.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-emerald-500 px-6 py-2 font-semibold text-zinc-950 hover:bg-emerald-400"
      >
        Back to all stations
      </Link>
    </div>
  );
}
