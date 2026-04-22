/**
 * Scene data model + static seed catalogue.
 *
 * The types here mirror the Sanity `scene` schema in §9 exactly so that when
 * M6 flips the data source from this file to Sanity GROQ queries, no
 * consumer needs to change. In M3 and M4 every page reads from `SEED_SCENES`
 * via the helpers at the bottom of this file.
 *
 * TODO(owner): every narrative is currently a Lorem placeholder — to be
 * edited in Sanity once the Studio is live (M5 + M6).
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
    slug: "lake-natron",
    title: "Lake Natron",
    subtitle: "Tanzania",
    coords: { lat: -2.4, lng: 36.0, formatted: "S 2.4° · E 36.0°" },
    region: "Desert",
    sensor: "Sentinel-2",
    bandCombo: "Bands 4-3-2",
    treatment: "Natural",
    acquisitionDate: "2024-09-18",
    narrative: LOREM,
    imageUrl: "/scenes/lake-natron.jpg",
    availability: [],
    featured: false,
    publishedAt: "2025-02-12T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0005",
    slug: "skeleton-coast",
    title: "Skeleton Coast",
    subtitle: "Namibia",
    coords: { lat: -24.0, lng: 14.5, formatted: "S 24.0° · E 14.5°" },
    region: "Coast",
    sensor: "Sentinel-2",
    bandCombo: "Bands 4-3-2",
    treatment: "Natural",
    acquisitionDate: "2024-05-22",
    narrative: LOREM,
    imageUrl: "/scenes/skeleton-coast.jpg",
    availability: [],
    featured: false,
    publishedAt: "2025-02-20T00:00:00Z",
  },
  {
    catalogueNumber: "OA-0006",
    slug: "great-salt-lake",
    title: "Great Salt Lake",
    subtitle: "Utah, USA",
    coords: { lat: 41.1, lng: -112.6, formatted: "N 41.1° · W 112.6°" },
    region: "Desert",
    sensor: "Sentinel-2",
    bandCombo: "Bands 8-4-3",
    treatment: "False-color",
    acquisitionDate: "2024-06-11",
    narrative: LOREM,
    imageUrl: "/scenes/great-salt-lake.jpg",
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

export function getAllScenes(): ReadonlyArray<Scene> {
  return SEED_SCENES;
}

export function getFeaturedScenes(limit = 3): ReadonlyArray<Scene> {
  return SEED_SCENES.filter((s) => s.featured).slice(0, limit);
}

export function getFeaturedPool(): ReadonlyArray<Scene> {
  return SEED_SCENES.filter((s) => s.featured);
}

export function getSceneBySlug(slug: string): Scene | undefined {
  return SEED_SCENES.find((s) => s.slug === slug);
}
