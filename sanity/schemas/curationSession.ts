import { defineField, defineType } from "sanity";

/**
 * Shared pick-list for /curate, persisted in Sanity so it survives
 * Vercel's read-only filesystem and syncs between curators (e.g. Anupa
 * and a collaborator).
 *
 * Singleton — the Studio list item pins this doc to the id
 * `curationSession`. There is only ever one session: `picks` is the
 * source of truth for Phase 3 ingestion.
 */
export const curationSession = defineType({
  name: "curationSession",
  title: "Curation session",
  type: "document",
  fields: [
    defineField({
      name: "startingNumber",
      title: "Starting catalogue number",
      description:
        "OA-<this>..OA-<this+N> will be assigned in picks order when ingesting. Reserve 001–009 for originally-processed studio work.",
      type: "number",
      initialValue: 10,
      validation: (rule) => rule.required().min(1).integer(),
    }),
    defineField({
      name: "picks",
      title: "Picks",
      description:
        "Manifest slugs in display order. Managed via /curate — editing here directly is possible but fiddly.",
      type: "array",
      of: [{ type: "string" }],
      initialValue: [],
    }),
    defineField({
      name: "updatedAt",
      title: "Last saved",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "updatedBy",
      title: "Last saved by",
      description: "Free-text label the curator enters at /curate (optional).",
      type: "string",
    }),
  ],
  preview: {
    select: { picks: "picks", startingNumber: "startingNumber" },
    prepare: ({ picks, startingNumber }) => ({
      title: "Curation session",
      subtitle: `${picks?.length ?? 0} picks · starts at OA-${String(
        startingNumber ?? 10,
      ).padStart(3, "0")}`,
    }),
  },
});
