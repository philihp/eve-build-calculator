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
    // Next 16 doesn't treat `[id].json` as a dynamic segment, so each route
    // handler lives at /api/<thing>/[id] and we map the .json suffix onto it
    // via rewrite. All SDE ids are integers, hence the \d+ constraint.
    const jsonSuffix = ([thing, param]: [string, string]) => ({
      source: `/api/${thing}/:${param}(\\d+).json`,
      destination: `/api/${thing}/:${param}`,
    });
    return (
      [
        ["type", "typeID"],
        ["blueprint", "typeID"],
        ["system", "systemID"],
        ["constellation", "constellationID"],
        ["region", "regionID"],
        ["stargate", "stargateID"],
        ["planet", "planetID"],
        ["moon", "moonID"],
        ["star", "starID"],
        ["asteroidbelt", "beltID"],
        ["station", "stationID"],
      ] as [string, string][]
    ).map(jsonSuffix);
  },
};

export default nextConfig;
