#!/usr/bin/env node
// Downloads CCP's SDE and extracts the JSONL files listed in SDE_FILES into
// public/sde/ so the deployed site serves them at /sde/*. The runtime route
// handlers read each file on first miss and write bucketed blobs to Vercel
// Blob as a durable cache.
//
// Runs as `prebuild` before `next build`.

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, ".cache");
const ZIP_PATH = join(CACHE_DIR, "eve-online-static-data-latest-jsonl.zip");
const OUT_DIR = join(ROOT, "public", "sde");

const SDE_URL =
  "https://developers.eveonline.com/static-data/eve-online-static-data-latest-jsonl.zip";

const fmtMB = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " MB";

async function download() {
  await mkdir(CACHE_DIR, { recursive: true });
  console.log(`→ fetching ${SDE_URL}`);
  const res = await fetch(SDE_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(ZIP_PATH));
  const { size } = await stat(ZIP_PATH);
  console.log(`  saved → ${ZIP_PATH} (${fmtMB(size)})`);
  return size;
}

// JSONL files lifted out of the SDE zip into public/sde/. Each one backs a
// runtime lookup route (see app/api/*/[id]/route.ts) keyed by the row's
// `_key`/`typeID`.
const SDE_FILES = [
  "blueprints.jsonl",
  "types.jsonl",
  // Map hierarchy + celestials + stations, exposed as /api/{system,constellation,
  // region,stargate,star,station}/{id}. mapMoons/mapPlanets/mapAsteroidBelts are
  // intentionally excluded — they're hundreds of MB and blow the deploy budget.
  "mapSolarSystems.jsonl",
  "mapConstellations.jsonl",
  "mapRegions.jsonl",
  "mapStargates.jsonl",
  "mapStars.jsonl",
  "npcStations.jsonl",
];

async function extract() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`→ extracting ${SDE_FILES.length} jsonl files → ${OUT_DIR}`);
  await new Promise((ok, fail) => {
    const p = spawn(
      "unzip",
      ["-q", "-o", "-j", ZIP_PATH, ...SDE_FILES.map((f) => `*${f}`), "-d", OUT_DIR],
      { stdio: "inherit" },
    );
    p.on("close", (code) =>
      code === 0 ? ok() : fail(new Error(`unzip exited ${code}`)),
    );
  });
}

async function listOutDir() {
  const entries = await readdir(OUT_DIR);
  const sized = [];
  for (const name of entries) {
    const { size } = await stat(join(OUT_DIR, name));
    sized.push({ name, bytes: size });
  }
  return sized;
}

const sdeZipBytes = await download();
await extract();
const files = await listOutDir();
console.log(`→ public/sde/ contents (${files.length} entries):`);
for (const f of files) {
  console.log(`    ${f.name}  ${fmtMB(f.bytes)}  (${f.bytes} bytes)`);
}
await writeFile(
  join(OUT_DIR, ".build-info.json"),
  JSON.stringify(
    { sdeZipBytes, files, builtAt: new Date().toISOString() },
    null,
    2,
  ),
);
