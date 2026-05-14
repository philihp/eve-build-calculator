import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const dynamicParams = false;

const DB_PATH = join(process.cwd(), ".cache", "sde.db");

// Prerender only the 200 lowest typeIDs at build time. Generating a page for
// every row in types.jsonl (~50k+) blows up build time; the long tail can be
// added back later if/when something actually consumes those endpoints.
const STATIC_LIMIT = 200;

let dbInstance: DatabaseSync | null = null;
function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;
  dbInstance = new DatabaseSync(DB_PATH, { readOnly: true });
  return dbInstance;
}

export async function generateStaticParams() {
  const rows = getDb()
    .prepare("SELECT id FROM types ORDER BY id ASC LIMIT ?")
    .all(STATIC_LIMIT) as { id: number | bigint }[];
  return rows.map((r) => ({ typeID: String(r.id) }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ typeID: string }> },
) {
  const { typeID } = await params;
  const row = getDb()
    .prepare("SELECT json FROM types WHERE id = ?")
    .get(Number(typeID)) as { json: string } | undefined;
  if (!row) return new NextResponse("not found", { status: 404 });
  return new NextResponse(row.json, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
