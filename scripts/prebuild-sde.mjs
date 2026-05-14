#!/usr/bin/env node
// Downloads CCP's SDE, extracts every *.jsonl into public/sde/ so the
// deployed site serves them at /sde/*, and loads every row into a sqlite
// db at .cache/sde.db (one table per jsonl) for fast id lookups at build
// and runtime.
//
// Runs as `prebuild` before `next build`.

import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { DatabaseSync } from "node:sqlite";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, ".cache");
const ZIP_PATH = join(CACHE_DIR, "eve-online-static-data-latest-jsonl.zip");
const OUT_DIR = join(ROOT, "public", "sde");
const DB_PATH = join(CACHE_DIR, "sde.db");

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

async function extract() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`→ extracting *.jsonl → ${OUT_DIR}`);
  await new Promise((ok, fail) => {
    const p = spawn(
      "unzip",
      ["-q", "-o", "-j", ZIP_PATH, "*.jsonl", "-d", OUT_DIR],
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

// SDE rows expose their primary key as either `typeID` or `_key` (CCP's
// reworked schema uses `_key` for most non-types tables).
function pickId(obj) {
  for (const k of ["typeID", "_key"]) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  }
  return null;
}

function tableNameFor(filename) {
  return filename.replace(/\.jsonl$/, "").replace(/[^a-zA-Z0-9_]/g, "_");
}

async function loadJsonlIntoTable(db, table, path) {
  db.exec(
    `CREATE TABLE "${table}" (id INTEGER PRIMARY KEY, json TEXT NOT NULL)`,
  );
  const insert = db.prepare(
    `INSERT OR REPLACE INTO "${table}" (id, json) VALUES (?, ?)`,
  );
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  db.exec("BEGIN");
  let rows = 0;
  let skipped = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      skipped++;
      continue;
    }
    const id = pickId(obj);
    if (id == null) {
      skipped++;
      continue;
    }
    insert.run(id, line);
    rows++;
  }
  db.exec("COMMIT");
  return { rows, skipped };
}

async function buildSqlite() {
  await rm(DB_PATH, { force: true });
  console.log(`→ building sqlite db → ${DB_PATH}`);
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = OFF");
  db.exec("PRAGMA synchronous = OFF");
  const entries = (await readdir(OUT_DIR)).filter((n) => n.endsWith(".jsonl"));
  const stats = [];
  for (const name of entries) {
    const table = tableNameFor(name);
    const { rows, skipped } = await loadJsonlIntoTable(
      db,
      table,
      join(OUT_DIR, name),
    );
    stats.push({ table, rows, skipped });
    console.log(
      `    ${name} → ${table} (${rows} rows${skipped ? `, ${skipped} skipped` : ""})`,
    );
  }
  db.close();
  const { size } = await stat(DB_PATH);
  console.log(`  sqlite db: ${fmtMB(size)} (${size} bytes)`);
  return { size, tables: stats };
}

const sdeZipBytes = await download();
await extract();
const files = await listOutDir();
console.log(`→ public/sde/ contents (${files.length} entries):`);
for (const f of files) {
  console.log(`    ${f.name}  ${fmtMB(f.bytes)}  (${f.bytes} bytes)`);
}
const sqlite = await buildSqlite();
await writeFile(
  join(OUT_DIR, ".build-info.json"),
  JSON.stringify(
    {
      sdeZipBytes,
      files,
      sqlite: { path: DB_PATH, bytes: sqlite.size, tables: sqlite.tables },
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
