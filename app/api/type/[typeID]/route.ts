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

let localCache: Map<string, string> | null = null;
async function loadLocalTypes(): Promise<Map<string, string>> {
  if (localCache) return localCache;
  const map = new Map<string, string>();
  const rl = createInterface({
    input: createReadStream(LOCAL_TYPES_PATH),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const t = JSON.parse(line) as { typeID?: number; _key?: number };
    const id = t.typeID ?? t._key;
    if (id != null) map.set(String(id), line);
  }
  localCache = map;
  return map;
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
  // Local-dev fallback: serve straight out of the file the prebuild step
  // extracted into /public/sde/.
  if (!existsSync(LOCAL_TYPES_PATH)) return null;
  const map = await loadLocalTypes();
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
