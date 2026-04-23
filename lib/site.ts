/**
 * Canonical site URL. Used by the sitemap, robots.txt, and JSON-LD. Set
 * `NEXT_PUBLIC_SITE_URL` in .env to override (e.g. for a staging deploy);
 * production falls back to the launch domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://orbitalartifacts.shop";
