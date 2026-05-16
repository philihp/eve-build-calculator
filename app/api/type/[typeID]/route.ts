import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { BlobNotFoundError, head } from "@vercel/blob";
import { NextResponse } from "next/server";

// Prerender nothing at build time; each typeID is rendered on its first
// request and cached by Next afterwards.
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

const LOCAL_TYPES_PATH = join(process.cwd(), "public", "sde", "types.jsonl");

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
  // No local file (Vercel runtime where /public is on the CDN, not the
  // function bundle). Fetch the deployment's own static asset.
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

async function fetchTypeJson(typeID: string): Promise<string | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await head(`types/${typeID}.json`);
      const upstream = await fetch(blob.url);
      return await upstream.text();
    } catch (e) {
      if (e instanceof BlobNotFoundError) return null;
      throw e;
    }
  }
  const map = await loadTypesMap();
  return map.get(typeID) ?? null;
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
