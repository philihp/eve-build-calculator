import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { after, NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

const LOCAL_TYPES_PATH = join(process.cwd(), "public", "sde", "types.jsonl");

// Namespace blobs by deployment so a redeploy invalidates the cache.
// Old blobs are abandoned (not deleted) — clean them up out-of-band if
// storage grows unbounded.
const CACHE_VERSION = process.env.VERCEL_DEPLOYMENT_ID ?? "dev";
const blobKey = (typeID: string) =>
  `types/${CACHE_VERSION}/${typeID}.json`;

let typesCachePromise: Promise<Map<string, string>> | null = null;

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

async function buildTypesMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (existsSync(LOCAL_TYPES_PATH)) {
    const rl = createInterface({
      input: createReadStream(LOCAL_TYPES_PATH),
      crlfDelay: Infinity,
    });
    for await (const line of rl) indexLine(map, line);
    return map;
  }
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/sde/types.jsonl`);
  if (!res.ok) {
    throw new Error(`failed to fetch types.jsonl from ${baseUrl}: ${res.status}`);
  }
  const text = await res.text();
  for (const line of text.split("\n")) indexLine(map, line);
  return map;
}

function loadTypesMap(): Promise<Map<string, string>> {
  typesCachePromise ??= buildTypesMap();
  return typesCachePromise;
}

async function readFromBlobCache(typeID: string): Promise<string | null> {
  try {
    const blob = await head(blobKey(typeID));
    const upstream = await fetch(blob.url);
    return await upstream.text();
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

async function writeToBlobCache(typeID: string, line: string): Promise<void> {
  const key = blobKey(typeID);
  try {
    await put(key, line, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } catch (e) {
    console.warn(`failed to cache ${key} to blob:`, e);
  }
}

async function fetchTypeJson(typeID: string): Promise<string | null> {
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  if (hasBlob) {
    const cached = await readFromBlobCache(typeID);
    if (cached != null) return cached;
  }
  const map = await loadTypesMap();
  const line = map.get(typeID);
  if (line == null) return null;
  if (hasBlob) after(writeToBlobCache(typeID, line));
  return line;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ typeID: string }> },
) {
  const { typeID } = await params;
  const json = await fetchTypeJson(typeID);
  if (!json) return new NextResponse("not found", { status: 404 });
  return new NextResponse(json, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
