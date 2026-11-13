"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PublicStation } from "@/lib/types";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

type AudioCtx = {
  current: PublicStation | null;
  status: Status;
  error: string | null;
  nowPlaying: string | null;
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  toggleMute: () => void;
  play: (s: PublicStation) => void;
  toggle: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  sleepRemaining: number | null; // seconds until auto-stop
  setSleepTimer: (minutes: number | null) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  recents: PublicStation[];
  clearRecents: () => void;
  favoriteStations: PublicStation[];
  peekNext: () => Promise<PublicStation | null>;
};

const Ctx = createContext<AudioCtx | null>(null);
export const useAudio = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAudio outside AudioProvider");
  return v;
};

const FAV_KEY = "emfm:favorites";
const RECENT_KEY = "emfm:recents";
const VOL_KEY = "emfm:volume";
const MUTE_KEY = "emfm:muted";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function streamParam(stream: string): string | null {
  try {
    return new URLSearchParams(stream.split("?")[1]).get("u");
  } catch {
    return null;
  }
}

export default function AudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catalogRef = useRef<PublicStation[] | null>(null);
  const catalogPromiseRef = useRef<Promise<PublicStation[]> | null>(null);
  const [current, setCurrent] = useState<PublicStation | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [sleepAt, setSleepAt] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favMap, setFavMap] = useState<Record<string, PublicStation>>({});
  const [recents, setRecents] = useState<PublicStation[]>([]);

  const destroyHls = () => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
  };

  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    // Hydrate persisted state without blocking first paint
    queueMicrotask(() => {
      setFavorites(new Set(read<string[]>(FAV_KEY, [])));
      setFavMap(read<Record<string, PublicStation>>("emfm:favmap", {}));
      setRecents(read<PublicStation[]>(RECENT_KEY, []));
      const v = read<number>(VOL_KEY, 0.9);
      setVolumeState(v);
      audio.volume = v;
      const m = read<boolean>(MUTE_KEY, false);
      setMuted(m);
      audio.muted = m;
    });
    audio.volume = read<number>(VOL_KEY, 0.9);
    audio.muted = read<boolean>(MUTE_KEY, false);

    const onPlaying = () => {
      clearWatchdog();
      setStatus("playing");
    };
    const onPause = () => setStatus("paused");
    const onWaiting = () => setStatus("loading");
    const onError = () => {
      setStatus("error");
      setError("Stream unavailable right now");
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.pause();
      hlsRef.current?.destroy();
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
    };
  }, []);

  const play = useCallback(async (s: PublicStation) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(s);
    setStatus("loading");
    setError(null);
    setNowPlaying(null);
    destroyHls();
    clearWatchdog();
    audio.pause();
    audio.removeAttribute("src");

    // If we never reach "playing", the stream is dead or unreachable.
    watchdogRef.current = setTimeout(() => {
      setStatus((st) => {
        if (st === "loading") {
          setError("Station is offline or took too long to connect");
          return "error";
        }
        return st;
      });
    }, 12000);

    if (s.hls && !audio.canPlayType("application/vnd.apple.mpegurl")) {
      const { default: Hls } = await import("hls.js");
      if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 20, manifestLoadingMaxRetry: 2 });
        hlsRef.current = hls;
        hls.on(Hls.Events.ERROR, (_e, d) => {
          if (!d.fatal) return;
          if (d.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          setStatus("error");
          setError("Stream unavailable right now");
        });
        hls.attachMedia(audio);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(s.stream));
      } else {
        setStatus("error");
        setError("HLS not supported in this browser");
        return;
      }
    } else {
      audio.src = s.stream;
    }

    try {
      await audio.play();
    } catch (err) {
      // AbortError fires when a newer station replaces this src — ignore it.
      if ((err as DOMException)?.name !== "AbortError") {
        setStatus("error");
        setError("Playback was blocked or the stream is offline");
      }
      return;
    }

    setRecents((prev) => {
      const next = [{ ...s, playedAt: Date.now() }, ...prev.filter((r) => r.id !== s.id)].slice(0, 20);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (status === "playing") audio.pause();
    else audio.play().catch(() => setStatus("error"));
  }, [current, status]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    destroyHls();
    clearWatchdog();
    audio?.pause();
    audio?.removeAttribute("src");
    setCurrent(null);
    setStatus("idle");
    setNowPlaying(null);
    setSleepAt(null);
    setSleepRemaining(null);
  }, []);

  // ---------- catalog for next/prev (fetched lazily on first use) ----------
  const ensureCatalog = useCallback(async () => {
    if (catalogRef.current) return catalogRef.current;
    catalogPromiseRef.current ??= fetch("/api/stations")
      .then((r) => r.json())
      .then((d) => {
        catalogRef.current = d.stations as PublicStation[];
        return catalogRef.current;
      })
      .catch(() => [] as PublicStation[]);
    return catalogPromiseRef.current;
  }, []);

  const step = useCallback(
    async (dir: 1 | -1) => {
      const list = await ensureCatalog();
      if (!list.length || !current) return;
      const i = list.findIndex((s) => s.id === current.id);
      const n = (i + dir + list.length) % list.length;
      play(list[n]);
    },
    [ensureCatalog, current, play]
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  /** The station `next` would play, without switching to it. */
  const peekNext = useCallback(async () => {
    const list = await ensureCatalog();
    if (!list.length || !current) return null;
    const i = list.findIndex((s) => s.id === current.id);
    return list[(i + 1) % list.length] ?? null;
  }, [ensureCatalog, current]);

  const clearRecents = useCallback(() => {
    setRecents([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  // ---------- sleep timer ----------
  const setSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null) {
      setSleepAt(null);
      setSleepRemaining(null);
    } else {
      setSleepAt(Date.now() + minutes * 60_000);
    }
  }, []);

  useEffect(() => {
    if (!sleepAt) return;
    const tick = () => {
      const left = Math.max(0, Math.round((sleepAt - Date.now()) / 1000));
      setSleepRemaining(left);
      if (left <= 0) stop();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sleepAt, stop]);

  // ---------- now playing (ICY StreamTitle) ----------
  useEffect(() => {
    if (status !== "playing" || !current) return;
    const u = streamParam(current.stream);
    if (!u) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch(`/api/now-playing?u=${u}`);
        const d = await r.json();
        if (!cancelled && d.title) setNowPlaying(d.title);
      } catch {
        /* station may not expose ICY metadata */
      }
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status, current]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        const on = !next.has(id);
        if (on) next.add(id);
        else next.delete(id);
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
        setFavMap((m) => {
          const mm = { ...m };
          if (on && current && current.id === id) mm[id] = current;
          if (!on) delete mm[id];
          localStorage.setItem("emfm:favmap", JSON.stringify(mm));
          return mm;
        });
        return next;
      });
    },
    [current]
  );

  // ---------- volume / mute ----------
  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    const audio = audioRef.current;
    if (audio) {
      audio.volume = clamped;
      if (clamped > 0 && audio.muted) {
        audio.muted = false;
        setMuted(false);
        localStorage.setItem(MUTE_KEY, "false");
      }
    }
    setVolumeState(clamped);
    localStorage.setItem(VOL_KEY, JSON.stringify(clamped));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const m = !audio.muted;
    audio.muted = m;
    setMuted(m);
    localStorage.setItem(MUTE_KEY, JSON.stringify(m));
  }, []);

  // ---------- media session ----------
  useEffect(() => {
    if (!("mediaSession" in navigator) || !current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowPlaying || current.name,
      artist: nowPlaying ? current.name : "Elanjai Media FM",
      album: `${current.language} · ${current.country}`,
    });
    navigator.mediaSession.setActionHandler("play", () => toggle());
    navigator.mediaSession.setActionHandler("pause", () => toggle());
    navigator.mediaSession.setActionHandler("stop", () => stop());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("previoustrack", () => prev());
  }, [current, nowPlaying, toggle, stop, next, prev]);

  // ---------- keyboard shortcuts ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === "n" || e.key === "N") {
        next();
      } else if (e.key === "p" || e.key === "P") {
        prev();
      } else if (e.key === "ArrowUp") {
        setVolume(volume + 0.1);
      } else if (e.key === "ArrowDown") {
        setVolume(volume - 0.1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, toggleMute, next, prev, setVolume, volume]);

  const value = useMemo<AudioCtx>(
    () => ({
      current,
      status,
      error,
      nowPlaying,
      volume,
      setVolume,
      muted,
      toggleMute,
      play,
      toggle,
      stop,
      next,
      prev,
      sleepRemaining,
      setSleepTimer,
      favorites,
      toggleFavorite,
      recents,
      clearRecents,
      favoriteStations: [...favorites]
        .map((id) => favMap[id])
        .filter((x): x is PublicStation => Boolean(x)),
      peekNext,
    }),
    [
      current, status, error, nowPlaying, volume, setVolume, muted, toggleMute,
      play, toggle, stop, next, prev, sleepRemaining, setSleepTimer,
      favorites, toggleFavorite, recents, favMap, clearRecents, peekNext,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
