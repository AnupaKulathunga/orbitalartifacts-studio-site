/**
 * Scrapes the USGS "Earth as Art" collection pages and writes a manifest
 * of every entry to `data/eaa-manifest.json`.
 *
 * The gallery lives across six pages: /centers/eros/earth-art-{1..6}.
 * Each card links to a per-image detail page at /media/images/<slug>,
 * which exposes the canonical title, narrative, acquisition date, and
 * sensor via OpenGraph + taxonomy-tag markup. This script assembles one
 * entry per image with enough info to drive /curate and ingestion.
 *
 * Run:
 *   npm run fetch:eaa
 *
 * Safe to re-run. The manifest is checked in so curation decisions are
 * tracked alongside code.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0";

type Entry = {
  // slug of the detail URL — canonical id we'll key everything off
  slug: string;
  title: string;
  // which Earth as Art collection it belongs to (1..6)
  collection: number;
  // eros.usgs.gov detail URL — the "official" source page for attribution
  sourceUrl: string;
  // www.usgs.gov mirror — scraping origin, useful as a fallback source link
  mediaUrl: string;
  // ~600px display thumb (carries an itok signed token so it's the src value
  // we grab verbatim from the page — don't rebuild this URL manually)
  thumbUrl: string;
  // full-resolution JPG on S3 — no token, directly downloadable
  imageUrl: string;
  // Optional enrichment from the media detail page
  narrative?: string;
  sensor?: string;
  // ground sample scale, e.g. "2.8 miles (4.5km)" — present on older entries
  scale?: string;
  acquisitionDate?: string;
  tags?: string[];
};

async function fetchText(url: string, timeoutMs = 15_000): Promise<string> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res.text();
  } finally {
    clearTimeout(t);
  }
}

/**
 * www.usgs.gov sometimes slugs pages with stopwords stripped — "the",
 * "of" — both at the start and in the middle, e.g.:
 *   life-along-the-nile    → life-along-nile
 *   southern-coast-of-france → southern-coast-france
 * Given an eros slug, return candidate www slugs to try in order.
 */
function wwwSlugCandidates(erosSlug: string): string[] {
  const candidates = new Set<string>();
  const stopwords = ["the", "of"];
  const dropStopwords = (s: string) =>
    s
      .split("-")
      .filter((tok, i) => !(i > 0 && stopwords.includes(tok)))
      .join("-")
      .replace(/^(the|of)-/, "");

  candidates.add(erosSlug);
  for (const w of stopwords) {
    if (erosSlug.startsWith(`${w}-`)) candidates.add(erosSlug.slice(w.length + 1));
  }
  candidates.add(dropStopwords(erosSlug));
  return [...candidates];
}

async function fetchDetailText(
  slug: string,
): Promise<{ html: string; mediaUrl: string } | null> {
  for (const candidate of wwwSlugCandidates(slug)) {
    const url = `https://www.usgs.gov/media/images/${candidate}`;
    try {
      const html = await fetchText(url);
      return { html, mediaUrl: url };
    } catch (err) {
      const msg = (err as Error).message;
      // 404 = try next candidate; other errors (timeout, 5xx) = bail
      if (!msg.includes("404")) throw err;
    }
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&nbsp;", " ");
}

function parseCollectionPage(html: string, collection: number): Entry[] {
  // The page renders each entry twice: a "grid view" with image cards
  // (title + eros.usgs.gov link + thumbnail) and a "list view" that
  // reveals the www.usgs.gov /media/images/<slug> path — which often
  // differs from the eros slug (e.g. eros `whirlpool-the-air` maps to
  // www `whirlpool-air`). We need both: eros slug for attribution,
  // www slug for scraping the canonical detail page.
  //
  // List-view items repeat (~3x per entry across different layouts);
  // dedupe by title so we get one www slug per title.
  const listItems = [
    ...html.matchAll(
      /<div class="field-html-title"><h4><a href="\/media\/images\/([^"]+)"[^>]*>([^<]+)<\/a>/g,
    ),
  ];
  const titleToMediaSlug = new Map<string, string>();
  for (const m of listItems) {
    const slug = m[1];
    const rawTitle = m[2];
    if (!slug || !rawTitle) continue;
    const title = decodeEntities(rawTitle).trim();
    if (!titleToMediaSlug.has(title)) titleToMediaSlug.set(title, slug);
  }

  const cardRe = /<div class="paragraph--type--image-card"[\s\S]*?<\/div>\s*<\/div>/g;
  const cards = html.match(cardRe) ?? [];
  const entries: Entry[] = [];

  for (const card of cards) {
    const hrefM = card.match(
      /href="(https?:\/\/eros\.usgs\.gov\/media-gallery\/earth-as-art\/\d+\/([^"]+))"/,
    );
    const titleM = card.match(/<h2 class="d-title">([^<]+)<\/h2>/);
    // The card thumb URL looks like .../styles/image_card/public/thumbnails/image/<file>.jpg?itok=...
    // The file slug can diverge from the detail slug (e.g. sand-waves_0 vs sand-waves)
    // when USGS re-uploaded a file.
    const bgM = card.match(
      /url\(&#039;(https:\/\/[^&]+\/thumbnails\/image\/([^&.]+)\.jpg[^&]*)&#039;\)/,
    );
    const sourceUrl = hrefM?.[1];
    const slug = hrefM?.[2];
    const rawTitle = titleM?.[1];
    const bgUrl = bgM?.[1];
    const imageFileSlug = bgM?.[2];
    if (!sourceUrl || !slug || !rawTitle || !bgUrl || !imageFileSlug) continue;

    const title = decodeEntities(rawTitle).trim();
    const mediaSlug = titleToMediaSlug.get(title) ?? slug;
    entries.push({
      slug,
      title,
      collection,
      sourceUrl,
      mediaUrl: `https://www.usgs.gov/media/images/${mediaSlug}`,
      // Replace the image_card-style URL with the 600px masonry-style URL
      // so /curate loads thumbs at the right size instead of card crops.
      thumbUrl: bgUrl.replace("/styles/image_card/", "/styles/masonry/"),
      imageUrl: `https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/${imageFileSlug}.jpg`,
    });
  }

  return entries;
}

function parseDetailPage(html: string): Partial<Entry> {
  const out: Partial<Entry> = {};

  // OG description carries the narrative followed by metadata labels.
  // Two variants exist in the wild:
  //   - Earth as Art 1–3 (pre-2015): smushed "…Collection: XSource: YScale: ZDownload: W"
  //   - Earth as Art 4–6: spaced "… Collection: X Source: Y Download: Z"
  // so we match with optional whitespace and stop each capture at the next
  // known label.
  const ogDesc = html.match(
    /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/,
  );
  if (ogDesc?.[1]) {
    const desc = decodeEntities(ogDesc[1]).trim();
    // Everything before "Collection:" is the narrative.
    const narEnd = desc.search(/\s*Collection:/);
    if (narEnd > 0) {
      out.narrative = desc.slice(0, narEnd).trim();
    } else {
      out.narrative = desc;
    }
    const labelRe = (label: string) =>
      new RegExp(
        `${label}:\\s*(.+?)(?=\\s*(?:Collection|Source|Scale|Download|Readme|To purchase|$):?)`,
        "s",
      );
    const sensorM = desc.match(labelRe("Source"));
    if (sensorM?.[1]) out.sensor = sensorM[1].trim().replace(/\s+/g, " ");
    const scaleM = desc.match(labelRe("Scale"));
    if (scaleM?.[1]) out.scale = scaleM[1].trim().replace(/\s+/g, " ");
  }

  const dateM = html.match(/<time[^>]*datetime="([^"]+)"/);
  if (dateM?.[1]) out.acquisitionDate = dateM[1];

  // Explore Search sidebar — taxonomy tags incl. region/location
  const sidebar = html.match(
    /<div class="sidebar-block c-usgs-explore-science">[\s\S]*?<ul class="usa-list--unstyled">([\s\S]*?)<\/ul>/,
  );
  if (sidebar?.[1]) {
    const tags = [...sidebar[1].matchAll(/<li><a[^>]+>([^<]+)<\/a><\/li>/g)]
      .map((m) => m[1])
      .filter((t): t is string => Boolean(t))
      .map((t) => decodeEntities(t).trim());
    out.tags = tags;
  }

  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const skipDetails = args.includes("--no-details");
  const limit = parseInt(args.find((a) => a.startsWith("--limit="))?.slice(8) ?? "0") || 0;

  console.log("Fetching Earth as Art collection pages…");
  const entries: Entry[] = [];
  for (let n = 1; n <= 6; n++) {
    const url = `https://www.usgs.gov/centers/eros/earth-art-${n}`;
    const html = await fetchText(url);
    const parsed = parseCollectionPage(html, n);
    console.log(`  collection ${n}: ${parsed.length} entries`);
    entries.push(...parsed);
  }
  console.log(`Total across 6 collections: ${entries.length}\n`);

  // Dedupe by slug — if the same slug shows up in multiple collection pages
  // (shouldn't, but guard against it) keep the first.
  const seen = new Set<string>();
  const unique = entries.filter((e) => {
    if (seen.has(e.slug)) return false;
    seen.add(e.slug);
    return true;
  });
  if (unique.length !== entries.length) {
    console.log(`  (dropped ${entries.length - unique.length} duplicate slugs)\n`);
  }

  const toEnrich = limit > 0 ? unique.slice(0, limit) : unique;

  if (!skipDetails) {
    console.log(`Enriching ${toEnrich.length} entries from detail pages…`);
    let i = 0;
    let missed = 0;
    for (const e of toEnrich) {
      i++;
      process.stdout.write(
        `\r  [${i}/${toEnrich.length}] ${e.slug.padEnd(40)}`,
      );
      try {
        const fetched = await fetchDetailText(e.slug);
        if (!fetched) {
          missed++;
          continue;
        }
        e.mediaUrl = fetched.mediaUrl;
        Object.assign(e, parseDetailPage(fetched.html));
      } catch (err) {
        console.warn(`\n  ⚠ ${e.slug}: ${(err as Error).message}`);
      }
      // be polite to www.usgs.gov
      await new Promise((r) => setTimeout(r, 200));
    }
    console.log(`\n  ${toEnrich.length - missed} enriched, ${missed} skipped.\n`);
  }

  const output = limit > 0 ? toEnrich : unique;
  const outPath = path.join(REPO_ROOT, "data", "eaa-manifest.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${output.length} entries → ${path.relative(REPO_ROOT, outPath)}`);
}

main().catch((err) => {
  console.error("\nFetch failed:");
  console.error(err);
  process.exit(1);
});
