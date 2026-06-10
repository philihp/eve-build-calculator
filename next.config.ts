import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Serve the newline-delimited JSON exports as application/jsonl, and
        // inline so the browser renders them instead of downloading (Vercel's
        // default for the unknown .jsonl extension). Other /sde assets like
        // last-updated.txt keep their default text/plain handling.
        source: "/sde/:file(.*\\.jsonl)",
        headers: [
          { key: "Content-Type", value: "application/jsonl" },
          { key: "Content-Disposition", value: "inline" },
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
