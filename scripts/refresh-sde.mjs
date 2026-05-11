#!/usr/bin/env node
// Regenerates app/sde-data.ts from the official EVE Online SDE.
//
// Source:  https://developers.eveonline.com/static-data
// Format:  JSON Lines (`eve-online-static-data-latest-jsonl.zip`)
// Updated: whenever CCP publishes a new SDE (current: v3333874, 2026-05-06)
//
// Usage: `npm run refresh-sde`
// Requires: `unzip` on PATH (standard on macOS/Linux; Windows: install via `winget install -e --id GnuWin32.UnZip` or use WSL)

import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, ".cache");
const ZIP_PATH = join(CACHE_DIR, "eve-online-static-data-latest-jsonl.zip");
const EXTRACT_DIR = join(CACHE_DIR, "sde");
const OUT_PATH = join(ROOT, "app", "sde-data.ts");

const SDE_URL =
  "https://developers.eveonline.com/static-data/eve-online-static-data-latest-jsonl.zip";

// Single source of truth: the 24 capital hulls grouped by class.
// Add new hulls here; the script resolves their typeIDs from types.jsonl.
const HULLS_BY_SHIP_TYPE = {
  Freighter: ["Charon", "Fenrir", "Providence", "Obelisk"],
  Dreadnought: ["Phoenix", "Naglfar", "Revelation", "Moros"],
  "Faction Dread": ["Vehement", "Chemosh", "Caiman", "Zirnitra"],
  Carrier: ["Chimera", "Nidhoggur", "Archon", "Thanatos"],
  Supercarrier: ["Wyvern", "Hel", "Aeon", "Nyx"],
  Titan: ["Leviathan", "Ragnarok", "Avatar", "Erebus"],
};

const SHIPS = Object.keys(HULLS_BY_SHIP_TYPE);

const COMPONENTS = [
  "Capital Armor Plates",
  "Capital Capacitor Battery",
  "Capital Computer System",
  "Capital Construction Parts",
  "Capital Corporate Hangar Bay",
  "Capital Drone Bay",
  "Capital Jump Drive",
  "Capital Power Generator",
  "Capital Propulsion Engine",
  "Capital Sensor Cluster",
  "Capital Shield Emitter",
  "Capital Ship Maintenance Bay",
];

async function download() {
  await mkdir(CACHE_DIR, { recursive: true });
  console.log(`→ fetching ${SDE_URL}`);
  const res = await fetch(SDE_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(ZIP_PATH));
  console.log(`  saved → ${ZIP_PATH}`);
}

async function extract() {
  await rm(EXTRACT_DIR, { recursive: true, force: true });
  await mkdir(EXTRACT_DIR, { recursive: true });
  console.log(`→ extracting blueprints.jsonl + types.jsonl`);
  await new Promise((ok, fail) => {
    const p = spawn(
      "unzip",
      ["-q", "-o", "-j", ZIP_PATH, "*blueprints.jsonl", "*types.jsonl", "-d", EXTRACT_DIR],
      { stdio: "inherit" },
    );
    p.on("close", (code) =>
      code === 0 ? ok() : fail(new Error(`unzip exited ${code}`)),
    );
  });
}

async function* readJsonl(path) {
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (line.trim()) yield JSON.parse(line);
  }
}

// CCP's reworked SDE puts localized names under name.en (or similar). Be defensive.
function pickName(t) {
  if (typeof t.name === "string") return t.name;
  if (t.name?.en) return t.name.en;
  return null;
}

async function loadTypeIdByName(targetNames) {
  const remaining = new Set(targetNames);
  const result = new Map();
  for await (const t of readJsonl(join(EXTRACT_DIR, "types.jsonl"))) {
    const name = pickName(t);
    const id = t.typeID ?? t._key;
    if (!name || id == null) continue;
    if (remaining.has(name)) {
      result.set(name, id);
      remaining.delete(name);
      if (remaining.size === 0) break;
    }
  }
  if (remaining.size > 0) {
    throw new Error(
      `types.jsonl: missing names ${[...remaining].sort().join(", ")}`,
    );
  }
  return result;
}

async function loadBlueprintsByProduct(productIds) {
  const want = new Set(productIds);
  const result = new Map();
  for await (const bp of readJsonl(join(EXTRACT_DIR, "blueprints.jsonl"))) {
    const products = bp.activities?.manufacturing?.products;
    if (!products?.length) continue;
    const productId = products[0].typeID;
    if (want.has(productId)) result.set(productId, bp);
  }
  return result;
}

async function buildBom() {
  const allHullNames = Object.values(HULLS_BY_SHIP_TYPE).flat();
  const componentTypeId = await loadTypeIdByName([
    ...allHullNames,
    ...COMPONENTS,
  ]);

  const hullIds = new Map(
    allHullNames.map((n) => [n, componentTypeId.get(n)]),
  );
  const componentNameById = new Map(
    COMPONENTS.map((n) => [componentTypeId.get(n), n]),
  );

  const blueprints = await loadBlueprintsByProduct([...hullIds.values()]);

  const bom = {};
  const catalog = [];
  for (const [shipType, hullNames] of Object.entries(HULLS_BY_SHIP_TYPE)) {
    const perHull = [];
    for (const hullName of hullNames) {
      const hullId = hullIds.get(hullName);
      catalog.push({ name: hullName, typeId: hullId, shipType });
      const bp = blueprints.get(hullId);
      if (!bp) {
        throw new Error(`No manufacturing blueprint for ${hullName} (${hullId})`);
      }
      const mats = {};
      for (const m of bp.activities.manufacturing.materials ?? []) {
        const cName = componentNameById.get(m.typeID);
        if (cName) mats[cName] = m.quantity;
      }
      perHull.push([hullName, mats]);
    }
    // Invariant: every hull in a class must share an identical capital-component map.
    const [refName, refMats] = perHull[0];
    for (const [n, m] of perHull.slice(1)) {
      if (JSON.stringify(sortKeys(m)) !== JSON.stringify(sortKeys(refMats))) {
        throw new Error(
          `BOM mismatch within ${shipType}: ${refName}=${JSON.stringify(refMats)} vs ${n}=${JSON.stringify(m)}`,
        );
      }
    }
    bom[shipType] = sortKeys(refMats);
  }
  return { bom, catalog };
}

function sortKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function emit(bom, catalog, sdeVersion) {
  const stanza = (shipType) => {
    const entries = Object.entries(bom[shipType])
      .map(([k, v]) => `    ${JSON.stringify(k)}: ${v},`)
      .join("\n");
    return `  ${JSON.stringify(shipType)}: {\n${entries}\n  },`;
  };
  const catalogLines = catalog
    .map(
      (c) =>
        `  { name: ${JSON.stringify(c.name)}, typeId: ${c.typeId}, shipType: ${JSON.stringify(c.shipType)} },`,
    )
    .join("\n");
  return `// @generated by scripts/refresh-sde.mjs — do not edit by hand.
// Source:  https://developers.eveonline.com/static-data
// SDE:     ${sdeVersion}
// Run \`npm run refresh-sde\` to refresh.

export const SHIPS = ${JSON.stringify(SHIPS, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : "  " + l))
    .join("\n")} as const;

export type Ship = (typeof SHIPS)[number];

export const COMPONENTS = ${JSON.stringify(COMPONENTS, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : "  " + l))
    .join("\n")} as const;

export type Component = (typeof COMPONENTS)[number];

export const BOM: Record<Ship, Partial<Record<Component, number>>> = {
${SHIPS.map(stanza).join("\n")}
};

export type CatalogEntry = { name: string; typeId: number; shipType: Ship };

export const SHIP_CATALOG: CatalogEntry[] = [
${catalogLines}
];
`;
}

async function main() {
  await download();
  await extract();
  const { bom, catalog } = await buildBom();
  // SDE version isn't surfaced in the JSONL itself; record the publish date the user sees.
  const sdeVersion = new Date().toISOString().slice(0, 10) + " (latest)";
  await writeFile(OUT_PATH, emit(bom, catalog, sdeVersion));
  console.log(
    `→ wrote ${OUT_PATH} (${catalog.length} hulls, ${COMPONENTS.length} components)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
