/**
 * One-shot data patches in Sanity:
 *   - Add the Etsy shop URL to siteSettings.marketplaceLinks
 *   - Fix subtitle / sensor fields where the auto-extractor mis-tagged
 *
 * Idempotent — re-running won't duplicate Etsy link, won't overwrite
 * subtitles that have been hand-edited away from the bad value.
 *
 *   npm run patch:data            # apply
 *   npm run patch:data -- --dry   # log what would change
 */
import { client as readClient } from "../sanity/lib/client";
import { getWriteClient } from "../sanity/lib/writeClient";

const ETSY_URL = "https://orbitalartifact.etsy.com";

// Slugs whose auto-derived subtitle / sensor came out wrong. Each entry
// only writes when the *current* value matches `from` — if the curator
// already fixed it in /studio, we leave it alone.
const SCENE_FIXES: Array<{
  slug: string;
  field: "subtitle" | "sensor";
  from: string;
  to: string;
}> = [
  { slug: "re-entry", field: "subtitle", from: "Africa", to: "Jebel Kissu, Sudan" },
  { slug: "demini-river", field: "sensor", from: "March 1, 2000", to: "Landsat 7" },
  {
    slug: "ganges-river-delta",
    field: "sensor",
    from: "February 1, 2000",
    to: "Landsat 7",
  },
  {
    slug: "belcher-islands",
    field: "subtitle",
    from: "EROS History Project",
    to: "Hudson Bay, Canada",
  },
  {
    slug: "petermann-glacier",
    field: "subtitle",
    from: "Petermann Glacier",
    to: "Greenland",
  },
];

async function main() {
  const dry = process.argv.includes("--dry");
  const writer = dry ? null : getWriteClient();
  let touched = 0;

  // 1. Etsy link in siteSettings.
  type SettingsRow = { marketplaceLinks?: Array<{ platform: string; url: string }> };
  const settings = (await readClient.fetch<SettingsRow | null>(
    `*[_id == "siteSettings"][0]{ marketplaceLinks }`,
  )) ?? { marketplaceLinks: [] };
  const existing = settings.marketplaceLinks ?? [];
  const hasEtsy = existing.some((m) => m.url === ETSY_URL || /\.etsy\.com/.test(m.url));
  if (hasEtsy) {
    console.log("· siteSettings: Etsy link already present");
  } else {
    console.log(
      `· siteSettings: ${dry ? "would add" : "adding"} Etsy → ${ETSY_URL}`,
    );
    if (!dry) {
      await writer!
        .patch("siteSettings")
        .setIfMissing({ marketplaceLinks: [] })
        .insert("after", "marketplaceLinks[-1]", [
          {
            _key: `etsy-${Date.now()}`,
            _type: "marketplaceLink",
            platform: "Etsy",
            url: ETSY_URL,
          },
        ])
        .commit();
    }
    touched++;
  }

  // 2. Per-scene metadata fixes.
  type SceneRow = { _id: string; subtitle?: string; sensor?: string };
  for (const fix of SCENE_FIXES) {
    const id = `scene-${fix.slug}`;
    const row = await readClient.fetch<SceneRow | null>(
      `*[_id == $id][0]{ _id, subtitle, sensor }`,
      { id },
    );
    if (!row) {
      console.log(`· ${fix.slug}: no doc`);
      continue;
    }
    const current = (row[fix.field] ?? "").trim();
    if (current !== fix.from) {
      console.log(
        `· ${fix.slug}: ${fix.field} is "${current}" (not "${fix.from}") — skipping`,
      );
      continue;
    }
    console.log(
      `· ${fix.slug}: ${dry ? "would set" : "setting"} ${fix.field} "${fix.from}" → "${fix.to}"`,
    );
    if (!dry) {
      await writer!.patch(id).set({ [fix.field]: fix.to }).commit();
    }
    touched++;
  }

  console.log(`\n${dry ? "Would touch" : "Touched"} ${touched} doc(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
