"use client";

import { useState } from "react";

/** Station logo with graceful fallback to colored initials (favicons 404 a lot). */
export default function StationLogo({
  src,
  name,
  size = 96,
  className = "",
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(!src);
  if (broken) {
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    return (
      <div
        className={`@container flex aspect-square items-center justify-center rounded-[28%] bg-gradient-to-br from-brand-2 to-brand font-display font-bold text-accent shadow-md shadow-brand/15 ${className}`}
        aria-hidden
      >
        <span style={{ fontSize: "32cqw", lineHeight: 1 }}>{initials}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote favicons can't go through next/image
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      loading="lazy"
      className={`rounded-[28%] object-cover bg-surface-2 ${className}`}
      onError={() => setBroken(true)}
    />
  );
}
