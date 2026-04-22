import { defineArrayMember, defineField, defineType } from "sanity";

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
  "ASTER",
  "MODIS",
  "Other",
] as const;

const TREATMENTS = ["Natural", "False-color", "Infrared", "Thermal"] as const;

export const scene = defineType({
  name: "scene",
  title: "Scene",
  type: "document",
  groups: [
    { name: "meta", title: "Metadata", default: true },
    { name: "content", title: "Content" },
    { name: "imagery", title: "Imagery" },
    { name: "shop", title: "Shop" },
  ],
  fields: [
    defineField({
      name: "catalogueNumber",
      title: "Catalogue number",
      description: 'e.g. "OA-0001"',
      type: "string",
      group: "meta",
      validation: (rule) =>
        rule.required().regex(/^OA-\d{4}$/, {
          name: "catalogue format",
        }),
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
      name: "subtitle",
      description: 'Location, e.g. "Jebel Kissu, Sudan"',
      type: "string",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coords",
      type: "coords",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "region",
      type: "string",
      group: "meta",
      options: { list: [...REGIONS], layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sensor",
      type: "string",
      group: "meta",
      options: { list: [...SENSORS], layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bandCombo",
      title: "Band combination",
      description: 'e.g. "Bands 7-6-4" or "Infrared composite"',
      type: "string",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "treatment",
      type: "string",
      group: "meta",
      options: { list: [...TREATMENTS], layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "acquisitionDate",
      title: "Acquisition date",
      type: "date",
      group: "meta",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "processingNotes",
      title: "Processing notes",
      description: "Short technical note (optional)",
      type: "string",
      group: "meta",
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
      description: "Used for sort order in the archive.",
      type: "datetime",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
  ],

  orderings: [
    {
      title: "Published (newest first)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Catalogue number",
      name: "catalogueAsc",
      by: [{ field: "catalogueNumber", direction: "asc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      catalogueNumber: "catalogueNumber",
      media: "hero",
    },
    prepare: ({ title, subtitle, catalogueNumber, media }) => ({
      title: `${catalogueNumber ?? "—"} · ${title ?? "Untitled"}`,
      subtitle,
      media,
    }),
  },
});
