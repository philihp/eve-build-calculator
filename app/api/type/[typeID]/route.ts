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

const LOCAL_TYPES_PATH = join(process.cwd(), "public", "sde", "types.jsonl");
const LOCAL_BUILD_INFO_PATH = join(
  process.cwd(),
  "public",
  "sde",
  ".build-info.json",
);

// A blob written before this build's `builtAt` is stale. Reusing one key
// per typeID means stale entries get overwritten on first re-fetch, so
// storage stays bounded by the number of distinct typeIDs.
const blobKey = (typeID: string) => `types/${typeID}.json`;

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
    const [blob, buildTime] = await Promise.all([
      head(blobKey(typeID)),
      getBuildTime(),
    ]);
    if (new Date(blob.uploadedAt) < buildTime) return null;
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
