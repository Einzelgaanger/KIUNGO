import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-leaflet", "leaflet"],
  // Demo-only: hide the Next.js Dev Tools "N". Production builds never show it.
  devIndicators: false,
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  // Next 15 defaults dynamic RSC cache to 0s, so every sidebar click re-queries
  // the database. Keep visited portal pages in the client cache for the demo.
  experimental: {
    staleTimes: {
      dynamic: 300,
      static: 600,
    },
  },
};

export default nextConfig;
