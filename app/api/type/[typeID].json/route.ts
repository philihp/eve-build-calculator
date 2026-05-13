import { createReadStream } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = false;

const TYPES_PATH = join(process.cwd(), "public", "sde", "types.jsonl");

let typesCache: Map<string, string> | null = null;

async function loadTypes(): Promise<Map<string, string>> {
  if (typesCache) return typesCache;
  const map = new Map<string, string>();
  const rl = createInterface({
    input: createReadStream(TYPES_PATH),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const t = JSON.parse(line) as {
      typeID?: number | string;
      _key?: number | string;
    };
    const id = t.typeID ?? t._key;
    if (id != null) map.set(String(id), line);
  }
  typesCache = map;
  return map;
}

export async function generateStaticParams() {
  const types = await loadTypes();
  return [...types.keys()].map((typeID) => ({ typeID }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ typeID: string }> },
) {
  const { typeID } = await params;
  const types = await loadTypes();
  const json = types.get(typeID);
  if (!json) return new NextResponse("not found", { status: 404 });
  return new NextResponse(json, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
