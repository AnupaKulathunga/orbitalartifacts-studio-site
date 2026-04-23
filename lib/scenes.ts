/**
 * Scene data model + Sanity-backed catalogue helpers.
 *
 * Types mirror the Sanity `scene` schema. Helpers fetch live documents
 * from Sanity via GROQ — the catalogue is entirely Sanity-driven, sorted
 * by `catalogueNumber` so OA-001 leads regardless of publish order.
 */

export const SCENE_SOURCES = ["earth-as-art", "processed-by-artist"] as const;
export type SceneSource = (typeof SCENE_SOURCES)[number];

export const REGIONS = [
  "Arctic",
  "Desert",
  "Delta",
  "Coast",
  "Mountain",
  "Urban",
  "Island",
] as const;
export type Region = (typeof REGIONS)[number];

export const SENSORS = [
  "Sentinel-2",
  "Landsat 9",
  "Landsat 8",
  "Landsat 7",
  "Landsat 5",
  "ASTER",
  "MODIS",
  "Terra",
  "Other",
] as const;
export type Sensor = (typeof SENSORS)[number];

export const TREATMENTS = [
  "Natural",
  "False-color",
  "Infrared",
  "Thermal",
] as const;
export type Treatment = (typeof TREATMENTS)[number];

export type MarketplacePlatform =
  | "Etsy"
  | "Redbubble"
  | "Teespring"
  | "Society6"
  | "Amazon"
  | "Other";

export type MarketplaceLink = {
  platform: MarketplacePlatform;
  url: string;
  productType: string;
  startingPrice: number;
};

export type Scene = {
  source: SceneSource;
  catalogueNumber: string;
  slug: string;
  title: string;
  subtitle?: string;
  editionType?: string;
  coords?: { lat: number; lng: number; formatted: string };
  region?: Region;
  sensor?: Sensor | string;
  // Processed-by-artist only:
  bandCombo?: string;
  treatment?: Treatment;
  processingNotes?: string;
  acquisitionDate?: string; // YYYY-MM-DD
  // Earth as Art provenance:
  sourceTitle?: string;
  sourceUrl?: string;
  sourceCollection?: number;
  sourceCredit?: string;
  narrative: string;
  imageUrl?: string;
  availability: MarketplaceLink[];
  featured: boolean;
  publishedAt: string; // ISO datetime
};

import { client } from "@/sanity/lib/client";
import {
  ALL_SCENES_QUERY,
  FEATURED_SCENES_QUERY,
  SCENE_BY_SLUG_QUERY,
  SCENE_SLUGS_QUERY,
} from "@/sanity/queries";

export async function getAllScenes(): Promise<ReadonlyArray<Scene>> {
  return client.fetch<Scene[]>(ALL_SCENES_QUERY);
}

/**
 * Scenes flagged `featured == true` are the curator's explicit picks for
 * the homepage hero/strip. If nothing is flagged (which is the normal
 * state right after bulk ingestion, before the curator has toggled any
 * in Studio), fall back to the first `limit` in catalogue order so the
 * homepage never renders an empty hero column.
 */
async function featuredOrFallback(limit: number): Promise<Scene[]> {
  const featured = await client.fetch<Scene[]>(FEATURED_SCENES_QUERY);
  if (featured.length > 0) return featured;
  const all = await client.fetch<Scene[]>(ALL_SCENES_QUERY);
  return all.slice(0, limit);
}

export async function getFeaturedScenes(limit = 3): Promise<ReadonlyArray<Scene>> {
  const scenes = await featuredOrFallback(limit);
  return scenes.slice(0, limit);
}

export async function getFeaturedPool(): Promise<ReadonlyArray<Scene>> {
  return featuredOrFallback(6);
}

export async function getSceneBySlug(slug: string): Promise<Scene | undefined> {
  const scene = await client.fetch<Scene | null>(SCENE_BY_SLUG_QUERY, { slug });
  return scene ?? undefined;
}

export async function getAllSceneSlugs(): Promise<ReadonlyArray<string>> {
  return client.fetch<string[]>(SCENE_SLUGS_QUERY);
}

export type SceneNeighbours = {
  prev?: Scene;
  next?: Scene;
};

/**
 * Prev/next walking in catalogue-number order (OA-001, OA-002, …). Matches
 * the archive's default sort so scrubbing through scenes feels continuous
 * with how the visitor arrived.
 */
export async function getSceneNeighbours(slug: string): Promise<SceneNeighbours> {
  const ordered = await getAllScenes();
  const idx = ordered.findIndex((s) => s.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ordered[idx - 1] : undefined,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : undefined,
  };
}
