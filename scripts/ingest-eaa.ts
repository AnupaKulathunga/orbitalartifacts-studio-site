/**
 * Ingests curated Earth as Art entries into the Sanity dataset.
 *
 * Inputs (both in `data/`):
 *   - `eaa-manifest.json`   → every EaA entry fetched via fetch:eaa
 *   - `eaa-selections.json` → the user's curated pick list + starting
 *                             catalogue number, produced by /curate
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
import { getWriteClient } from "../sanity/lib/writeClient";

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

type Selections = { startingNumber: number; picks: string[] };

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function loadJson<T>(relPath: string): T {
  const p = path.join(REPO_ROOT, relPath);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing ${relPath}. Run the upstream step first.`);
  }
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
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

  const manifest = loadJson<ManifestEntry[]>("data/eaa-manifest.json");
  const selections = loadJson<Selections>("data/eaa-selections.json");

  if (!selections.picks.length) {
    console.error("No picks in data/eaa-selections.json — run /curate first.");
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
    return { entry, catalogueNumber: `OA-${pad(n)}`, index: i };
  });
  if (toIngest.length === 0) {
    console.error("Nothing to ingest.");
    process.exit(1);
  }

  const first = toIngest[0]!;
  const last = toIngest[toIngest.length - 1]!;
  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Ingesting ${toIngest.length} scenes — ` +
      `${first.catalogueNumber} → ${last.catalogueNumber}\n`,
  );

  const client = dryRun ? null : getWriteClient();
  let succeeded = 0;
  let failed = 0;

  for (const { entry, catalogueNumber } of toIngest) {
    console.log(`· ${catalogueNumber}  ${entry.title}  (${entry.slug})`);

    const subtitle = extractLocation(entry.tags);
    const sensor = normalizeSensor(entry.sensor);
    const acquisitionDate = entry.acquisitionDate
      ? entry.acquisitionDate.slice(0, 10)
      : undefined;
    const sourceCredit = `U.S. Geological Survey — Earth as Art ${entry.collection}`;

    if (dryRun) {
      console.log(
        `    would upload ${entry.imageUrl}\n` +
          `    subtitle: ${subtitle ?? "(none)"} · sensor: ${sensor ?? "(none)"} · date: ${acquisitionDate ?? "(none)"}\n` +
          `    credit:   ${sourceCredit}\n` +
          `    narrative: ${(entry.narrative ?? "(missing)").slice(0, 80)}…`,
      );
      succeeded++;
      continue;
    }

    try {
      const buffer = await downloadImage(entry.imageUrl);
      const asset = await client!.assets.upload("image", buffer, {
        filename: `${catalogueNumber}-${entry.slug}.jpg`,
        label: `oa-eaa-${entry.slug}`,
      });

      const doc = {
        _id: `scene-${entry.slug}`,
        _type: "scene" as const,
        source: "earth-as-art" as const,
        catalogueNumber,
        title: entry.title,
        slug: { _type: "slug" as const, current: entry.slug },
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
        hero: {
          _type: "image" as const,
          asset: { _type: "reference" as const, _ref: asset._id },
        },
        availability: [],
        featured: false,
        publishedAt: new Date().toISOString(),
      };

      // Drop undefined fields so Sanity doesn't reject the mutation with
      // "invalid field values" when an EaA entry lacks e.g. a subtitle.
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(doc)) {
        if (v !== undefined) clean[k] = v;
      }

      await client!.createOrReplace(
        clean as typeof doc,
      );
      console.log(`    ✓ ingested (${(buffer.length / 1024).toFixed(0)} KB)`);
      succeeded++;
    } catch (err) {
      console.error(`    ✗ ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(
    `\n${succeeded} ingested${failed ? `, ${failed} failed` : ""}.  ` +
      `Open /studio to review.`,
  );
}

main().catch((err) => {
  console.error("\nIngest failed:");
  console.error(err);
  process.exit(1);
});
