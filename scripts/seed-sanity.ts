/**
 * Seeds the Sanity dataset with the 8 scenes defined in lib/scenes.ts.
 *
 * Idempotent — each document uses `scene-<slug>` as its `_id`, and
 * `createOrReplace` guarantees re-running this script just refreshes the
 * same docs (it does not duplicate). Hero images are uploaded once per
 * slug using `assets.upload` with a stable content hash label so Sanity
 * dedupes on the backend.
 *
 * Usage:
 *   # 1) Create a write token at sanity.io/manage → API → Tokens (Editor role).
 *   # 2) Paste it into .env.local as SANITY_API_TOKEN=…
 *   # 3) Run:
 *   npm run seed:sanity
 *
 * Safe to re-run. Run it after every edit to lib/scenes.ts if you want
 * Sanity to match.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_SCENES } from "../lib/scenes";
import { getWriteClient } from "../sanity/lib/writeClient";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

type UploadedAsset = { _type: "image"; asset: { _ref: string; _type: "reference" } };

async function uploadHero(
  client: ReturnType<typeof getWriteClient>,
  scene: (typeof SEED_SCENES)[number],
): Promise<UploadedAsset | null> {
  if (!scene.imageUrl) return null;

  // scene.imageUrl is like "/scenes/re-entry.jpg" — relative to /public.
  const localPath = path.join(REPO_ROOT, "public", scene.imageUrl);
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠ missing file ${localPath} — skipping hero`);
    return null;
  }

  const filename = path.basename(scene.imageUrl);
  const asset = await client.assets.upload("image", fs.createReadStream(localPath), {
    filename,
    // `label` gives Sanity a stable dedupe hint across re-uploads.
    label: `oa-hero-${scene.slug}`,
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

function narrativeToPortableText(text: string) {
  return [
    {
      _type: "block",
      _key: "p0",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "s0",
          text,
          marks: [],
        },
      ],
    },
  ];
}

async function seed() {
  const client = getWriteClient();
  console.log(`Seeding Sanity dataset with ${SEED_SCENES.length} scenes…\n`);

  for (const scene of SEED_SCENES) {
    console.log(`· ${scene.catalogueNumber}  ${scene.title}`);
    const hero = await uploadHero(client, scene);

    const doc = {
      _id: `scene-${scene.slug}`,
      _type: "scene",
      catalogueNumber: scene.catalogueNumber,
      title: scene.title,
      slug: { _type: "slug", current: scene.slug },
      subtitle: scene.subtitle,
      coords: {
        _type: "coords",
        lat: scene.coords.lat,
        lng: scene.coords.lng,
        formatted: scene.coords.formatted,
      },
      region: scene.region,
      sensor: scene.sensor,
      bandCombo: scene.bandCombo,
      treatment: scene.treatment,
      acquisitionDate: scene.acquisitionDate,
      processingNotes: scene.processingNotes,
      narrative: narrativeToPortableText(scene.narrative),
      hero,
      availability: scene.availability.map((link, i) => ({
        _key: `market-${i}`,
        _type: "marketplaceLink",
        ...link,
      })),
      featured: scene.featured,
      publishedAt: scene.publishedAt,
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ upserted`);
  }

  console.log(`\nDone. Open /studio to edit.`);
}

seed().catch((err) => {
  console.error("\nSeed failed:");
  console.error(err);
  process.exit(1);
});
