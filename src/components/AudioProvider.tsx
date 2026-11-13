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
  volume: number;
  setVolume: (v: number) => void;
  play: (s: PublicStation) => void;
  toggle: () => void;
  stop: () => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  recents: PublicStation[];
  favoriteStations: PublicStation[];
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

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
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
  const [current, setCurrent] = useState<PublicStation | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.9);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favMap, setFavMap] = useState<Record<string, PublicStation>>({});
  const [recents, setRecents] = useState<PublicStation[]>([]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    // Hydrate persisted state without blocking first paint
    queueMicrotask(() => {
      setFavorites(new Set(read<string[]>(FAV_KEY, [])));
      setFavMap(read<Record<string, PublicStation>>("emfm:favmap", {}));
      setRecents(read<PublicStation[]>(RECENT_KEY, []));
      setVolumeState(read<number>(VOL_KEY, 0.9));
    });
    audio.volume = read<number>(VOL_KEY, 0.9);

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

  const play = useCallback(async (s: PublicStation) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(s);
    setStatus("loading");
    setError(null);
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
      const next = [s, ...prev.filter((r) => r.id !== s.id)].slice(0, 20);
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
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    if (audioRef.current) audioRef.current.volume = clamped;
    setVolumeState(clamped);
    localStorage.setItem(VOL_KEY, JSON.stringify(clamped));
  }, []);

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

  // Media Session — lock-screen / hardware-key controls
  useEffect(() => {
    if (!("mediaSession" in navigator) || !current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.name,
      artist: "Elanjai Media FM",
      album: `${current.language} · ${current.country}`,
    });
    navigator.mediaSession.setActionHandler("play", () => toggle());
    navigator.mediaSession.setActionHandler("pause", () => toggle());
    navigator.mediaSession.setActionHandler("stop", () => stop());
  }, [current, toggle, stop]);

  const value = useMemo<AudioCtx>(
    () => ({
      current,
      status,
      error,
      volume,
      setVolume,
      play,
      toggle,
      stop,
      favorites,
      toggleFavorite,
      recents,
      favoriteStations: favorites
        ? [...favorites]
            .map((id) => favMap[id])
            .filter((x): x is PublicStation => Boolean(x))
        : [],
    }),
    [current, status, error, volume, play, toggle, stop, favorites, toggleFavorite, recents, favMap, setVolume]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
