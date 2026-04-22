import { cn } from "@/lib/utils";

type SignalRingsProps = {
  /**
   * Where the rings are anchored. `left` / `right` crop them at the screen
   * edge so they bleed off-viewport like the printed banner. `center` draws
   * a full set around a middle point.
   */
  position?: "left" | "right" | "center";
  /** Number of concentric rings. Spec §4: 3–5. */
  count?: number;
  /** Overall opacity. Spec §4: 5–8%. */
  opacity?: number;
  /** Optional stroke color (via `currentColor`). */
  className?: string;
};

/**
 * The concentric "signal rings" flourish carried over from the printed
 * banners. Renders as a decorative SVG sized to its parent — the parent
 * should be `relative` and the rings will fill it absolutely.
 *
 * Not interactive; always `aria-hidden`.
 */
export function SignalRings({
  position = "right",
  count = 5,
  opacity = 0.08,
  className,
}: SignalRingsProps) {
  const cx = position === "left" ? 0 : position === "right" ? 100 : 50;
  const cy = 50;
  const base = position === "center" ? 10 : 18;
  const step = 14;
  const rings = Array.from({ length: count }, (_, i) => base + i * step);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-ink-2",
        className,
      )}
      style={{ opacity }}
    >
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.18"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
