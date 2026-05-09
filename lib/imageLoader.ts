"use client";

/**
 * Default Next.js image loader for the whole site.
 *
 * When the src points at Sanity's CDN we send the resize work there via
 * URL params (`w`, `q`, `auto=format`, `fit=max`). For any other source
 * — local `/brand/*.png`, `/scenes/*.jpg`, externally-hosted hero — we
 * just return the URL untouched so Next.js renders it normally without
 * the `_next/image` proxy hop.
 *
 * Configured globally via `images.loader: "custom"` +
 * `images.loaderFile` in next.config so every <Image> picks it up; no
 * need to thread `loader` props through server→client boundaries.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("https://cdn.sanity.io/")) {
    const base = src.split("?")[0];
    const params = new URLSearchParams({
      w: String(width),
      q: String(quality ?? 80),
      auto: "format",
      fit: "max",
    });
    return `${base}?${params.toString()}`;
  }
  // Local or unknown remote — let Next render the URL as-is.
  return src;
}
