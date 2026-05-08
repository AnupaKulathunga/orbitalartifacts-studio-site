/**
 * Detects and trims USGS chrome from scene hero images. Some Earth as
 * Art entries (mostly Collection 1) ship as a JPG with a black band of
 * captions, scale bars, and the USGS seal at the top + bottom — those
 * leak onto the site and look like a Canva mishap.
 *
 * Algorithm: walk the image row-by-row computing mean saturation; a
 * "content" row carries colour (saturation > threshold), a "chrome"
 * row is mostly black with sparse white text (saturation ~ 0). Crop
 * tightly around the band of content rows.
 *
 *   npm run crop:chrome -- --dry-run            # writes previews to /tmp/chrome-preview/
 *   npm run crop:chrome -- --slug=lena-delta    # one scene only
 *   npm run crop:chrome                          # apply to every scene with detectable chrome
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { client as readClient } from "../sanity/lib/client";
import { getWriteClient } from "../sanity/lib/writeClient";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");

type SceneRow = {
  _id: string;
  slug: string;
  catalogueNumber: string;
  title: string;
  imageUrl?: string | null;
};

const PREVIEW_DIR = "/tmp/chrome-preview";

// Saturation threshold above which a row counts as "image content".
// Tuned empirically against the EaA archive: pure-black chrome rows
// average ~2-4 in HSV S; satellite imagery rarely averages below 12.
const CONTENT_SATURATION_MIN = 8;

// Minimum fraction of the image height that must be content. If less,
// something's gone wrong with the detection — don't crop.
const MIN_CONTENT_FRACTION = 0.5;

// Don't bother cropping if the trim would remove less than 1.5% of
// the height — likely just JPEG noise, not real chrome.
const MIN_CROP_FRACTION = 0.015;

async function fetchScenes(slug?: string): Promise<SceneRow[]> {
  const filter = slug
    ? `slug.current == $slug`
    : `defined(slug.current) && defined(hero.asset)`;
  const params = slug ? { slug } : {};
  return readClient.fetch<SceneRow[]>(
    `*[_type == "scene" && ${filter}]{
      _id,
      "slug": slug.current,
      catalogueNumber,
      title,
      "imageUrl": hero.asset->url,
    } | order(catalogueNumber asc)`,
    params,
  );
}

async function downloadJpg(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

type CropResult = {
  cropped: boolean;
  top: number;
  bottom: number;
  height: number;
  buffer: Buffer;
};

/**
 * Find the first/last row of saturated content. Operates on a downscaled
 * copy for speed (full-res analysis is slow on 60MB JPGs).
 */
async function detectAndCrop(input: Buffer): Promise<CropResult> {
  const meta = await sharp(input).metadata();
  const fullW = meta.width ?? 0;
  const fullH = meta.height ?? 0;
  if (!fullW || !fullH) {
    return { cropped: false, top: 0, bottom: 0, height: fullH, buffer: input };
  }

  // Downscale to ~600px tall for fast row scanning.
  const sampleH = 600;
  const scale = sampleH / fullH;
  const sampleW = Math.round(fullW * scale);
  const { data } = await sharp(input)
    .resize(sampleW, sampleH, { kernel: sharp.kernel.lanczos3 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Compute per-row mean HSV saturation. Saturation = max(r,g,b) - min(r,g,b)
  // on an 8-bit channel — fast, good enough proxy.
  const rowSat: number[] = new Array(sampleH).fill(0);
  for (let y = 0; y < sampleH; y++) {
    let acc = 0;
    const rowStart = y * sampleW * 3;
    for (let x = 0; x < sampleW; x++) {
      const i = rowStart + x * 3;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      acc += Math.max(r, g, b) - Math.min(r, g, b);
    }
    rowSat[y] = acc / sampleW;
  }

  let topSample = 0;
  while (topSample < sampleH && (rowSat[topSample] ?? 0) < CONTENT_SATURATION_MIN) {
    topSample++;
  }
  let bottomSample = sampleH - 1;
  while (
    bottomSample > topSample &&
    (rowSat[bottomSample] ?? 0) < CONTENT_SATURATION_MIN
  ) {
    bottomSample--;
  }

  // Map back to full-res coordinates.
  let top = Math.floor(topSample / scale);
  let bottom = Math.ceil((bottomSample + 1) / scale);
  if (bottom > fullH) bottom = fullH;
  const newH = bottom - top;

  const contentFraction = newH / fullH;
  const cropFraction = 1 - contentFraction;
  if (
    contentFraction < MIN_CONTENT_FRACTION ||
    cropFraction < MIN_CROP_FRACTION
  ) {
    return { cropped: false, top, bottom, height: fullH, buffer: input };
  }

  const out = await sharp(input)
    .extract({ left: 0, top, width: fullW, height: newH })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  return { cropped: true, top, bottom, height: newH, buffer: out };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlySlug = args.find((a) => a.startsWith("--slug="))?.slice(7);

  const scenes = await fetchScenes(onlySlug);
  if (scenes.length === 0) {
    console.log("No scenes found.");
    return;
  }

  if (dryRun) fs.mkdirSync(PREVIEW_DIR, { recursive: true });

  const writer = dryRun ? null : getWriteClient();
  let cropped = 0;
  let unchanged = 0;
  let failed = 0;

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Scanning ${scenes.length} scene(s) for chrome…\n`,
  );

  for (const scene of scenes) {
    if (!scene.imageUrl) {
      console.log(`· ${scene.catalogueNumber}  ${scene.title}  (no hero)`);
      continue;
    }
    try {
      // Strip any ?fm=webp or other params — sharp wants raw JPG.
      const url = scene.imageUrl.split("?")[0]!;
      const original = await downloadJpg(url);
      const result = await detectAndCrop(original);

      if (!result.cropped) {
        unchanged++;
        console.log(
          `· ${scene.catalogueNumber}  ${scene.title.padEnd(28)}  unchanged`,
        );
        continue;
      }

      const trimmed = result.top + (((await sharp(original).metadata()).height ?? 0) - result.bottom);
      console.log(
        `· ${scene.catalogueNumber}  ${scene.title.padEnd(28)}  trimmed ${trimmed}px ` +
          `(top ${result.top}, height ${result.height})`,
      );

      if (dryRun) {
        const preview = path.join(PREVIEW_DIR, `${scene.slug}.jpg`);
        fs.writeFileSync(preview, result.buffer);
        cropped++;
        continue;
      }

      const asset = await writer!.assets.upload("image", result.buffer, {
        filename: `${scene.catalogueNumber}-${scene.slug}.jpg`,
        label: `oa-eaa-${scene.slug}-cropped`,
      });
      await writer!
        .patch(scene._id)
        .set({
          hero: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
          },
        })
        .commit();
      cropped++;
    } catch (err) {
      failed++;
      console.error(
        `· ${scene.catalogueNumber}  ${scene.title}  ✗ ${(err as Error).message}`,
      );
    }
  }

  console.log(
    `\n${cropped} cropped${dryRun ? " (preview JPGs in " + PREVIEW_DIR + ")" : ""}, ` +
      `${unchanged} unchanged${failed ? `, ${failed} failed` : ""}.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
