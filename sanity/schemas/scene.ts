import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * `source` drives which downstream fields render in the Studio and on the
 * site. `earth-as-art` entries are curated edits of USGS imagery — they
 * carry provenance (original title, source URL, credit). `processed-by-artist`
 * entries are Anupa's own processing work — they carry band combos and
 * treatment notes. Keeping them in one doc type means the Studio list,
 * filters, and catalogue numbering all just work.
 */
const SOURCES = ["earth-as-art", "processed-by-artist"] as const;

const REGIONS = [
  "Arctic",
  "Desert",
  "Delta",
  "Coast",
  "Mountain",
  "Urban",
  "Island",
] as const;

const SENSORS = [
  "Sentinel-2",
  "Landsat 9",
  "Landsat 8",
  "Landsat 7",
  "Landsat 5",
  "ASTER",
  "MODIS",
  "Terra",
  "Other",
] as const;

const TREATMENTS = ["Natural", "False-color", "Infrared", "Thermal"] as const;

const isEaA = (parent: Record<string, unknown> | undefined) =>
  parent?.source !== "processed-by-artist";

const isProcessed = (parent: Record<string, unknown> | undefined) =>
  parent?.source === "processed-by-artist";

export const scene = defineType({
  name: "scene",
  title: "Scene",
  type: "document",
  groups: [
    { name: "meta", title: "Metadata", default: true },
    { name: "content", title: "Content" },
    { name: "imagery", title: "Imagery" },
    { name: "source", title: "Provenance" },
    { name: "shop", title: "Shop" },
  ],
  fields: [
    defineField({
      name: "source",
      title: "Source",
      description:
        "Curated from the USGS Earth as Art archive, or original processing by Orbital Artifacts.",
      type: "string",
      group: "meta",
      options: {
        list: [
          { title: "Earth as Art (curated)", value: "earth-as-art" },
          { title: "Processed by Orbital Artifacts", value: "processed-by-artist" },
        ],
        layout: "radio",
      },
      initialValue: "earth-as-art",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "catalogueNumber",
      title: "Catalogue number",
      description: 'e.g. "OA-010". Three digits, leading zeros.',
      type: "string",
      group: "meta",
      validation: (rule) =>
        rule.required().regex(/^OA-\d{3,4}$/, { name: "catalogue format" }),
    }),
    defineField({
      name: "title",
      type: "string",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "meta",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "editionType",
      title: "Edition type",
      description:
        'Short label shown on scene cards. e.g. "Curated edit", "Studio print", "Limited series".',
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "subtitle",
      description: 'Location, e.g. "Jebel Kissu, Sudan"',
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "coords",
      type: "coords",
      group: "meta",
    }),
    defineField({
      name: "region",
      type: "string",
      group: "meta",
      options: { list: [...REGIONS], layout: "dropdown" },
    }),
    defineField({
      name: "sensor",
      type: "string",
      group: "meta",
      options: { list: [...SENSORS], layout: "dropdown" },
    }),
    defineField({
      name: "acquisitionDate",
      title: "Acquisition date",
      type: "date",
      group: "meta",
      options: { dateFormat: "YYYY-MM-DD" },
    }),

    // Processing-only fields — hidden for EaA entries so the Studio form
    // doesn't offer metadata that would be dishonest to claim.
    defineField({
      name: "bandCombo",
      title: "Band combination",
      description: 'e.g. "Bands 7-6-4" or "Infrared composite"',
      type: "string",
      group: "meta",
      hidden: ({ parent }) => isEaA(parent),
      validation: (rule) =>
        rule.custom((value, context) => {
          if (isProcessed(context.parent as Record<string, unknown>) && !value) {
            return "Required for originally-processed scenes";
          }
          return true;
        }),
    }),
    defineField({
      name: "treatment",
      type: "string",
      group: "meta",
      options: { list: [...TREATMENTS], layout: "dropdown" },
      hidden: ({ parent }) => isEaA(parent),
    }),
    defineField({
      name: "processingNotes",
      title: "Processing notes",
      description: "Short technical note (optional)",
      type: "text",
      rows: 3,
      group: "meta",
      hidden: ({ parent }) => isEaA(parent),
    }),

    // Earth as Art provenance fields.
    defineField({
      name: "sourceTitle",
      title: "Original USGS title",
      description:
        'The title used on the USGS Earth as Art gallery, e.g. "Re-entry".',
      type: "string",
      group: "source",
      hidden: ({ parent }) => isProcessed(parent),
      validation: (rule) =>
        rule.custom((value, context) => {
          if (isEaA(context.parent as Record<string, unknown>) && !value) {
            return "Required for Earth as Art entries";
          }
          return true;
        }),
    }),
    defineField({
      name: "sourceUrl",
      title: "USGS source URL",
      description: "Link to the original gallery entry on eros.usgs.gov.",
      type: "url",
      group: "source",
      hidden: ({ parent }) => isProcessed(parent),
    }),
    defineField({
      name: "sourceCollection",
      title: "Earth as Art collection",
      description: "Which EaA release (1–6) the image belongs to.",
      type: "number",
      group: "source",
      hidden: ({ parent }) => isProcessed(parent),
      validation: (rule) => rule.min(1).max(6).integer(),
    }),
    defineField({
      name: "sourceCredit",
      title: "Credit line",
      description:
        'Attribution text shown on the scene page. Defaults to "U.S. Geological Survey — Earth as Art N".',
      type: "string",
      group: "source",
      hidden: ({ parent }) => isProcessed(parent),
    }),

    defineField({
      name: "narrative",
      description: "2–3 sentences about the place, history, significance.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Emphasis", value: "em" },
              { title: "Strong", value: "strong" },
            ],
            annotations: [],
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),

    defineField({
      name: "hero",
      title: "Hero image",
      type: "image",
      group: "imagery",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "variations",
      title: "Variations",
      description: "Alternate color treatments (optional).",
      type: "array",
      group: "imagery",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),

    defineField({
      name: "availability",
      title: "Marketplace listings",
      type: "array",
      group: "shop",
      of: [defineArrayMember({ type: "marketplaceLink" })],
    }),

    defineField({
      name: "featured",
      description: "Include in homepage hero rotation + featured strip.",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      description: "Fallback sort when catalogue numbers aren't meaningful.",
      type: "datetime",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
  ],

  orderings: [
    {
      title: "Catalogue number (ascending)",
      name: "catalogueAsc",
      by: [{ field: "catalogueNumber", direction: "asc" }],
    },
    {
      title: "Published (newest first)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      catalogueNumber: "catalogueNumber",
      source: "source",
      media: "hero",
    },
    prepare: ({ title, subtitle, catalogueNumber, source, media }) => {
      const sourceLabel =
        source === "processed-by-artist" ? "Studio" : "EaA";
      return {
        title: `${catalogueNumber ?? "—"} · ${title ?? "Untitled"}`,
        subtitle: subtitle ? `${sourceLabel} · ${subtitle}` : sourceLabel,
        media,
      };
    },
  },
});
