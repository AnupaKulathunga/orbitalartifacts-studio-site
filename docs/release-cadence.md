# Release cadence

## How it works

The catalogue is published on a staggered schedule driven by each
scene's `publishedAt` field in Sanity. The site GROQ filters
`publishedAt <= now()` — scenes with future dates are silently invisible
until their date passes. ISR (60s) pulls them in without redeploys.

| Slot | Scenes |
|---|---|
| Launch day | OA-001 → OA-020 (20 scenes, all share the same `publishedAt`) |
| Tuesdays + Fridays after | 2 scenes per slot (next two in catalogue order) |

For the 2026-05-08 launch this lands the catalogue between mid-May 2026
and late-September 2026.

## What I do per release

For every Tuesday / Friday slot:

1. **Verify the scene shows live.** Hit `/archive` on prod after 9am
   local time. The two new scenes should be there.
2. **Mark them on social.** Pull the editorial / social card from
   `generated/<slug>/social-*.png` (or build manually in Figma using
   the master image from `masters/<slug>.jpg`).
3. **Open the marketplace listings.**
   - Etsy listing live with photos + tags + description (use scene's
     `seoDescription` from `/studio` as a starting point).
   - Printify or Gelato product configured + linked from Etsy.
   - Drop the marketplace URLs into the scene's `availability[]` field
     in `/studio` so the buy buttons populate on the scene page.
4. **Decrement stock as orders fulfil.** Edit `remaining` on each
   scene in `/studio`. Site refreshes within 60s.

## Adjusting the schedule

| Want to do | How |
|---|---|
| Bump a scene to release earlier | Open it in /studio → edit `publishedAt` → save |
| Pause weekly drops | Edit each future scene's `publishedAt` to a year ahead, or just leave them and resume by editing back |
| Change the launch date entirely | Re-run `npm run ingest:eaa -- --launch=YYYY-MM-DD` (existing `publishedAt` values are preserved per scene; only newly-ingested scenes pick up the new launch). To force re-stagger, delete the scene first or write a small patch. |
| Add a new scene mid-cadence | Add it to `data/eaa-manifest.json` if not present, then add the slug to the `curationSession` picks at the desired position, then re-run ingest. Catalogue numbers and publication dates re-compute. |

## Sold-out scenes

When `remaining` hits 0 the site shows a small "Sold out" tag and the
buy links remain visible (the marketplace knows it's sold out). Once
all sizes are unavailable on the marketplace, edit
`availability[]` to remove the entry — the page falls back to the
contact-for-commission state.

## Editing scene SEO copy

`seoTitle`, `seoDescription`, `keywords` are populated by
`npm run generate:seo` from a deterministic template — drawing on the
USGS narrative, sensor, location, and the studio's curation framing.
Override per scene in `/studio → Scenes → SEO` whenever you want
tighter, hand-tuned copy (the auto-generated version is a baseline,
not a ceiling).

To regenerate baseline copy after editing the manifest or template:

```bash
npm run generate:seo -- --force        # all scenes
npm run generate:seo -- --slug=re-entry --force   # one scene
```

## Sanity field cheatsheet

| Field | Edit when |
|---|---|
| `publishedAt` | Bumping a scene's release date |
| `remaining` | After each marketplace sale |
| `editionSize` | Almost never. Set once at ingest. |
| `featured` | Toggle to include in homepage hero rotation |
| `availability[]` | When marketplace listings go live or sell out |
| `seoTitle` / `seoDescription` / `keywords` | When refining a scene's search presence |
| `subtitle` | If the auto-extracted location is wrong (e.g., "Africa" → "Jebel Kissu, Sudan") |
