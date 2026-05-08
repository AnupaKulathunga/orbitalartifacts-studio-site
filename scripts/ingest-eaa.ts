/**
 * Ingests curated Earth as Art entries into the Sanity dataset.
 *
 * Inputs:
 *   - `data/eaa-manifest.json` → every EaA entry fetched via fetch:eaa
 *   - Sanity `curationSession` singleton → pick list + starting number,
 *     written by whoever is using /curate (yourself or a collaborator)
 *
 * For each pick, in the selected order:
 *   1. Assign `OA-<startingNumber + index>` as catalogueNumber
 *   2. Download the full-res JPG from the S3 URL in the manifest
 *   3. Upload it to Sanity assets (deduped via a stable label)
 *   4. `createOrReplace` a scene doc with _id = `scene-<slug>`
 *
 * Idempotent. Safe to re-run after editing the manifest or selections.
 *
 *   npm run ingest:eaa              # live run
 *   npm run ingest:eaa -- --dry-run # logs what would happen, no writes
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { client as readClient } from "../sanity/lib/client";
import { getWriteClient } from "../sanity/lib/writeClient";
import { CURATION_SESSION_QUERY } from "../sanity/queries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

type ManifestEntry = {
  slug: string;
  title: string;
  collection: number;
  sourceUrl: string;
  mediaUrl: string;
  thumbUrl: string;
  imageUrl: string;
  narrative?: string;
  sensor?: string;
  scale?: string;
  acquisitionDate?: string;
  tags?: string[];
};

type Selections = {
  startingNumber: number;
  picks: string[];
  updatedAt?: string;
  updatedBy?: string | null;
};

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

/**
 * Pool of valid edition sizes: integers 8..32 with multiples of 9 removed
 * (9, 18, 27). Per-scene randomness drives scarcity without anyone seeing
 * a too-clean number on a print.
 */
const EDITION_POOL = [
  8, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30,
  31, 32,
];

/**
 * Deterministic per-slug hash so re-running ingest doesn't randomize the
 * edition size and reset the curator's stock counts. FNV-1a 32-bit.
 */
function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickEdition(slug: string): number {
  return EDITION_POOL[hashSlug(slug) % EDITION_POOL.length]!;
}

/**
 * Compute the publication date for a scene at zero-based catalogue index.
 *
 * Launch batch (indices 0..19 → OA-001..OA-020) all share `launch`.
 * After that, scenes drop in pairs every Tuesday + Friday — so the rest
 * of the catalogue staggers across the calendar without manual touches.
 *
 *   Tue release: launch + (week * 7) + 4 days
 *   Fri release: launch + (week * 7) + 7 days
 *
 * Assumes `launch` is itself a Friday. If you launch on another weekday
 * the offsets still produce a Tue/Fri rhythm, just from a shifted base.
 */
function computePublishedAt(index: number, launch: Date, launchSize: number): Date {
  if (index < launchSize) return launch;
  const n = index - launchSize;
  const releaseIndex = Math.floor(n / 2);
  const week = Math.floor(releaseIndex / 2);
  const isTuesdaySlot = releaseIndex % 2 === 0;
  const dayOffset = week * 7 + (isTuesdaySlot ? 4 : 7);
  const d = new Date(launch);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return d;
}

function loadJson<T>(relPath: string): T {
  const p = path.join(REPO_ROOT, relPath);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing ${relPath}. Run the upstream step first.`);
  }
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

async function loadSelections(): Promise<Selections> {
  // The deployed /curate UI writes into Sanity, so that's our primary
  // source. Fall back to the local file — handy when the curator is
  // working offline and hand-edits `data/eaa-selections.json`.
  const fromSanity = await readClient.fetch<Selections | null>(
    CURATION_SESSION_QUERY,
  );
  if (fromSanity && fromSanity.picks && fromSanity.picks.length > 0) {
    console.log(
      `Using curation session from Sanity (${fromSanity.picks.length} picks` +
        (fromSanity.updatedBy ? `, saved by ${fromSanity.updatedBy}` : "") +
        ").",
    );
    return fromSanity;
  }
  const filePath = path.join(REPO_ROOT, "data", "eaa-selections.json");
  if (fs.existsSync(filePath)) {
    console.log("Using curation session from data/eaa-selections.json.");
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Selections;
  }
  throw new Error(
    "No curation session found. Pick scenes at /curate (saved to Sanity), " +
      "or write data/eaa-selections.json locally.",
  );
}

function narrativeToPortableText(text: string) {
  return [
    {
      _type: "block",
      _key: "p0",
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: "s0", text, marks: [] }],
    },
  ];
}

/**
 * USGS sometimes reports sensor as "Landsat 8" (clean) or as a concatenated
 * blob with trailing labels. Collapse to the canonical enum value the
 * scene schema knows about; pass through anything else as free text.
 */
function normalizeSensor(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const known = [
    "Sentinel-2",
    "Landsat 9",
    "Landsat 8",
    "Landsat 7",
    "Landsat 5",
    "ASTER",
    "MODIS",
    "Terra",
  ];
  for (const k of known) if (raw.includes(k)) return k;
  return raw.trim();
}

/**
 * EaA taxonomy tags mix generic labels (NLI, earth as art) with the
 * country/region. Strip the boilerplate and treat the last remaining
 * tag as the location subtitle — which is how USGS orders them.
 */
const BOILERPLATE = new Set([
  "earth as art",
  "Earth Resources Observation and Science (EROS) Center",
  "NLI",
  "Maps and Mapping",
  "Information Systems",
  "Climate",
  "Science of the American Southwest",
]);

function extractLocation(tags?: string[]): string | undefined {
  if (!tags) return undefined;
  const cleaned = tags.filter(
    (t) =>
      !BOILERPLATE.has(t) &&
      !/^Earth As Art\s*\d*$/i.test(t) &&
      !/^Landsat/i.test(t) &&
      !/^Sentinel/i.test(t) &&
      !/^ASTER/i.test(t) &&
      !/^Terra/i.test(t),
  );
  return cleaned[cleaned.length - 1] ?? undefined;
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0",
    },
  });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limit =
    parseInt(args.find((a) => a.startsWith("--limit="))?.slice(8) ?? "0") || 0;

  // Launch defaults to today (UTC midnight). Pass --launch=YYYY-MM-DD to
  // override — useful when you want to schedule a future kickoff or
  // re-ingest without bumping every publication date.
  const launchArg = args.find((a) => a.startsWith("--launch="))?.slice(9);
  const launch = launchArg
    ? new Date(`${launchArg}T00:00:00Z`)
    : new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(launch.getTime())) {
    console.error(`Invalid --launch date: ${launchArg}`);
    process.exit(1);
  }
  const launchBatchSize = 20;

  const manifest = loadJson<ManifestEntry[]>("data/eaa-manifest.json");
  const selections = await loadSelections();

  if (!selections.picks.length) {
    console.error("No picks — open /curate (or /studio → Curation session) first.");
    process.exit(1);
  }

  const bySlug = new Map(manifest.map((e) => [e.slug, e]));
  const missing = selections.picks.filter((s) => !bySlug.has(s));
  if (missing.length) {
    console.error("Picks not found in manifest:", missing.join(", "));
    console.error("Re-run `npm run fetch:eaa` or remove these from picks.");
    process.exit(1);
  }

  const picks = limit > 0 ? selections.picks.slice(0, limit) : selections.picks;
  const toIngest = picks.map((slug, i) => {
    const entry = bySlug.get(slug);
    if (!entry) throw new Error(`Manifest entry missing for ${slug}`);
    const n = selections.startingNumber + i;
    const publishedAt = computePublishedAt(i, launch, launchBatchSize);
    const editionSize = pickEdition(slug);
    return {
      entry,
      catalogueNumber: `OA-${pad(n)}`,
      index: i,
      publishedAt,
      editionSize,
    };
  });
  if (toIngest.length === 0) {
    console.error("Nothing to ingest.");
    process.exit(1);
  }

  const first = toIngest[0]!;
  const last = toIngest[toIngest.length - 1]!;
  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Ingesting ${toIngest.length} scenes — ` +
      `${first.catalogueNumber} → ${last.catalogueNumber}`,
  );
  console.log(
    `Launch ${launch.toISOString().slice(0, 10)} (first ${launchBatchSize}); ` +
      `final release ${last.publishedAt.toISOString().slice(0, 10)}\n`,
  );

  const client = dryRun ? null : getWriteClient();

  // Pre-fetch every existing scene doc in one go so the worker pool can
  // skip image re-upload on docs that already have a hero. Cuts re-run
  // time from ~1 hour to ~3 minutes when most are already there.
  type ExistingScene = {
    _id: string;
    hasHero: boolean;
    editionSize?: number;
    remaining?: number;
    featured?: boolean;
    publishedAt?: string;
    availability?: unknown[];
  };
  const existingMap = new Map<string, ExistingScene>();
  if (!dryRun) {
    const ids = toIngest.map(({ entry }) => `scene-${entry.slug}`);
    const rows = await client!.fetch<ExistingScene[]>(
      `*[_id in $ids]{
        _id,
        "hasHero": defined(hero.asset),
        editionSize,
        remaining,
        featured,
        publishedAt,
        availability,
      }`,
      { ids },
    );
    for (const row of rows) existingMap.set(row._id, row);
  }

  let succeeded = 0;
  let failed = 0;
  let skippedImageReupload = 0;
  const concurrency = 4;

  async function ingestOne(item: (typeof toIngest)[number]): Promise<void> {
    const { entry, catalogueNumber, publishedAt, editionSize } = item;
    const releaseLabel = publishedAt.toISOString().slice(0, 10);
    const subtitle = extractLocation(entry.tags);
    const sensor = normalizeSensor(entry.sensor);
    const acquisitionDate = entry.acquisitionDate
      ? entry.acquisitionDate.slice(0, 10)
      : undefined;
    const sourceCredit = `U.S. Geological Survey — Earth as Art ${entry.collection}`;

    if (dryRun) {
      console.log(
        `· ${catalogueNumber}  ${entry.title}  (${entry.slug})  ` +
          `· release ${releaseLabel}  · ed.${editionSize}`,
      );
      console.log(
        `    would upload ${entry.imageUrl}\n` +
          `    subtitle: ${subtitle ?? "(none)"} · sensor: ${sensor ?? "(none)"} · date: ${acquisitionDate ?? "(none)"}\n` +
          `    credit:   ${sourceCredit}\n` +
          `    narrative: ${(entry.narrative ?? "(missing)").slice(0, 80)}…`,
      );
      succeeded++;
      return;
    }

    try {
      const id = `scene-${entry.slug}`;
      const existing = existingMap.get(id);

      // Reuse the existing hero asset when the doc already has one —
      // saves the full download + upload round-trip on re-runs. Only
      // re-uploads when the scene is genuinely new.
      let heroRef: { _ref: string } | null = null;
      let bufferSize = 0;
      if (existing?.hasHero) {
        skippedImageReupload++;
      } else {
        const buffer = await downloadImage(entry.imageUrl);
        bufferSize = buffer.length;
        const asset = await client!.assets.upload("image", buffer, {
          filename: `${catalogueNumber}-${entry.slug}.jpg`,
          label: `oa-eaa-${entry.slug}`,
        });
        heroRef = { _ref: asset._id };
      }

      const baseFields: Record<string, unknown> = {
        _id: id,
        _type: "scene",
        source: "earth-as-art",
        catalogueNumber,
        title: entry.title,
        slug: { _type: "slug", current: entry.slug },
        subtitle,
        sensor,
        acquisitionDate,
        sourceTitle: entry.title,
        sourceUrl: entry.sourceUrl,
        sourceCollection: entry.collection,
        sourceCredit,
        narrative: narrativeToPortableText(
          entry.narrative ?? "Narrative pending — see USGS source page.",
        ),
        // Editor-controlled fields preserved on re-runs.
        availability: existing?.availability ?? [],
        editionSize: existing?.editionSize ?? editionSize,
        remaining: existing?.remaining ?? editionSize,
        featured: existing?.featured ?? false,
        publishedAt: existing?.publishedAt ?? publishedAt.toISOString(),
      };
      if (heroRef) {
        baseFields.hero = {
          _type: "image",
          asset: { _type: "reference", _ref: heroRef._ref },
        };
      }

      // Strip undefineds so Sanity doesn't choke on the mutation.
      for (const k of Object.keys(baseFields)) {
        if (baseFields[k] === undefined) delete baseFields[k];
      }

      if (existing) {
        // Patch keeps the existing hero reference intact and just
        // refreshes editorial fields (title, narrative, etc.).
        const patchFields = { ...baseFields };
        delete (patchFields as Record<string, unknown>)._id;
        delete (patchFields as Record<string, unknown>)._type;
        await client!.patch(id).set(patchFields).commit();
      } else {
        await client!.createOrReplace(baseFields as never);
      }

      const tag = existing?.hasHero ? "patched" : "ingested";
      const sizeNote = bufferSize ? ` (${(bufferSize / 1024).toFixed(0)} KB)` : "";
      succeeded++;
      console.log(
        `· ${catalogueNumber}  ${entry.title.padEnd(28)}  · release ${releaseLabel}  · ed.${editionSize}  ✓ ${tag}${sizeNote}`,
      );
    } catch (err) {
      failed++;
      console.error(`· ${catalogueNumber}  ${entry.title}  ✗ ${(err as Error).message}`);
    }
  }

  // Simple worker pool — `concurrency` ingestOne()s in flight at once.
  // Sanity rate limits start mattering above ~10 concurrent writes; 4
  // is comfortable and keeps Cloudflare happy on the S3 downloads too.
  const queue = [...toIngest];
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (!next) return;
        await ingestOne(next);
      }
    }),
  );

  console.log(
    `\n${succeeded} ingested${failed ? `, ${failed} failed` : ""}` +
      (skippedImageReupload ? ` (${skippedImageReupload} reused existing hero)` : "") +
      `.  Open /studio to review.`,
  );
}

main().catch((err) => {
  console.error("\nIngest failed:");
  console.error(err);
  process.exit(1);
});
