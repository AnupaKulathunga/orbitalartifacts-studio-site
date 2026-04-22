/**
 * Site-level static config used by Header / Footer / About.
 *
 * In M6 this becomes the launch-day fallback when Sanity's `siteSettings`
 * singleton is empty. Treat this file as the source of truth until then.
 *
 * TODO(owner): fill in real handles + shop URLs. Every `#` placeholder
 * should be replaced before going live.
 */
export type SiteLink = {
  platform: string;
  url: string;
  handle?: string;
};

export const siteConfig = {
  contactEmail: "hello@orbitalartifacts.shop",
  tagline: "Earth data, reimagined as art.",
  byline: "By Anupa Kulathunga · Sri Lanka",
  socialLinks: [
    { platform: "Instagram", url: "#", handle: "" },
    { platform: "TikTok", url: "#", handle: "" },
    { platform: "Pinterest", url: "#", handle: "" },
  ] satisfies SiteLink[],
  marketplaceLinks: [
    { platform: "Etsy", url: "#" },
    { platform: "Redbubble", url: "#" },
    { platform: "Teespring", url: "#" },
  ] satisfies SiteLink[],
} as const;
