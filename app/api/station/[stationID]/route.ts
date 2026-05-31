import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { after, NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// NPC stations keyed by stationID (SDE `_key`).
const LOCAL_SDE_PATH = join(
  process.cwd(),
  "public",
  "sde",
  "npcStations.jsonl",
);
const LOCAL_BUILD_INFO_PATH = join(
  process.cwd(),
  "public",
  "sde",
  ".build-info.json",
);

// Bucket by the last two digits of the lookup id so the file lives in ~100
// blobs instead of one-per-id: Vercel Blob caps daily operations and a
// per-id layout would burn through that on a single crawl.
const BUCKET_KEY_PREFIX = "stations/bucket-";

function bucketFor(id: string): string {
  return id.padStart(2, "0").slice(-2);
}

const bucketBlobKey = (bucket: string) => `${BUCKET_KEY_PREFIX}${bucket}.jsonl`;

function baseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

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

let fullMapPromise: Promise<Map<string, string>> | null = null;

// CCP keys every SDE row by `_key` (stationID, starID, solarSystemID, ...),
// while types.jsonl is looked up by `typeID`. Celestial/station rows also
// carry a `typeID` (the structure/star type), so index under both ids to
// resolve by whichever id this route's callers pass.
function indexLine(map: Map<string, string>, line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as { typeID?: number; _key?: number };
    if (obj._key != null) map.set(String(obj._key), line);
    if (obj.typeID != null) map.set(String(obj.typeID), line);
  } catch {
    // ignore malformed rows
  }
}

async function buildFullMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (existsSync(LOCAL_SDE_PATH)) {
    const rl = createInterface({
      input: createReadStream(LOCAL_SDE_PATH),
      crlfDelay: Infinity,
    });
    for await (const line of rl) indexLine(map, line);
    return map;
  }
  const res = await fetch(`${baseUrl()}/sde/npcStations.jsonl`);
  if (!res.ok) {
    throw new Error(
      `failed to fetch npcStations.jsonl from ${baseUrl()}: ${res.status}`,
    );
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
// head/fetch pair. `null` means the bucket blob is missing or stale.
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
  // A row indexed under both `_key` and `typeID` can land here twice; dedup.
  const unique = new Set(members.values());
  try {
    await put(key, [...unique].join("\n"), {
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ stationID: string }> },
) {
  const { stationID } = await params;
  const json = await fetchJson(stationID);
  if (!json) return new NextResponse("not found", { status: 404 });
  return new NextResponse(json, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
