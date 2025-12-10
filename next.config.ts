import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  async headers() {
    return [
      {
        // Fingerprinted static assets (Next.js builds with hashes automatically)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Images in public folder
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Service worker
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        // Favicon and manifest
        source: "/(favicon.ico|manifest.json)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
