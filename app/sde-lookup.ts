import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { after, NextResponse } from "next/server";

// Shared machinery for "look up one SDE JSONL row by its integer key" routes.
// CCP's JSONL SDE keys every row by `_key` (and `types.jsonl` additionally by
// `typeID`), so a single indexing strategy serves types, solar systems,
// constellations, regions, stargates, and every celestial/station file.
//
// Each row family lives in its own `public/sde/<file>.jsonl` (bundled at build
// time) and is cached at runtime in ~100 Vercel Blob buckets keyed by the last
// two digits of the id — the same trick the type route uses to stay under
// Blob's daily operation cap instead of writing one blob per id.

const LOCAL_BUILD_INFO_PATH = join(
  process.cwd(),
  "public",
  "sde",
  ".build-info.json",
);

let buildTimePromise: Promise<Date> | null = null;

async function loadBuildTime(): Promise<Date> {
  try {
    if (existsSync(LOCAL_BUILD_INFO_PATH)) {
      const raw = await readFile(LOCAL_BUILD_INFO_PATH, "utf8");
      const { builtAt } = JSON.parse(raw) as { builtAt?: string };
      if (builtAt) return new Date(builtAt);
    } else {
      const res = await fetch(`${baseUrl()}/sde/.build-info.json`);
      if (res.ok) {
        const { builtAt } = (await res.json()) as { builtAt?: string };
        if (builtAt) return new Date(builtAt);
      }
    }
  } catch {
    // fall through
  }
  return new Date(0);
}

function getBuildTime(): Promise<Date> {
  buildTimePromise ??= loadBuildTime();
  return buildTimePromise;
}

function baseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

function bucketFor(id: string): string {
  return id.padStart(2, "0").slice(-2);
}

function indexLine(map: Map<string, string>, line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as { typeID?: number; _key?: number };
    const id = obj.typeID ?? obj._key;
    if (id != null) map.set(String(id), line);
  } catch {
    // ignore malformed rows
  }
}

export interface JsonlLookup {
  /** Resolve a single row by its string id, or `null` when absent. */
  fetchJson(id: string): Promise<string | null>;
  /** Next.js route handler returning the raw JSONL row or a 404. */
  GET(
    req: Request,
    ctx: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse>;
}

/**
 * Build a lookup over one bundled SDE JSONL file.
 *
 * @param fileName   Basename under `public/sde/`, e.g. `mapSolarSystems.jsonl`.
 * @param blobPrefix Vercel Blob key prefix for cached buckets,
 *                   e.g. `systems/bucket-` → `systems/bucket-42.jsonl`.
 */
export function createJsonlLookup({
  fileName,
  blobPrefix,
}: {
  fileName: string;
  blobPrefix: string;
}): JsonlLookup {
  const localPath = join(process.cwd(), "public", "sde", fileName);
  const bucketBlobKey = (bucket: string) => `${blobPrefix}${bucket}.jsonl`;

  let fullMapPromise: Promise<Map<string, string>> | null = null;

  async function buildFullMap(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (existsSync(localPath)) {
      const rl = createInterface({
        input: createReadStream(localPath),
        crlfDelay: Infinity,
      });
      for await (const line of rl) indexLine(map, line);
      return map;
    }
    const res = await fetch(`${baseUrl()}/sde/${fileName}`);
    if (!res.ok) {
      throw new Error(`failed to fetch ${fileName} from ${baseUrl()}: ${res.status}`);
    }
    const text = await res.text();
    for (const line of text.split("\n")) indexLine(map, line);
    return map;
  }

  function loadFullMap(): Promise<Map<string, string>> {
    fullMapPromise ??= buildFullMap();
    return fullMapPromise;
  }

  // Per-lambda cache so successive requests in the same bucket reuse one
  // head/fetch pair. `null` means the bucket blob is missing or stale and must
  // be rebuilt from source.
  const bucketCache = new Map<string, Promise<Map<string, string> | null>>();

  async function readBucketFromBlob(
    bucket: string,
  ): Promise<Map<string, string> | null> {
    try {
      const [blob, buildTime] = await Promise.all([
        head(bucketBlobKey(bucket)),
        getBuildTime(),
      ]);
      if (new Date(blob.uploadedAt) < buildTime) return null;
      const upstream = await fetch(blob.url);
      if (!upstream.ok) return null;
      const text = await upstream.text();
      const map = new Map<string, string>();
      for (const line of text.split("\n")) indexLine(map, line);
      return map;
    } catch (e) {
      if (e instanceof BlobNotFoundError) return null;
      throw e;
    }
  }

  async function writeBucketToBlob(
    bucket: string,
    members: Map<string, string>,
  ): Promise<void> {
    const key = bucketBlobKey(bucket);
    try {
      await put(key, [...members.values()].join("\n"), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/x-ndjson",
      });
    } catch (e) {
      console.warn(`failed to cache ${key} to blob:`, e);
    }
  }

  function buildBucketFromSource(
    fullMap: Map<string, string>,
    bucket: string,
  ): Map<string, string> {
    const out = new Map<string, string>();
    for (const [id, line] of fullMap) {
      if (bucketFor(id) === bucket) out.set(id, line);
    }
    return out;
  }

  async function fetchJson(id: string): Promise<string | null> {
    const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
    const bucket = bucketFor(id);

    if (hasBlob) {
      let pending = bucketCache.get(bucket);
      if (pending === undefined) {
        pending = readBucketFromBlob(bucket);
        bucketCache.set(bucket, pending);
      }
      const fromBlob = await pending;
      if (fromBlob != null) return fromBlob.get(id) ?? null;
    }

    const fullMap = await loadFullMap();
    const members = buildBucketFromSource(fullMap, bucket);
    if (hasBlob && members.size > 0) {
      bucketCache.set(bucket, Promise.resolve(members));
      after(writeBucketToBlob(bucket, members));
    }
    return members.get(id) ?? null;
  }

  async function GET(
    _req: Request,
    { params }: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> {
    const resolved = await params;
    const id = Object.values(resolved)[0];
    const json = id ? await fetchJson(id) : null;
    if (!json) return new NextResponse("not found", { status: 404 });
    return new NextResponse(json, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  return { fetchJson, GET };
}
