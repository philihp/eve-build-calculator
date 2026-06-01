import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Stargates keyed by stargateID (SDE `_key`); links a system to its neighbour via destination.
const LOCAL_SDE_PATH = join(
  process.cwd(),
  "public",
  "sde",
  "mapStargates.jsonl",
);

function baseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
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

// Load the whole dataset into an id→line map once per lambda. The bundled
// /sde files are the source of truth; read them from disk when colocated with
// the function, otherwise fetch the static asset over HTTP.
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
  const res = await fetch(`${baseUrl()}/sde/mapStargates.jsonl`);
  if (!res.ok) {
    throw new Error(
      `failed to fetch mapStargates.jsonl from ${baseUrl()}: ${res.status}`,
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

async function fetchJson(id: string): Promise<string | null> {
  const map = await loadFullMap();
  return map.get(id) ?? null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ stargateID: string }> },
) {
  const { stargateID } = await params;
  const json = await fetchJson(stargateID);
  if (!json) return new NextResponse("not found", { status: 404 });
  return new NextResponse(json, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
