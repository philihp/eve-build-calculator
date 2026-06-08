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

function pickName(name: unknown): string | null {
  if (typeof name === "string") return name;
  if (name && typeof name === "object" && "en" in name) {
    const en = (name as { en?: unknown }).en;
    if (typeof en === "string") return en;
  }
  return null;
}

export type InputRow = {
  typeID: number;
  type: string;
  materialID: number;
  material: string;
  inputQty: number;
};

type Material = { typeID: number; quantity: number };

// Walks every manufacturing blueprint, pairing each manufactured type with the
// materials it consumes. Rows are sorted by the product's TypeID and then by
// each material's TypeID.
export async function computeStaticInputs(): Promise<InputRow[]> {
  // Pass 1: collect (product, materials) from blueprints and gather the set of
  // typeIDs whose names we'll need, so pass 2 can ignore everything else.
  const blueprints: { productID: number; materials: Material[] }[] = [];
  const neededIds = new Set<number>();

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

    const productID = products[0].typeID;
    neededIds.add(productID);
    for (const m of materials) neededIds.add(m.typeID);
    blueprints.push({ productID, materials });
  }

  // Pass 2: resolve names for just the typeIDs we referenced.
  const names = new Map<number, string>();
  for await (const line of readLines("types.jsonl")) {
    if (!line.trim()) continue;
    const obj = JSON.parse(line) as {
      typeID?: number;
      _key?: number;
      name?: unknown;
    };
    const id = obj.typeID ?? obj._key;
    if (id == null || !neededIds.has(id)) continue;
    const name = pickName(obj.name);
    if (name) names.set(id, name);
  }

  const rows: InputRow[] = [];
  for (const { productID, materials } of blueprints) {
    const type = names.get(productID);
    if (type == null) continue;
    for (const m of materials) {
      const material = names.get(m.typeID);
      if (material == null) continue;
      rows.push({
        typeID: productID,
        type,
        materialID: m.typeID,
        material,
        inputQty: m.quantity,
      });
    }
  }

  rows.sort(
    (a, b) => a.typeID - b.typeID || a.materialID - b.materialID,
  );
  return rows;
}

// RFC 4180 field escaping: quote when the value contains a comma, quote, or
// newline, doubling any embedded quotes.
function csvField(value: string): string {
  return /[",\n\r]/.test(value)
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

export function toCsv(rows: InputRow[]): string {
  const lines = ["Type,Material,InputQty"];
  for (const r of rows) {
    lines.push(`${csvField(r.type)},${csvField(r.material)},${r.inputQty}`);
  }
  return lines.join("\n");
}
