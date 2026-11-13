import { NextRequest, NextResponse } from "next/server";
import { getStations } from "@/lib/data";

/**
 * Same-origin audio proxy — the `private-stream` role.
 *
 * Why every stream goes through here:
 *  - http:// media is blocked on https:// pages (mixed content)
 *  - hls.js fetches via XHR, so oddball hosts without CORS headers fail
 *  - a single origin keeps referrer/policy behavior predictable
 *
 * Anti-abuse: `u` must resolve to a URL on an origin present in our catalog
 * (stream CDNs serve manifests/segments on the same origin, so this covers
 * HLS playlists + segments without becoming an open proxy).
 */

const ALLOWED_ORIGINS = new Set(
  getStations().map((s) => new URL(s.stream_url).origin)
);

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
]);

const UPSTREAM_HEADERS_TIMEOUT = 12000;

function decodeTarget(encoded: string | null): URL | null {
  if (!encoded) return null;
  try {
    return new URL(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function proxiedUrl(u: URL): string {
  return `/api/stream?u=${Buffer.from(u.toString()).toString("base64url")}`;
}

/** Rewrite an HLS manifest so every URI routes back through this proxy. */
function rewriteManifest(text: string, base: URL): string {
  return text
    .split("\n")
    .map((line) => {
      // URI="..." attributes (EXT-X-KEY, EXT-X-MAP, EXT-X-MEDIA...)
      line = line.replace(/URI="([^"]+)"/g, (_m, uri: string) => {
        try {
          return `URI="${proxiedUrl(new URL(uri, base))}"`;
        } catch {
          return _m;
        }
      });
      // Playlist/segment lines
      const t = line.trim();
      if (t && !t.startsWith("#")) {
        try {
          return proxiedUrl(new URL(t, base));
        } catch {
          return line;
        }
      }
      return line;
    })
    .join("\n");
}

async function fetchUpstream(target: URL, range: string | null) {
  const ctrl = new AbortController();
  // Abort only if upstream headers never arrive — the body may stream forever.
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_HEADERS_TIMEOUT);
  try {
    const headers: Record<string, string> = {
      "Icy-MetaData": "1",
      "User-Agent": "ElanjaiMediaFM/1.0",
    };
    if (range) headers.Range = range;
    const res = await fetch(target, {
      headers,
      redirect: "follow",
      signal: ctrl.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const target = decodeTarget(request.nextUrl.searchParams.get("u"));
  if (!target) return NextResponse.json({ error: "Bad u" }, { status: 400 });
  if (!/^https?:$/.test(target.protocol) || !ALLOWED_ORIGINS.has(target.origin)) {
    return NextResponse.json({ error: "Not an allowed stream" }, { status: 403 });
  }

  const upstream = await fetchUpstream(target, request.headers.get("range")).catch(
    () => null
  );
  if (!upstream || !upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Upstream stream unavailable" }, { status: 502 });
  }

  const ctype = upstream.headers.get("content-type") ?? "";
  const isManifest =
    /mpegurl|m3u/i.test(ctype) || /\.m3u8?$/i.test(target.pathname);

  const headers = new Headers();
  upstream.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  });
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "no-store");

  if (isManifest) {
    const text = await upstream.text();
    headers.set("Content-Type", "application/vnd.apple.mpegurl");
    return new Response(rewriteManifest(text, target), { status: 200, headers });
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
