import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

// Where the prebuild step drops the extracted SDE JSONL files. Served at
// /sde/* in production, present on disk during local dev / build.
const SDE_DIR = join(process.cwd(), "public", "sde");

function baseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

// Yields the lines of an SDE JSONL file. Streams the local copy when it
// exists (dev / build), otherwise fetches the deployment's own static asset
// (Vercel runtime, where /public lives on the CDN rather than the bundle) —
// mirroring app/api/type/[typeID]/route.ts.
async function* readLines(filename: string): AsyncGenerator<string> {
  const local = join(SDE_DIR, filename);
  if (existsSync(local)) {
    const rl = createInterface({
      input: createReadStream(local),
      crlfDelay: Infinity,
    });
    for await (const line of rl) yield line;
    return;
  }
  const res = await fetch(`${baseUrl()}/sde/${filename}`);
  if (!res.ok) {
    throw new Error(`failed to fetch ${filename}: ${res.status}`);
  }
  const text = await res.text();
  for (const line of text.split("\n")) yield line;
}

export type InputRow = {
  typeID: number;
  materialID: number;
  inputQty: number;
};

type Material = { typeID: number; quantity: number };

// Walks every manufacturing blueprint, pairing each manufactured type with the
// materials it consumes. Rows are sorted by the product's TypeID and then by
// each material's TypeID.
export async function computeStaticInputs(): Promise<InputRow[]> {
  const rows: InputRow[] = [];

  for await (const line of readLines("blueprints.jsonl")) {
    if (!line.trim()) continue;
    const obj = JSON.parse(line) as {
      activities?: {
        manufacturing?: {
          products?: { typeID: number; quantity: number }[];
          materials?: Material[];
        };
      };
    };
    const mfg = obj.activities?.manufacturing;
    const products = mfg?.products;
    const materials = mfg?.materials;
    if (!products?.length || !materials?.length) continue;

    const typeID = products[0].typeID;
    for (const m of materials) {
      rows.push({ typeID, materialID: m.typeID, inputQty: m.quantity });
    }
  }

  rows.sort((a, b) => a.typeID - b.typeID || a.materialID - b.materialID);
  return rows;
}

export function toCsv(rows: InputRow[]): string {
  const lines = ["Type,Material,InputQty"];
  for (const r of rows) {
    lines.push(`${r.typeID},${r.materialID},${r.inputQty}`);
  }
  return lines.join("\n");
}
