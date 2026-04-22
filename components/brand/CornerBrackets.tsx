import { cn } from "@/lib/utils";

type CornerBracketsProps = {
  children: React.ReactNode;
  /** Leg length of each L-shaped bracket, in px. */
  size?: number;
  /** Pixel thickness of the bracket stroke. */
  thickness?: number;
  /** CSS color string (e.g. `var(--color-ink-2)`). */
  color?: string;
  /** Inset from the content edges — positive pulls brackets inside. */
  inset?: number;
  className?: string;
};

/**
 * Decorative corner-bracket frame (`⌐ ¬ L ⌟`) — the section-framing motif
 * carried over from the printed frame template in §4.
 *
 * Four absolutely-positioned L shapes are drawn with `border-l` / `border-t`
 * etc. on tiny spans. The wrapper sets `position: relative` and passes
 * children through unchanged.
 */
export function CornerBrackets({
  children,
  size = 14,
  thickness = 1,
  color = "var(--color-ink-2)",
  inset = 0,
  className,
}: CornerBracketsProps) {
  const common: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: color,
    pointerEvents: "none",
  };
  const t = `${thickness}px`;

  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden
        style={{
          ...common,
          top: inset,
          left: inset,
          borderLeftWidth: t,
          borderTopWidth: t,
        }}
      />
      <span
        aria-hidden
        style={{
          ...common,
          top: inset,
          right: inset,
          borderRightWidth: t,
          borderTopWidth: t,
        }}
      />
      <span
        aria-hidden
        style={{
          ...common,
          bottom: inset,
          left: inset,
          borderLeftWidth: t,
          borderBottomWidth: t,
        }}
      />
      <span
        aria-hidden
        style={{
          ...common,
          bottom: inset,
          right: inset,
          borderRightWidth: t,
          borderBottomWidth: t,
        }}
      />
      {children}
    </div>
  );
}
