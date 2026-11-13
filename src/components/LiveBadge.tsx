/** Yellow LIVE · n pill with animated eq bars (design "live_chip"). */
export default function LiveBadge({
  count,
  className = "",
}: {
  count: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-accent px-2.5 py-1 font-display text-[10.5px] font-bold tracking-wide text-accent-ink ${className}`}
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[10, 16, 12, 18].map((h, i) => (
          <span
            key={i}
            className="eq-bar w-[2.5px] rounded-full bg-accent-ink"
            style={{ height: h * 0.55 }}
          />
        ))}
      </span>
      LIVE · {count}
    </span>
  );
}
