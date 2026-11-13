import type { Metadata } from "next";
import ClientStationList from "@/components/ClientStationList";

export const metadata: Metadata = {
  title: "Your favorites",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Favorites</h1>
      <p className="mt-1 text-muted">Saved on this device only.</p>
      <div className="mt-6">
        <ClientStationList kind="favorites" />
      </div>
    </div>
  );
}
