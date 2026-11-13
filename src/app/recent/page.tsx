import type { Metadata } from "next";
import ClientStationList from "@/components/ClientStationList";

export const metadata: Metadata = {
  title: "Recently played",
  robots: { index: false },
};

export default function RecentPage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Recently played</h1>
      <p className="mt-1 text-muted">Your last 20 stations, stored on this device.</p>
      <div className="mt-6">
        <ClientStationList kind="recents" />
      </div>
    </div>
  );
}
