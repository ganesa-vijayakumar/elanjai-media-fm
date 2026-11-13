import { NextRequest, NextResponse } from "next/server";
import { getStations } from "@/lib/data";

/**
 * Now-playing lookup — opens a brief second connection to an Icecast/Shoutcast
 * stream and reads the inline ICY metadata block for `StreamTitle`.
 *
 * ICY streams interleave metadata every `icy-metaint` audio bytes: after that
 * many bytes comes 1 length byte (×16 = metadata byte count), then the
 * metadata string `StreamTitle='...';`.
 *
 * Results are cached 20s per stream — the open connection reads only until
 * the first metadata block, then closes.
 */

const ALLOWED_ORIGINS = new Set(
  getStations().map((s) => new URL(s.stream_url).origin)
);

type CacheEntry = { title: string | null; at: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 20_000;
const OPEN_TIMEOUT = 9_000;
const MAX_READ = 6 * 1024 * 1024;

function decodeTarget(encoded: string | null): URL | null {
  if (!encoded) return null;
  try {
    return new URL(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function readIcyTitle(target: URL): Promise<string | null> {
  if (/\.m3u8?$/i.test(target.pathname)) return null; // HLS has no ICY metadata

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), OPEN_TIMEOUT);
  try {
    const res = await fetch(target, {
      headers: { "Icy-MetaData": "1", "User-Agent": "ElanjaiMediaFM/1.0" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok || !res.body) return null;
    const metaint = Number(res.headers.get("icy-metaint"));
    if (!metaint || metaint <= 0) {
      res.body.cancel().catch(() => {});
      return null;
    }

    const reader = res.body.getReader();
    let buf = Buffer.alloc(0);
    try {
      while (buf.length < metaint + 1 + 4096 && buf.length < MAX_READ) {
        const { value, done } = await reader.read();
        if (done) break;
        buf = Buffer.concat([buf, Buffer.from(value)]);
        if (buf.length > metaint) {
          const metalen = buf[metaint] * 16;
          if (metalen === 0) return null; // stream has no title right now
          if (buf.length >= metaint + 1 + metalen) {
            const meta = buf
              .subarray(metaint + 1, metaint + 1 + metalen)
              .toString("utf8");
            const m = meta.match(/StreamTitle='([^']*)'/i);
            return m && m[1].trim() ? m[1].trim() : null;
          }
        }
      }
      return null;
    } finally {
      reader.cancel().catch(() => {});
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const target = decodeTarget(request.nextUrl.searchParams.get("u"));
  if (!target) return NextResponse.json({ error: "Bad u" }, { status: 400 });
  if (!/^https?:$/.test(target.protocol) || !ALLOWED_ORIGINS.has(target.origin)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const key = target.toString();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ title: hit.title, cached: true });
  }

  const title = await readIcyTitle(target);
  cache.set(key, { title, at: Date.now() });
  if (cache.size > 300) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    cache.delete(oldest[0]);
  }
  return NextResponse.json({ title });
}
