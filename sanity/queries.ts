import { groq } from "next-sanity";

/**
 * Projection shared across all scene queries — shapes each Sanity `scene`
 * document to match the `Scene` type in `lib/scenes.ts` so downstream
 * consumers don't care where the data came from.
 *
 * - `hero.asset->url` resolves the image reference to a plain Sanity CDN
 *   URL (e.g. https://cdn.sanity.io/images/<proj>/<dataset>/<hash>.jpg).
 *   Next/Image optimizes this via the allowed remote pattern.
 * - `pt::text(narrative)` flattens portable text to plain text for the
 *   current detail-page renderer. When we upgrade to rich narrative
 *   (emphasis / italics), swap this for the raw array.
 */
const SCENE_PROJECTION = groq`{
  source,
  catalogueNumber,
  "slug": slug.current,
  title,
  subtitle,
  editionType,
  coords {
    lat,
    lng,
    formatted,
  },
  region,
  sensor,
  bandCombo,
  treatment,
  acquisitionDate,
  processingNotes,
  sourceTitle,
  sourceUrl,
  sourceCollection,
  sourceCredit,
  "narrative": pt::text(narrative),
  // ?fm=webp lets Sanity negotiate WebP when the browser supports it
  // (Chrome, Firefox, Safari 14+) and falls back to JPEG elsewhere —
  // saves ~30% bandwidth on the hero grid with no code change downstream.
  "imageUrl": hero.asset->url + "?fm=webp",
  "availability": coalesce(availability[]{
    platform,
    url,
    productType,
    startingPrice,
  }, []),
  featured,
  publishedAt,
}`;

// Catalogue number is the canonical order: OA-001 leads, OA-NNN follows.
// Lexicographic sort works because numbers are fixed-width (3+ digits).
export const ALL_SCENES_QUERY = groq`
  *[_type == "scene" && defined(slug.current)]
  | order(catalogueNumber asc) ${SCENE_PROJECTION}
`;

export const FEATURED_SCENES_QUERY = groq`
  *[_type == "scene" && featured == true && defined(slug.current)]
  | order(catalogueNumber asc) ${SCENE_PROJECTION}
`;

export const SCENE_BY_SLUG_QUERY = groq`
  *[_type == "scene" && slug.current == $slug][0] ${SCENE_PROJECTION}
`;

export const SCENE_SLUGS_QUERY = groq`
  *[_type == "scene" && defined(slug.current)].slug.current
`;

export const PRESS_ENTRIES_QUERY = groq`
  *[_type == "pressEntry"] | order(date desc) {
    _id,
    publication,
    date,
    title,
    url,
    quote,
    "logoUrl": logo.asset->url,
  }
`;

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    tagline,
    "originQuestion": pt::text(originQuestion),
    contactEmail,
    "socialLinks": coalesce(socialLinks[]{ platform, url }, []),
    "marketplaceLinks": coalesce(marketplaceLinks[]{ platform, url }, []),
  }
`;
