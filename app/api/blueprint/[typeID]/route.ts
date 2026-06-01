import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { NextResponse } from "next/server";

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

function baseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
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

// Load the whole catalogue into a product-typeID→line map once per lambda. The
// bundled /sde file is the source of truth; read it from disk when colocated
// with the function, otherwise fetch the static asset over HTTP.
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
  const res = await fetch(`${baseUrl()}/sde/blueprints.jsonl`);
  if (!res.ok) {
    throw new Error(
      `failed to fetch blueprints.jsonl from ${baseUrl()}: ${res.status}`,
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

async function fetchBlueprintJson(typeID: string): Promise<string | null> {
  const map = await loadBlueprintsMap();
  return map.get(typeID) ?? null;
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
