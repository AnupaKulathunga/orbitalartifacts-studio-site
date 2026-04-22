import { defineField, defineType } from "sanity";

export const pressEntry = defineType({
  name: "pressEntry",
  title: "Press entry",
  type: "document",
  fields: [
    defineField({
      name: "publication",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      description: "Article headline",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      type: "url",
      validation: (rule) =>
        rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "quote",
      description: "Optional 1-sentence pull quote",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "logo",
      description: "Optional publication logo",
      type: "image",
      options: { hotspot: false },
    }),
  ],

  orderings: [
    {
      title: "Date (newest first)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      publication: "publication",
      date: "date",
      media: "logo",
    },
    prepare: ({ title, publication, date, media }) => ({
      title,
      subtitle: `${publication ?? "—"} · ${date ?? ""}`,
      media,
    }),
  },
});
