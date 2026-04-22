import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "lockup" | "inline" | "mark" | "stacked";

// logo-horizontal.png intrinsic dimensions — kept here so we can derive
// pixel width from a target height without round-tripping to layout.
const LOCKUP_ASPECT = 3973 / 1346;

type LogoProps = {
  /**
   * `lockup` — the pre-composed horizontal PNG (mark + wordmark).
   *   Used in the header and footer. `markSize` is interpreted as the
   *   lockup's target height in px.
   * `inline` — mark + Archivo wordmark rendered as text.
   * `mark` — just the mark, no text.
   * `stacked` — mark above, wordmark below.
   */
  variant?: LogoVariant;
  /** Size of the mark in px; wordmark scales proportionally. */
  markSize?: number;
  /** If set, the whole logo renders inside a `<Link>`. */
  href?: string;
  className?: string;
};

/**
 * Orbital Artifacts logo.
 *
 * The mark is the real `mark-on-light.png` from `/Brand/Logo/`, rendered
 * with `mix-blend-mode: multiply`. The PNG is pure-black art on an opaque
 * white background (no alpha channel), and multiply blend lets the white
 * disappear into whatever surface sits beneath — paper, paper-2, whatever
 * — while the black mark stays black. That gives us pixel-perfect brand
 * geometry without any SVG tracing or alpha-channel conversion.
 *
 * The wordmark is rendered as text in Archivo 700 so tracking + weight
 * match the rest of the UI at any size.
 *
 * Caveat: multiply only blends correctly when the surface beneath is
 * lighter than the mark. Since paper (`#ebe5d6`) is the only background in
 * the system and the mark is pure black, this always holds.
 */
export function Logo({
  variant = "inline",
  markSize = 28,
  href,
  className,
}: LogoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  const mark = (
    <img
      src="/brand/mark-on-light.png"
      alt=""
      aria-hidden
      width={markSize}
      height={markSize}
      className="shrink-0 select-none"
      style={{
        width: markSize,
        height: markSize,
        mixBlendMode: "multiply",
      }}
    />
  );

  const wordmark = (
    <span
      className="whitespace-nowrap font-sans font-bold uppercase leading-none tracking-[0.16em] text-ink"
      style={{ fontSize: Math.round(markSize * 0.45) }}
    >
      Orbital Artifacts
    </span>
  );

  let body: React.ReactNode;
  if (variant === "lockup") {
    const height = markSize;
    const width = Math.round(height * LOCKUP_ASPECT);
    body = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/brand/logo-horizontal.png"
        alt="Orbital Artifacts"
        width={width}
        height={height}
        className="shrink-0 select-none"
        style={{ width, height }}
      />
    );
  } else if (variant === "mark") {
    body = mark;
  } else if (variant === "stacked") {
    body = (
      <span className="inline-flex flex-col items-center gap-3">
        {mark}
        {wordmark}
      </span>
    );
  } else {
    body = (
      <span className="inline-flex items-center gap-2.5">
        {mark}
        {wordmark}
      </span>
    );
  }

  const wrapperClass = cn(
    "inline-flex items-center transition-opacity",
    href && "hover:opacity-80",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={wrapperClass}
        aria-label="Orbital Artifacts — home"
      >
        {body}
      </Link>
    );
  }
  return <span className={wrapperClass}>{body}</span>;
}
