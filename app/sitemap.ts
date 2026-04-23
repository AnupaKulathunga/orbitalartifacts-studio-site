import type { MetadataRoute } from "next";
import { getAllScenes } from "@/lib/scenes";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/archive", changeFrequency: "weekly", priority: 0.9 },
  { path: "/process", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/press", changeFrequency: "monthly", priority: 0.4 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
];

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const scenes = await getAllScenes().catch(() => []);

  const now = new Date();

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...scenes.map((scene) => ({
      url: `${SITE_URL}/archive/${scene.slug}`,
      lastModified: new Date(scene.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
