/** Animated equalizer bars — marks live playback. */
export default function EqBars({
  className = "",
  barClassName = "bg-brand-2 dark:bg-accent",
}: {
  className?: string;
  barClassName?: string;
}) {
  return (
    <span className={`flex h-3 shrink-0 items-end gap-[2px] ${className}`} aria-hidden>
      {[10, 16, 12, 18].map((h, i) => (
        <span
          key={i}
          className={`eq-bar w-[3px] rounded-sm ${barClassName}`}
          style={{ height: (h / 18) * 100 + "%" }}
        />
      ))}
    </span>
  );
}
