import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { NextResponse, type NextRequest } from "next/server";
import { loadCategoryByGroup } from "../../groups";

// Results depend on the `q` query string, so this handler is dynamic — a
// `force-static` segment would strip the search params and always return the
// same response. The sibling /api/type/[typeID] route stays static.
export const dynamic = "force-dynamic";

const LOCAL_SDE_PATH = join(process.cwd(), "public", "sde", "types.jsonl");
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

function baseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

type TypeEntry = { typeID: number; name: string; groupID: number | null };

let indexPromise: Promise<TypeEntry[]> | null = null;

// CCP's reworked SDE stores the localized name as a bare string or under
// `name.en`, and keys the row by `typeID` (falling back to `_key`). Mirror the
// extraction used by scripts/refresh-sde.mjs so we agree on names + ids.
function pickName(t: { name?: string | { en?: string } }): string | null {
  if (typeof t.name === "string") return t.name;
  if (t.name && typeof t.name === "object" && t.name.en) return t.name.en;
  return null;
}

function indexLine(out: TypeEntry[], line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as {
      typeID?: number;
      _key?: number;
      groupID?: number;
      name?: string | { en?: string };
    };
    const name = pickName(obj);
    const id = obj.typeID ?? obj._key;
    if (name && id != null) {
      out.push({ typeID: id, name, groupID: obj.groupID ?? null });
    }
  } catch {
    // ignore malformed rows
  }
}

// Build the searchable [{ typeID, name }] list once per lambda. The bundled
// /sde file is the source of truth: read it from disk when colocated with the
// function, otherwise fetch the static asset over HTTP (same as the lookup
// routes).
async function buildIndex(): Promise<TypeEntry[]> {
  const out: TypeEntry[] = [];
  if (existsSync(LOCAL_SDE_PATH)) {
    const rl = createInterface({
      input: createReadStream(LOCAL_SDE_PATH),
      crlfDelay: Infinity,
    });
    for await (const line of rl) indexLine(out, line);
    return out;
  }
  const res = await fetch(`${baseUrl()}/sde/types.jsonl`);
  if (!res.ok) {
    throw new Error(
      `failed to fetch types.jsonl from ${baseUrl()}: ${res.status}`,
    );
  }
  const text = await res.text();
  for (const line of text.split("\n")) indexLine(out, line);
  return out;
}

function loadIndex(): Promise<TypeEntry[]> {
  indexPromise ??= buildIndex();
  return indexPromise;
}

type Match = {
  typeID: number;
  name: string;
  categoryID: number | null;
  coverage: number;
};

// Rank by how much of the whole name the query covers (query length / name
// length), descending — so the shortest name containing the query wins. A
// query of "BCD" yields ABCD (0.75) before ABCDEFG (0.43) before ABCDEFGHIJ
// (0.3). Ties break alphabetically, then by id, for a stable order. Each result
// is enriched with categoryID (resolved from the type's groupID; null when the
// group is unknown) for downstream rig-matching filters.
function rank(
  entries: TypeEntry[],
  query: string,
  limit: number,
  catByGroup: Map<number, number>,
): Match[] {
  const needle = query.toLowerCase();
  const matches: (TypeEntry & { coverage: number })[] = [];
  for (const entry of entries) {
    if (entry.name.toLowerCase().includes(needle)) {
      matches.push({ ...entry, coverage: query.length / entry.name.length });
    }
  }
  matches.sort(
    (a, b) =>
      b.coverage - a.coverage ||
      a.name.localeCompare(b.name) ||
      a.typeID - b.typeID,
  );
  return matches.slice(0, limit).map(({ typeID, name, groupID, coverage }) => ({
    typeID,
    name,
    categoryID: groupID != null ? (catByGroup.get(groupID) ?? null) : null,
    coverage,
  }));
}

function parseLimit(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = (searchParams.get("q") ?? "").trim();
  if (!query) {
    return NextResponse.json(
      { error: "missing required query parameter `q`" },
      { status: 400 },
    );
  }
  const limit = parseLimit(searchParams.get("limit"));
  const [entries, catByGroup] = await Promise.all([
    loadIndex(),
    loadCategoryByGroup(),
  ]);
  return NextResponse.json(rank(entries, query, limit, catByGroup));
}
