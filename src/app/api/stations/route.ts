import { NextRequest, NextResponse } from "next/server";
import { getStations, getStationsByGenre, searchStations, toPublic } from "@/lib/data";

export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const genre = request.nextUrl.searchParams.get("genre");

  const stations = q ? searchStations(q) : genre ? getStationsByGenre(genre) : getStations();
  return NextResponse.json({
    count: stations.length,
    stations: stations.map(toPublic),
  });
}
