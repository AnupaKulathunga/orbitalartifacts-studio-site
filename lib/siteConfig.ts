/**
 * Site-level config — merges Sanity's `siteSettings` singleton with static
 * defaults. Sanity is the source of truth when present; the static block
 * kicks in as a graceful fallback if the singleton is empty or missing.
 */
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";

export type SiteLink = {
  platform: string;
  url: string;
};

export type SiteSettings = {
  tagline: string;
  originQuestion: string;
  byline: string;
  contactEmail: string;
  socialLinks: SiteLink[];
  marketplaceLinks: SiteLink[];
};

const STATIC_FALLBACK: SiteSettings = {
  tagline: "Earth data, reimagined as art.",
  originQuestion:
    "What if the way satellites see our planet is itself a kind of art?",
  byline: "By Anupa Kulathunga · Sri Lanka",
  contactEmail: "hello@orbitalartifacts.shop",
  socialLinks: [],
  marketplaceLinks: [],
};

type SanitySiteSettings = {
  tagline?: string;
  originQuestion?: string;
  contactEmail?: string;
  socialLinks?: SiteLink[];
  marketplaceLinks?: SiteLink[];
} | null;

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await client.fetch<SanitySiteSettings>(SITE_SETTINGS_QUERY);
  if (!doc) return STATIC_FALLBACK;
  return {
    tagline: doc.tagline?.trim() || STATIC_FALLBACK.tagline,
    originQuestion:
      doc.originQuestion?.trim() || STATIC_FALLBACK.originQuestion,
    byline: STATIC_FALLBACK.byline,
    contactEmail:
      doc.contactEmail?.trim() || STATIC_FALLBACK.contactEmail,
    socialLinks: doc.socialLinks ?? [],
    marketplaceLinks: doc.marketplaceLinks ?? [],
  };
}
