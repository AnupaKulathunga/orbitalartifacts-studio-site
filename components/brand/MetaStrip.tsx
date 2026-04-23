import { cn } from "@/lib/utils";

type MetaStripProps = {
  // Accept undefined so callers can pass optional scene fields without
  // pre-filtering — we drop empties inside the component.
  items: ReadonlyArray<string | undefined | null | false>;
  align?: "left" | "center" | "right";
  /** Mark character before the first item, e.g. `◉`. Omit to hide. */
  marker?: string | false;
  className?: string;
};

/**
 * Monospace dashboard-style metadata strip — the thin line of coordinates,
 * catalogue numbers, and sensor info used at the top/bottom of key sections.
 *
 * Example: `◉ ORBITAL ARTIFACTS · ARCHIVE · N 07.87° · E 80.77°`
 */
export function MetaStrip({
  items,
  align = "left",
  marker = "◉",
  className,
}: MetaStripProps) {
  const alignClass =
    align === "center"
      ? "justify-center"
      : align === "right"
        ? "justify-end"
        : "justify-start";

  const visible = items.filter((i): i is string => typeof i === "string" && i.length > 0);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted",
        alignClass,
        className,
      )}
    >
      {marker ? (
        <span aria-hidden className="text-rust">
          {marker}
        </span>
      ) : null}
      {visible.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center gap-3">
          {i > 0 ? (
            <span aria-hidden className="text-sand">
              ·
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </div>
  );
}
