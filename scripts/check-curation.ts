/**
 * Read-only sanity-check on the live curation session: prints the picks
 * with their EaA metadata and the catalogue numbers they'll receive at
 * ingest. Useful for confirming the partner's selections before running
 * `npm run ingest:eaa`.
 *
 *   npm run check:curation
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { client } from "../sanity/lib/client";
import { CURATION_SESSION_QUERY } from "../sanity/queries";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");

type Session = {
  startingNumber: number;
  picks: string[];
  updatedAt?: string;
  updatedBy?: string;
};

type Manifest = Array<{ slug: string; title: string; collection: number; sensor?: string }>;

async function main() {
  const session = await client.fetch<Session | null>(CURATION_SESSION_QUERY);
  if (!session) {
    console.log("No curationSession in Sanity yet.");
    return;
  }
  const manifest = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "data", "eaa-manifest.json"), "utf-8"),
  ) as Manifest;
  const bySlug = new Map(manifest.map((e) => [e.slug, e]));

  console.log(
    `Session updated: ${session.updatedAt ?? "—"}` +
      (session.updatedBy ? `  by ${session.updatedBy}` : ""),
  );
  console.log(
    `Starting number: OA-${String(session.startingNumber).padStart(3, "0")}`,
  );
  console.log(`Picks: ${session.picks.length}\n`);

  const missing: string[] = [];
  session.picks.forEach((slug, i) => {
    const num = `OA-${String(session.startingNumber + i).padStart(3, "0")}`;
    const e = bySlug.get(slug);
    if (!e) {
      missing.push(slug);
      console.log(`  ${num}  ! not in manifest: ${slug}`);
      return;
    }
    console.log(
      `  ${num}  [EaA ${e.collection}]  ${e.title}` +
        (e.sensor ? `  ·  ${e.sensor}` : ""),
    );
  });
  if (missing.length) {
    console.log(
      `\n${missing.length} pick(s) NOT in manifest — these will fail at ingest. ` +
        "Re-run `npm run fetch:eaa` or remove from /curate.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
