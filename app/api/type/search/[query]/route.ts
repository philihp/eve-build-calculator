import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

const LOCAL_TYPES_PATH = join(process.cwd(), "public", "sde", "types.jsonl");
const MAX_RESULTS = 100;

type NameIndexEntry = { typeID: number; name: string };

let nameIndexPromise: Promise<NameIndexEntry[]> | null = null;

function indexLine(out: NameIndexEntry[], line: string): void {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line) as {
      typeID?: number;
      _key?: number;
      name?: string | { en?: string };
    };
    const id = obj.typeID ?? obj._key;
    if (id == null) return;
    const name =
      typeof obj.name === "string" ? obj.name : obj.name?.en ?? "";
    if (!name) return;
    out.push({ typeID: id, name });
  } catch {
    // ignore malformed rows
  }
}

async function buildNameIndex(): Promise<NameIndexEntry[]> {
  const out: NameIndexEntry[] = [];
  if (existsSync(LOCAL_TYPES_PATH)) {
    const rl = createInterface({
      input: createReadStream(LOCAL_TYPES_PATH),
      crlfDelay: Infinity,
    });
    for await (const line of rl) indexLine(out, line);
    return out;
  }
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/sde/types.jsonl`);
  if (!res.ok) {
    throw new Error(`failed to fetch types.jsonl from ${baseUrl}: ${res.status}`);
  }
  const text = await res.text();
  for (const line of text.split("\n")) indexLine(out, line);
  return out;
}

function loadNameIndex(): Promise<NameIndexEntry[]> {
  nameIndexPromise ??= buildNameIndex();
  return nameIndexPromise;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ query: string }> },
) {
  const { query } = await params;
  const needle = decodeURIComponent(query).toLowerCase();
  if (!needle) {
    return NextResponse.json({ query: needle, results: [] });
  }
  const index = await loadNameIndex();
  const results: NameIndexEntry[] = [];
  for (const entry of index) {
    if (entry.name.toLowerCase().includes(needle)) {
      results.push(entry);
      if (results.length >= MAX_RESULTS) break;
    }
  }
  return NextResponse.json({
    query: needle,
    truncated: results.length >= MAX_RESULTS,
    results,
  });
}
