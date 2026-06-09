import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Returns headers that key downstream caches off the SDE import timestamp
// captured in public/sde/last-updated.txt at build time.
export function sdeCacheHeaders(contentType: string): Record<string, string> {
  let stamp: string | null = null;
  const path = join(process.cwd(), "public", "sde", "last-updated.txt");
  if (existsSync(path)) {
    try {
      stamp = readFileSync(path, "utf8").trim();
    } catch {
      /* ignore */
    }
  }

  const headers: Record<string, string> = {
    "content-type": contentType,
    // Browsers refresh hourly; CDNs hold for a day and revalidate in the
    // background. The nightly build invalidates the cache via the new ETag.
    "cache-control":
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  };

  if (stamp) {
    headers["etag"] = `"${stamp}"`;
    const lastModified = new Date(stamp);
    if (!Number.isNaN(lastModified.getTime())) {
      headers["last-modified"] = lastModified.toUTCString();
    }
  }
  return headers;
}
