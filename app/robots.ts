import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhukfoods.com";

/**
 * robots.txt served at /robots.txt. Open to all crawlers (Google, Bing,
 * GPTBot, ClaudeBot, PerplexityBot, etc.) on the public surface; blocks
 * authenticated dashboards and API routes so they aren't indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin", "/customer", "/cook", "/api", "/auth"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
