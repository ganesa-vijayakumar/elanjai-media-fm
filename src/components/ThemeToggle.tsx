"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

const KEY = "emfm:theme";

function resolveSaved(): boolean {
  const saved = localStorage.getItem(KEY);
  if (saved === "dark" || saved === "light") return saved === "dark";
  // legacy "system" value or nothing saved → follow OS once
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const d = resolveSaved();
    queueMicrotask(() => setDark(d));
    document.documentElement.dataset.theme = d ? "dark" : "light";
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem(KEY, next ? "dark" : "light");
    document.documentElement.dataset.theme = next ? "dark" : "light";
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-ink"
    >
      {dark ? (
        <Icon name="sun" size={17} strokeWidth={1.8} />
      ) : (
        <Icon name="moon" size={17} strokeWidth={1.8} />
      )}
    </button>
  );
}
