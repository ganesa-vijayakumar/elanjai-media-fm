import type { Metadata } from "next";
import ClientStationList from "@/components/ClientStationList";

export const metadata: Metadata = {
  title: "Your favorites",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Favorites</h1>
      <p className="mt-1 text-zinc-400">Saved on this device only.</p>
      <div className="mt-6">
        <ClientStationList kind="favorites" />
      </div>
    </div>
  );
}
