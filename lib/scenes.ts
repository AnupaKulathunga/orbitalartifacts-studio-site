/**
 * Scene data model + Sanity-backed catalogue helpers.
 *
 * Types mirror the Sanity `scene` schema in §9. `SEED_SCENES` remains the
 * canonical seed source for `scripts/seed-sanity.ts`; the helpers at the
 * bottom of this file fetch live documents from Sanity via GROQ.
 */

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
  "ASTER",
  "MODIS",
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
  catalogueNumber: string;
  slug: string;
  title: string;
  subtitle: string;
  coords: { lat: number; lng: number; formatted: string };
  region: Region;
  sensor: Sensor;
  bandCombo: string;
  treatment: Treatment;
  acquisitionDate: string; // YYYY-MM-DD
  processingNotes?: string;
  narrative: string;
  imageUrl?: string;
  availability: MarketplaceLink[];
  featured: boolean;
  publishedAt: string; // ISO datetime
};

const LOREM =
  "Lorem ipsum — scene narrative pending. Final copy will be edited in Sanity Studio once M5 is live.";

export const SEED_SCENES: ReadonlyArray<Scene> = [
  {
    catalogueNumber: "OA-0001",
    slug: "re-entry",
    title: "Re-entry",
    subtitle: "Jebel Kissu, Sudan",
    coords: { lat: 21.6, lng: 25.1, formatted: "N 21.6° · E 25.1°" },
    region: "Desert",
    sensor: "Landsat 8",
    bandCombo: "Bands 7-6-4",
    treatment: "False-color",
    acquisitionDate: "2019-04-19",
    narrative: LOREM,
    imageUrl: "/scenes/re-entry.jpg",
    availability: [],
    featured: true,
    publishedAt: "2025-01-15T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0002",
    slug: "painted-horse",
    title: "Painted Horse",
    subtitle: "Isla Isabela, Galápagos",
    coords: { lat: 0.02, lng: -91.33, formatted: "N 0.02° · W 91.33°" },
    region: "Island",
    sensor: "ASTER",
    bandCombo: "Bands 3-2-1",
    treatment: "False-color",
    acquisitionDate: "2017-11-23",
    narrative: LOREM,
    imageUrl: "/scenes/painted-horse.jpg",
    availability: [],
    featured: true,
    publishedAt: "2025-01-22T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0003",
    slug: "icelandic-tiger",
    title: "Icelandic Tiger",
    subtitle: "Northern Iceland",
    coords: { lat: 65.6, lng: -18.3, formatted: "N 65.6° · W 18.3°" },
    region: "Mountain",
    sensor: "Landsat 8",
    bandCombo: "Bands 7-5-2",
    treatment: "False-color",
    acquisitionDate: "1999-10-21",
    narrative: LOREM,
    imageUrl: "/scenes/icelandic-tiger.jpg",
    availability: [],
    featured: true,
    publishedAt: "2025-02-04T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0004",
    slug: "salty-desolation",
    title: "Salty Desolation",
    subtitle: "Etosha Pan, Namibia",
    coords: { lat: -18.83, lng: 16.32, formatted: "S 18.83° · E 16.32°" },
    region: "Desert",
    sensor: "Landsat 8",
    bandCombo: "Infrared composite",
    treatment: "False-color",
    acquisitionDate: "2018-09-06",
    narrative: LOREM,
    imageUrl: "/scenes/salty-desolation.jpg",
    availability: [],
    featured: false,
    publishedAt: "2025-02-12T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0005",
    slug: "facing-the-tide",
    title: "Facing the Tide",
    subtitle: "Rupert Bay, Quebec",
    coords: { lat: 51.52, lng: -78.95, formatted: "N 51.52° · W 78.95°" },
    region: "Coast",
    sensor: "Landsat 8",
    bandCombo: "Natural color",
    treatment: "Natural",
    acquisitionDate: "2016-08-19",
    narrative: LOREM,
    imageUrl: "/scenes/facing-the-tide.jpg",
    availability: [],
    featured: false,
    publishedAt: "2025-02-20T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0006",
    slug: "copper-and-blue",
    title: "Copper and Blue",
    subtitle: "Whitefish Lake, NWT",
    coords: { lat: 62.66, lng: -107.11, formatted: "N 62.66° · W 107.11°" },
    region: "Arctic",
    sensor: "Landsat 8",
    bandCombo: "Infrared composite",
    treatment: "False-color",
    acquisitionDate: "2020-06-24",
    narrative: LOREM,
    imageUrl: "/scenes/copper-and-blue.jpg",
    availability: [],
    featured: false,
    publishedAt: "2025-03-01T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0007",
    slug: "van-gogh-space",
    title: "Van Gogh From Space",
    subtitle: "Gotland, Baltic Sea",
    coords: { lat: 57.5, lng: 18.5, formatted: "N 57.5° · E 18.5°" },
    region: "Island",
    sensor: "Landsat 8",
    bandCombo: "Bands 4-3-2",
    treatment: "Natural",
    acquisitionDate: "2005-07-13",
    narrative: LOREM,
    imageUrl: "/scenes/van-gogh-space.jpg",
    availability: [],
    featured: true,
    publishedAt: "2025-03-10T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0008",
    slug: "luminescence",
    title: "Luminescence",
    subtitle: "Suwannee River, Florida",
    coords: { lat: 29.3, lng: -83.1, formatted: "N 29.3° · W 83.1°" },
    region: "Coast",
    sensor: "Landsat 8",
    bandCombo: "Bands 5-4-3",
    treatment: "False-color",
    acquisitionDate: "2015-02-20",
    narrative: LOREM,
    imageUrl: "/scenes/luminescence.jpg",
    availability: [],
    featured: true,
    publishedAt: "2025-03-18T00:00:00Z",
  },
];

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

export async function getFeaturedScenes(limit = 3): Promise<ReadonlyArray<Scene>> {
  const scenes = await client.fetch<Scene[]>(FEATURED_SCENES_QUERY);
  return scenes.slice(0, limit);
}

export async function getFeaturedPool(): Promise<ReadonlyArray<Scene>> {
  return client.fetch<Scene[]>(FEATURED_SCENES_QUERY);
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
 * Prev/next within the newest-first catalogue — matches the archive's
 * default sort so navigating feels continuous with how the user arrived.
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
