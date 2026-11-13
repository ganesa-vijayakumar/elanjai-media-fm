import type { Metadata } from "next";
import ClientStationList from "@/components/ClientStationList";

export const metadata: Metadata = {
  title: "Your favorites",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="py-6">
      <h1 className="font-display text-[27px] font-semibold tracking-tight text-ink">
        Favorites
      </h1>
      <p className="mt-1 text-xs text-muted">Saved on this device only.</p>
      <div className="mt-5">
        <ClientStationList kind="favorites" />
      </div>
    </div>
  );
}
