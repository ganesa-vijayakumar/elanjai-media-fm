import type { Metadata } from "next";
import ClientStationList from "@/components/ClientStationList";

export const metadata: Metadata = {
  title: "Recently played",
  robots: { index: false },
};

export default function RecentPage() {
  return (
    <div className="py-6">
      <h1 className="font-display text-[27px] font-semibold tracking-tight text-ink">
        Recently played
      </h1>
      <p className="mt-1 text-xs text-muted">Last 20 stations · this device only.</p>
      <div className="mt-5">
        <ClientStationList kind="recents" />
      </div>
    </div>
  );
}
