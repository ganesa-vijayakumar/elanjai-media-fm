import { ICON_PATHS, type IconName } from "@/lib/icon-paths";

/** Design-system icon — 24px glyph box, round caps, filled transport icons. */
export default function Icon({
  name,
  size = 22,
  strokeWidth = 1.9,
  className = "",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const { d, fill } = ICON_PATHS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={`shrink-0 ${className}`}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
