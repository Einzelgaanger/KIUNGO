import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/registry", "/api/public", "/og.jpg", "/opengraph-image"],
        disallow: ["/console", "/review", "/finance"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
