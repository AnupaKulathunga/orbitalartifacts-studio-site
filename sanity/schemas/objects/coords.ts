import { defineField, defineType } from "sanity";

export const coords = defineType({
  name: "coords",
  title: "Coordinates",
  type: "object",
  fields: [
    defineField({
      name: "lat",
      title: "Latitude",
      type: "number",
      validation: (rule) => rule.required().min(-90).max(90),
    }),
    defineField({
      name: "lng",
      title: "Longitude",
      type: "number",
      validation: (rule) => rule.required().min(-180).max(180),
    }),
    defineField({
      name: "formatted",
      title: "Formatted",
      description: 'Display string, e.g. "N 51.67° · E 4.32°"',
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "formatted" },
    prepare: ({ title }) => ({ title: title ?? "—" }),
  },
});
