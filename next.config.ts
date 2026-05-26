import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Render SDE jsonl files inline in the browser instead of triggering
        // a download (Vercel's default for unknown extensions like .jsonl).
        source: "/sde/:path*",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Content-Disposition", value: "inline" },
        ],
      },
      {
        // Public, read-only data — let any origin (e.g. eve-hangar.philihp.com)
        // query the API and the bundled SDE files from a browser.
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
      {
        source: "/sde/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Next 16 doesn't treat `[typeID].json` as a dynamic segment, so the
      // route handler lives at /api/type/[typeID] and we map the .json suffix
      // onto it via rewrite. typeIDs are integers, hence the \d+ constraint.
      {
        source: "/api/type/:typeID(\\d+).json",
        destination: "/api/type/:typeID",
      },
    ];
  },
};

export default nextConfig;
