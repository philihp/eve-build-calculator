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

export type OutputRow = {
  typeID: number;
  outputQty: number;
  jobTime: number;
};

type Activity = {
  products?: { typeID: number; quantity: number }[];
  time?: number;
};

// Activities that actually produce the item a blueprint is "for". Invention is
// excluded — it yields blueprint copies, not the finished good.
const OUTPUT_ACTIVITIES = ["manufacturing", "reaction"] as const;

// Walks every blueprint, emitting the product of each manufacturing/reaction
// run: its TypeID, the per-run output quantity, and the job time (seconds).
// Sorted by the product's TypeID.
export async function computeStaticOutputs(): Promise<OutputRow[]> {
  const rows: OutputRow[] = [];

  for await (const line of readLines("blueprints.jsonl")) {
    if (!line.trim()) continue;
    const obj = JSON.parse(line) as {
      activities?: Partial<Record<(typeof OUTPUT_ACTIVITIES)[number], Activity>>;
    };
    const activities = obj.activities;
    if (!activities) continue;

    for (const name of OUTPUT_ACTIVITIES) {
      const activity = activities[name];
      const products = activity?.products;
      if (!activity || !products?.length) continue;
      rows.push({
        typeID: products[0].typeID,
        outputQty: products[0].quantity,
        jobTime: activity.time ?? 0,
      });
    }
  }

  rows.sort((a, b) => a.typeID - b.typeID);
  return rows;
}

export function toCsv(rows: OutputRow[]): string {
  const lines = ["Type,OutputQty,JobTime"];
  for (const r of rows) {
    lines.push(`${r.typeID},${r.outputQty},${r.jobTime}`);
  }
  return lines.join("\n");
}
