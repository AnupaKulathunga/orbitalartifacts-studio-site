/**
 * Generates SEO title, description, and keyword tags for every scene in
 * Sanity, drawing on the manifest narrative + sensor + location + the
 * studio's curation framing. Templated, deterministic, no LLM call.
 *
 * Output goes straight into the scene's `seoTitle`, `seoDescription`,
 * and `keywords` fields — editors override per-scene in /studio.
 *
 *   npm run generate:seo                 # all scenes that lack SEO copy
 *   npm run generate:seo -- --force      # overwrite even if seoDescription set
 *   npm run generate:seo -- --slug=re-entry  # one specific scene
 *   npm run generate:seo -- --dry-run    # log what would change
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { client as readClient } from "../sanity/lib/client";
import { getWriteClient } from "../sanity/lib/writeClient";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");

type ManifestEntry = {
  slug: string;
  title: string;
  collection: number;
  sourceUrl: string;
  narrative?: string;
  sensor?: string;
  scale?: string;
  acquisitionDate?: string;
  tags?: string[];
};

type SceneRow = {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  catalogueNumber: string;
  sensor?: string;
  acquisitionDate?: string;
  sourceCollection?: number;
  editionSize?: number;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
};

/**
 * Sensor-aware copy. Each entry expands a raw sensor string into a
 * publication-grade description for the SEO body, plus the orbital
 * altitude that grounds the "from X km up" phrasing.
 */
const SENSORS: Record<string, { full: string; altitude: string; agency: string }> = {
  "Landsat 9": {
    full: "NASA and the USGS's Landsat 9 OLI-2 multispectral imager",
    altitude: "705 km",
    agency: "NASA / USGS",
  },
  "Landsat 8": {
    full: "NASA and the USGS's Landsat 8 OLI multispectral imager",
    altitude: "705 km",
    agency: "NASA / USGS",
  },
  "Landsat 7": {
    full: "NASA and the USGS's Landsat 7 ETM+ scanner",
    altitude: "705 km",
    agency: "NASA / USGS",
  },
  "Landsat 5": {
    full: "NASA and the USGS's Landsat 5 Thematic Mapper",
    altitude: "705 km",
    agency: "NASA / USGS",
  },
  "Sentinel-2": {
    full: "ESA's Sentinel-2 MSI",
    altitude: "786 km",
    agency: "ESA Copernicus",
  },
  ASTER: {
    full: "NASA's ASTER instrument aboard the Terra satellite",
    altitude: "705 km",
    agency: "NASA",
  },
  MODIS: {
    full: "NASA's MODIS imager aboard the Terra and Aqua satellites",
    altitude: "705 km",
    agency: "NASA",
  },
  Terra: {
    full: "NASA's Terra Earth-observation satellite",
    altitude: "705 km",
    agency: "NASA",
  },
};

function describeSensor(sensor: string | undefined): string | null {
  if (!sensor) return null;
  for (const key of Object.keys(SENSORS)) {
    if (sensor.includes(key)) return SENSORS[key]!.full;
  }
  return sensor; // pass through whatever USGS gave us (e.g., "Sentinel-2A")
}

function altitudeFor(sensor: string | undefined): string | null {
  if (!sensor) return null;
  for (const key of Object.keys(SENSORS)) {
    if (sensor.includes(key)) return SENSORS[key]!.altitude;
  }
  return null;
}

function agencyFor(sensor: string | undefined): string | null {
  if (!sensor) return null;
  for (const key of Object.keys(SENSORS)) {
    if (sensor.includes(key)) return SENSORS[key]!.agency;
  }
  return null;
}

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Build the seoDescription. Format follows the storytelling chain:
 *   1. Visual hook (USGS narrative)
 *   2. Capture: instrument + altitude + date
 *   3. Processing: scientists at the EROS Center / Copernicus
 *   4. Curation: Orbital Artifacts framing
 *   5. Product: edition + paper + fulfilment
 */
function buildDescription(scene: SceneRow, manifest: ManifestEntry | undefined): string {
  const subtitle = scene.subtitle ? `, ${scene.subtitle}` : "";
  const sensor = describeSensor(scene.sensor);
  const altitude = altitudeFor(scene.sensor);
  const agency = agencyFor(scene.sensor);
  const date = formatDate(scene.acquisitionDate);
  const collectionN = scene.sourceCollection ?? manifest?.collection;
  const ed = scene.editionSize ?? "limited";

  const narrative = (manifest?.narrative ?? "").trim();
  const lead = narrative.length > 0
    ? narrative
    : `${scene.title}${subtitle} is a curated entry from the U.S. Geological Survey's Earth as Art archive.`;

  const captureBits: string[] = [];
  if (sensor) {
    captureBits.push(
      `Captured ${altitude ? `from ${altitude} above Earth ` : ""}by ${sensor}` +
        (date ? ` on ${date}` : ""),
    );
  } else if (date) {
    captureBits.push(`Captured on ${date}`);
  }
  const capture = captureBits.length > 0 ? captureBits.join(". ") + "." : "";

  const processing = agency
    ? `The composite is one of the curated images from the Earth as Art ${collectionN ?? ""} release, processed at the USGS Earth Resources Observation and Science (EROS) Center from raw multispectral data — wavelengths beyond what the human eye can see, mapped into the visible spectrum so geology, vegetation, and water write their own colour.`
    : "The composite was processed from raw multispectral satellite data at the USGS Earth Resources Observation and Science Center.";

  const studio = `Curated, sequenced, and framed by the Orbital Artifacts studio. Cataloged as ${scene.catalogueNumber} and offered as a limited edition of ${ed} prints — pigment inkjet on archival cotton paper (320 gsm), signed and numbered, fulfilled directly from Printify or Gelato to anywhere worldwide.`;

  return [lead, capture, processing, studio].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function buildTitle(scene: SceneRow): string {
  const sub = scene.subtitle ? ` — ${scene.subtitle}` : "";
  // Aim under ~70 chars so Google doesn't truncate.
  const base = `${scene.title}${sub} · Satellite Art Print | Orbital Artifacts`;
  if (base.length <= 70) return base;
  // Drop the closing brand if too long.
  return `${scene.title}${sub} · Satellite Art Print`;
}

function buildKeywords(scene: SceneRow, manifest: ManifestEntry | undefined): string[] {
  const out = new Set<string>();
  out.add(`${scene.title.toLowerCase()} art print`);
  out.add(`${scene.title.toLowerCase()} from space`);
  if (scene.subtitle) {
    out.add(`${scene.subtitle.toLowerCase()} satellite print`);
    out.add(`${scene.subtitle.toLowerCase()} from space`);
    out.add(`${scene.subtitle.toLowerCase()} art print`);
  }
  if (scene.sensor) out.add(`${scene.sensor.toLowerCase()} art`);
  if (manifest?.collection) out.add(`earth as art ${manifest.collection}`);
  out.add("earth as art");
  out.add("satellite imagery");
  out.add("earth observation art");
  out.add("limited edition print");
  out.add("orbital artifacts");
  // Tag-derived geo terms — country, region.
  for (const t of manifest?.tags ?? []) {
    if (
      t.length < 30 &&
      !/Earth As Art|Landsat|Sentinel|ASTER|MODIS|Terra|EROS|NLI|Maps and Mapping|Information Systems|Climate/i.test(
        t,
      )
    ) {
      out.add(`${t.toLowerCase()} satellite print`);
    }
  }
  return [...out].slice(0, 14);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const onlySlug = args.find((a) => a.startsWith("--slug="))?.slice(7);

  const manifest = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "data", "eaa-manifest.json"), "utf-8"),
  ) as ManifestEntry[];
  const bySlug = new Map(manifest.map((e) => [e.slug, e]));

  const scenes = await readClient.fetch<SceneRow[]>(
    `*[_type == "scene" && defined(slug.current)]{
      _id, "slug": slug.current, title, subtitle, catalogueNumber,
      sensor, acquisitionDate, sourceCollection, editionSize,
      seoTitle, seoDescription, keywords
    } | order(catalogueNumber asc)`,
  );

  const candidates = scenes.filter((s) => {
    if (onlySlug && s.slug !== onlySlug) return false;
    if (force) return true;
    return !s.seoDescription || s.seoDescription.trim().length === 0;
  });

  if (candidates.length === 0) {
    console.log(
      "Nothing to generate. (Use --force to overwrite, or --slug=<slug> to target one.)",
    );
    return;
  }

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Generating SEO for ${candidates.length} scene(s)\n`,
  );

  const writer = dryRun ? null : getWriteClient();
  let done = 0;

  for (const scene of candidates) {
    const m = bySlug.get(scene.slug);
    const seoTitle = buildTitle(scene);
    const seoDescription = buildDescription(scene, m);
    const keywords = buildKeywords(scene, m);

    if (dryRun) {
      console.log(`· ${scene.catalogueNumber}  ${scene.title}`);
      console.log(`  TITLE (${seoTitle.length}): ${seoTitle}`);
      console.log(`  DESC (${seoDescription.length}): ${seoDescription.slice(0, 220)}…`);
      console.log(`  KEYS (${keywords.length}): ${keywords.slice(0, 6).join(", ")}…`);
      console.log();
      done++;
      continue;
    }

    await writer!
      .patch(scene._id)
      .set({ seoTitle, seoDescription, keywords })
      .commit();
    done++;
    process.stdout.write(`\r  [${done}/${candidates.length}] ${scene.slug.padEnd(40)}`);
  }

  console.log(
    `\n${dryRun ? "Would update" : "Updated"} ${done} scene(s).`,
  );
}

main().catch((err) => {
  console.error("\nSEO generation failed:");
  console.error(err);
  process.exit(1);
});
