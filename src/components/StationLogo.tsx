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
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-2 to-brand font-bold text-accent ${className}`}
        style={{ width: size, height: size, fontSize: size / 3 }}
        aria-hidden
      >
        {initials}
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
      className={`rounded-xl object-cover bg-surface-2 ${className}`}
      onError={() => setBroken(true)}
    />
  );
}
