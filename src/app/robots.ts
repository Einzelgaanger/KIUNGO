import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/registry", "/api/public"],
        disallow: ["/console", "/review", "/finance"],
      },
    ],
    sitemap: "https://kiungo.example/sitemap.xml",
  };
}
