import type { MetadataRoute } from "next";

import { POSTS } from "@/lib/blog/registry";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhukfoods.com";

/**
 * Sitemap published at /sitemap.xml. Includes the landing page, /join,
 * /blog index, and every blog post. Authenticated dashboards are excluded
 * by robots.ts so Google doesn't waste crawl budget on them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,     lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
  ];
  const postRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...staticRoutes, ...postRoutes];
}
