import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  let entities: { slug: string }[] = [];
  try {
    entities = await prisma.entity.findMany({ select: { slug: true } });
  } catch {
    entities = [];
  }
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/registry`, changeFrequency: "daily", priority: 0.9 },
    ...entities.map((entity) => ({
      url: `${base}/registry/${entity.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
