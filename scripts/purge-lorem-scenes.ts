/**
 * One-shot cleanup for scene docs whose narrative still reads "Lorem ipsum
 * — scene narrative pending" from the original SEED_SCENES smoke test.
 *
 * The new ingestion pipeline (ingest-eaa.ts) replaces docs by slug, but
 * the 8 seeded scenes won't be overwritten until the curator picks their
 * slugs — and in the meantime they render on /archive with placeholder
 * copy. This deletes them so the catalogue is empty until real curation
 * is ingested.
 *
 *   npm run purge:lorem              # dry run — lists what would delete
 *   npm run purge:lorem -- --apply   # actually deletes
 */
import { getWriteClient } from "../sanity/lib/writeClient";

async function main() {
  const apply = process.argv.includes("--apply");
  const client = getWriteClient();

  const query = `*[_type == "scene" && pt::text(narrative) match "Lorem ipsum*"]{
    _id,
    catalogueNumber,
    title,
    "slug": slug.current,
  }`;
  type Row = { _id: string; catalogueNumber?: string; title?: string; slug?: string };
  const rows = await client.fetch<Row[]>(query);

  if (rows.length === 0) {
    console.log("No lorem-ipsum scenes found. Nothing to do.");
    return;
  }

  console.log(`${apply ? "Deleting" : "[DRY RUN] Would delete"} ${rows.length} scene(s):\n`);
  for (const r of rows) {
    console.log(`  · ${r.catalogueNumber ?? "—"}  ${r.title ?? "(no title)"}  [${r._id}]`);
  }

  if (!apply) {
    console.log("\nRe-run with `-- --apply` to actually delete.");
    return;
  }

  // Delete in a single transaction so Sanity handles retries/consistency.
  const tx = client.transaction();
  for (const r of rows) tx.delete(r._id);
  await tx.commit();
  console.log(`\nDeleted ${rows.length} scene(s). Archive will refresh within 60s (ISR).`);
}

main().catch((err) => {
  console.error("Purge failed:");
  console.error(err);
  process.exit(1);
});
