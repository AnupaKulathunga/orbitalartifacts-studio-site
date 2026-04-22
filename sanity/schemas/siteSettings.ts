import { defineArrayMember, defineField, defineType } from "sanity";

const SOCIAL_PLATFORMS = [
  "Instagram",
  "TikTok",
  "Pinterest",
  "Threads",
  "X",
  "Other",
] as const;

const MARKETPLACE_PLATFORMS = [
  "Etsy",
  "Redbubble",
  "Teespring",
  "Society6",
  "Amazon",
  "Other",
] as const;

const platformLink = (platforms: ReadonlyArray<string>, title: string) =>
  defineArrayMember({
    type: "object",
    name: "platformLink",
    title,
    fields: [
      defineField({
        name: "platform",
        type: "string",
        options: { list: [...platforms], layout: "dropdown" },
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "url",
        type: "url",
        validation: (rule) =>
          rule.required().uri({ scheme: ["http", "https"] }),
      }),
    ],
    preview: {
      select: { title: "platform", subtitle: "url" },
    },
  });

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "tagline",
      description: 'Default: "Earth data, reimagined as art."',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "originQuestion",
      title: "Origin question",
      description: "Large Fraunces italic on the homepage.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [{ title: "Emphasis", value: "em" }],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: "contactEmail",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .email()
          .error("Must be a valid email address."),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [platformLink(SOCIAL_PLATFORMS, "Social link")],
    }),
    defineField({
      name: "marketplaceLinks",
      title: "Shop-level marketplace links",
      description:
        "Top-level shop links (not tied to a specific scene). Scene-level availability is edited per scene.",
      type: "array",
      of: [platformLink(MARKETPLACE_PLATFORMS, "Marketplace link")],
    }),
  ],
  preview: {
    select: { title: "tagline" },
    prepare: ({ title }) => ({ title: title ?? "Site settings" }),
  },
});
