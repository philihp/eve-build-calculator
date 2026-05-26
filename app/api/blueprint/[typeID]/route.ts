import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { after, NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

const LOCAL_BLUEPRINTS_PATH = join(
  process.cwd(),
  "public",
  "sde",
  "blueprints.jsonl",
);
const LOCAL_BUILD_INFO_PATH = join(
  process.cwd(),
  "public",
  "sde",
  ".build-info.json",
);

// Mirrors /api/type/[typeID]: bucket by the last two digits of the lookup key
// (here, the product typeID) so the catalogue fits in ~100 blobs instead of
// blowing through Vercel Blob's daily operation cap on a crawl.
const BUCKET_KEY_PREFIX = "blueprints/by-product-bucket-";

function bucketFor(typeID: string): string {
  return typeID.padStart(2, "0").slice(-2);
}

const bucketBlobKey = (bucket: string) => `${BUCKET_KEY_PREFIX}${bucket}.jsonl`;

let buildTimePromise: Promise<Date> | null = null;

async function loadBuildTime(): Promise<Date> {
  try {
    if (existsSync(LOCAL_BUILD_INFO_PATH)) {
      const raw = await readFile(LOCAL_BUILD_INFO_PATH, "utf8");
      const { builtAt } = JSON.parse(raw) as { builtAt?: string };
      if (builtAt) return new Date(builtAt);
    } else {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      const res = await fetch(`${baseUrl}/sde/.build-info.json`);
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

let blueprintsCachePromise: Promise<Map<string, string>> | null = null;

type BlueprintLine = {
  activities?: {
    manufacturing?: { products?: { typeID?: number }[] };
  };
};

// A blueprint may produce multiple products; index every product typeID to
// the same raw line so any of them can resolve back to the blueprint.
function indexLine(map: Map<string, string>, line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as BlueprintLine;
    const products = obj.activities?.manufacturing?.products;
    if (!products?.length) return;
    for (const p of products) {
      if (p.typeID != null && !map.has(String(p.typeID))) {
        map.set(String(p.typeID), line);
      }
    }
  } catch {
    // ignore malformed rows
  }
}

async function buildBlueprintsMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (existsSync(LOCAL_BLUEPRINTS_PATH)) {
    const rl = createInterface({
      input: createReadStream(LOCAL_BLUEPRINTS_PATH),
      crlfDelay: Infinity,
    });
    for await (const line of rl) indexLine(map, line);
    return map;
  }
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/sde/blueprints.jsonl`);
  if (!res.ok) {
    throw new Error(
      `failed to fetch blueprints.jsonl from ${baseUrl}: ${res.status}`,
    );
  }
  const text = await res.text();
  for (const line of text.split("\n")) indexLine(map, line);
  return map;
}

function loadBlueprintsMap(): Promise<Map<string, string>> {
  blueprintsCachePromise ??= buildBlueprintsMap();
  return blueprintsCachePromise;
}

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
  // Deduplicate lines — a blueprint with multiple products in this bucket
  // would otherwise be written once per product.
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

async function fetchBlueprintJson(typeID: string): Promise<string | null> {
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  const bucket = bucketFor(typeID);

  if (hasBlob) {
    let pending = bucketCache.get(bucket);
    if (pending === undefined) {
      pending = readBucketFromBlob(bucket);
      bucketCache.set(bucket, pending);
    }
    const fromBlob = await pending;
    if (fromBlob != null) return fromBlob.get(typeID) ?? null;
  }

  const fullMap = await loadBlueprintsMap();
  const members = buildBucketFromSource(fullMap, bucket);
  if (hasBlob && members.size > 0) {
    bucketCache.set(bucket, Promise.resolve(members));
    after(writeBucketToBlob(bucket, members));
  }
  return members.get(typeID) ?? null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ typeID: string }> },
) {
  const { typeID } = await params;
  const json = await fetchBlueprintJson(typeID);
  if (!json) return new NextResponse("not found", { status: 404 });
  return new NextResponse(json, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
