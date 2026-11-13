import { NextResponse } from "next/server";
import { getStationBySlug, toPublic } from "@/lib/data";

export async function GET(_req: Request, ctx: RouteContext<"/api/stations/[slug]">) {
  const { slug } = await ctx.params;
  const s = getStationBySlug(slug);
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toPublic(s));
}
