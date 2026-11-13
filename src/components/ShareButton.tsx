"use client";

import { useState } from "react";
import Icon from "./Icon";

/** Bordered-circle share button — navigator.share with clipboard fallback. */
export default function ShareButton({ slug, name }: { slug: string; name: string }) {
  const [shared, setShared] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${location.origin}/station/${slug}`;
        try {
          if (navigator.share) await navigator.share({ title: name, url });
          else {
            await navigator.clipboard.writeText(url);
            setShared(true);
            setTimeout(() => setShared(false), 1500);
          }
        } catch {
          /* user dismissed share sheet */
        }
      }}
      aria-label="Share station"
      title={shared ? "Link copied!" : "Share station"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface transition ${
        shared ? "text-brand-2 dark:text-accent" : "text-muted hover:text-ink"
      }`}
    >
      <Icon name={shared ? "check" : "share"} size={18} strokeWidth={1.8} />
    </button>
  );
}
