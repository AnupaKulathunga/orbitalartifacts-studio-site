import { defineField, defineType } from "sanity";

const PLATFORMS = [
  "Etsy",
  "Redbubble",
  "Teespring",
  "Society6",
  "Amazon",
  "Other",
] as const;

export const marketplaceLink = defineType({
  name: "marketplaceLink",
  title: "Marketplace listing",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: { list: [...PLATFORMS], layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) =>
        rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "productType",
      title: "Product type",
      description: 'e.g. "Framed giclée 16×20"',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startingPrice",
      title: "Starting price (USD)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      platform: "platform",
      productType: "productType",
      startingPrice: "startingPrice",
    },
    prepare: ({ platform, productType, startingPrice }) => ({
      title: `${platform ?? "—"} · ${productType ?? "—"}`,
      subtitle:
        typeof startingPrice === "number" ? `from $${startingPrice}` : "",
    }),
  },
});
