import { NextRequest, NextResponse } from "next/server";
import { getStations } from "@/lib/data";

/**
 * Same-origin audio proxy for http:// streams (the `private-stream` role).
 *
 * Browsers refuse http:// media on https:// pages (mixed content), and many
 * Shoutcast/Icecast endpoints send no CORS headers. Piping through our own
 * origin solves both. To avoid becoming an open proxy, `u` must resolve to a
 * stream_url present in our station catalog.
 */

const ALLOWED = new Set(getStations().map((s) => s.stream_url));

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
]);

export async function GET(request: NextRequest) {
  const encoded = request.nextUrl.searchParams.get("u");
  if (!encoded) {
    return NextResponse.json({ error: "Missing u" }, { status: 400 });
  }

  let target: string;
  try {
    target = Buffer.from(encoded, "base64url").toString("utf8");
    new URL(target); // validates
  } catch {
    return NextResponse.json({ error: "Bad u" }, { status: 400 });
  }

  if (!/^https?:\/\//.test(target) || !ALLOWED.has(target)) {
    return NextResponse.json({ error: "Not an allowed stream" }, { status: 403 });
  }

  const upstream = await fetch(target, {
    headers: {
      // icy-metadata asks Shoutcast/Icecast to interleave now-playing titles
      "Icy-MetaData": "1",
      "User-Agent": "ElanjaiMediaFM/1.0",
      Range: request.headers.get("range") ?? "",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Upstream stream unavailable" },
      { status: 502 }
    );
  }

  const headers = new Headers();
  upstream.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  });
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
