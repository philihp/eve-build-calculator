import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { NextResponse } from "next/server";

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

async function fetchJson(id: string): Promise<string | null> {
  const map = await loadFullMap();
  return map.get(id) ?? null;
}

// npcStations rows carry `solarSystemID` but not the region — CCP's SDE keeps
// the map hierarchy normalised. Build a solarSystemID → regionID index from
// mapSolarSystems so we can surface `regionId` without a second round trip.
const LOCAL_SYSTEMS_PATH = join(
  process.cwd(),
  "public",
  "sde",
  "mapSolarSystems.jsonl",
);

let systemRegionPromise: Promise<Map<number, number>> | null = null;

function indexSystemRegion(map: Map<number, number>, line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as { _key?: number; regionID?: number };
    if (obj._key != null && obj.regionID != null) {
      map.set(obj._key, obj.regionID);
    }
  } catch {
    // ignore malformed rows
  }
}

async function buildSystemRegionMap(): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (existsSync(LOCAL_SYSTEMS_PATH)) {
    const rl = createInterface({
      input: createReadStream(LOCAL_SYSTEMS_PATH),
      crlfDelay: Infinity,
    });
    for await (const line of rl) indexSystemRegion(map, line);
    return map;
  }
  // Best effort: if the systems file isn't reachable, regionId is simply omitted.
  const res = await fetch(`${baseUrl()}/sde/mapSolarSystems.jsonl`);
  if (!res.ok) return map;
  const text = await res.text();
  for (const line of text.split("\n")) indexSystemRegion(map, line);
  return map;
}

function loadSystemRegionMap(): Promise<Map<number, number>> {
  systemRegionPromise ??= buildSystemRegionMap();
  return systemRegionPromise;
}

async function resolveRegionId(
  solarSystemId: number,
): Promise<number | undefined> {
  const map = await loadSystemRegionMap();
  return map.get(solarSystemId);
}

// npcStations rows are pure IDs — the display name ("Jita IV - Moon 4 -
// Caldari Navy Assembly Plant") is generated, not stored. ESI exposes the
// finished name, so fold it in from /universe/stations/{id}/. Per-lambda
// memoised; ESI's own CDN handles the heavier caching.
const ESI_BASE = "https://esi.evetech.net/latest";
const nameCache = new Map<string, Promise<string | null>>();

function fetchStationName(id: string): Promise<string | null> {
  let pending = nameCache.get(id);
  if (pending === undefined) {
    pending = (async () => {
      try {
        const res = await fetch(
          `${ESI_BASE}/universe/stations/${id}/?datasource=tranquility`,
          {
            headers: {
              accept: "application/json",
              "user-agent":
                "eve-build-calculator (+https://eve-build-calculator.philihp.com)",
            },
          },
        );
        if (!res.ok) return null;
        const { name } = (await res.json()) as { name?: string };
        return name ?? null;
      } catch {
        return null;
      }
    })();
    nameCache.set(id, pending);
  }
  return pending;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ stationID: string }> },
) {
  const { stationID } = await params;
  const [json, name] = await Promise.all([
    fetchJson(stationID),
    fetchStationName(stationID),
  ]);
  if (!json) return new NextResponse("not found", { status: 404 });

  // Enrich the raw SDE row with the ESI-generated name plus normalised
  // `solarSystemId`/`regionId` so consumers can resolve the system (and region)
  // via /api/system/{id} and /api/region/{id}. Best effort: if the row somehow
  // isn't valid JSON, return it untouched (preserves prior behaviour).
  let row: Record<string, unknown>;
  try {
    row = JSON.parse(json) as Record<string, unknown>;
  } catch {
    return new NextResponse(json, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const solarSystemId =
    typeof row.solarSystemID === "number" ? row.solarSystemID : undefined;
  // Prefer a denormalised regionID if the row ever carries one; otherwise walk
  // solarSystemID → mapSolarSystems → regionID.
  let regionId =
    typeof row.regionID === "number" ? row.regionID : undefined;
  if (regionId === undefined && solarSystemId !== undefined) {
    regionId = await resolveRegionId(solarSystemId);
  }

  const enriched: Record<string, unknown> = { ...row };
  if (name) enriched.name = name;
  if (solarSystemId !== undefined) enriched.solarSystemId = solarSystemId;
  if (regionId !== undefined) enriched.regionId = regionId;

  return new NextResponse(JSON.stringify(enriched), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
