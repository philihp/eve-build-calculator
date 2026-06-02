import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

// Type rows expose `groupID` but not `categoryID`. The SDE groups file maps the
// two, so the /api/type routes load it here to enrich each type with its
// categoryID. Bundled by scripts/prebuild-sde.mjs; no public lookup route.
const LOCAL_GROUPS_PATH = join(process.cwd(), "public", "sde", "groups.jsonl");

function baseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

let categoryByGroupPromise: Promise<Map<number, number>> | null = null;

// CCP keys each group row by `_key` (the groupID) and carries the categoryID
// alongside. Accept either id field defensively.
function indexLine(map: Map<number, number>, line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as {
      groupID?: number;
      _key?: number;
      categoryID?: number;
    };
    const groupID = obj.groupID ?? obj._key;
    if (groupID != null && obj.categoryID != null) {
      map.set(groupID, obj.categoryID);
    }
  } catch {
    // ignore malformed rows
  }
}

// Load groupID→categoryID once per lambda. The bundled /sde file is the source
// of truth: read it from disk when colocated with the function, otherwise fetch
// the static asset over HTTP (same pattern as the lookup routes).
async function buildCategoryByGroup(): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (existsSync(LOCAL_GROUPS_PATH)) {
    const rl = createInterface({
      input: createReadStream(LOCAL_GROUPS_PATH),
      crlfDelay: Infinity,
    });
    for await (const line of rl) indexLine(map, line);
    return map;
  }
  const res = await fetch(`${baseUrl()}/sde/groups.jsonl`);
  if (!res.ok) {
    throw new Error(
      `failed to fetch groups.jsonl from ${baseUrl()}: ${res.status}`,
    );
  }
  const text = await res.text();
  for (const line of text.split("\n")) indexLine(map, line);
  return map;
}

export function loadCategoryByGroup(): Promise<Map<number, number>> {
  categoryByGroupPromise ??= buildCategoryByGroup();
  return categoryByGroupPromise;
}
