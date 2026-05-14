#!/usr/bin/env node
// Downloads CCP's SDE, extracts blueprints.jsonl + types.jsonl into
// public/sde/ so the deployed site serves them at /sde/*, and uploads
// each row of types.jsonl to Vercel Blob as `types/{typeID}.json` so
// the runtime route handler can serve any typeID on demand.
//
// Runs as `prebuild` before `next build`. Requires BLOB_READ_WRITE_TOKEN
// (auto-injected on Vercel when a Blob store is linked to the project).

import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, ".cache");
const ZIP_PATH = join(CACHE_DIR, "eve-online-static-data-latest-jsonl.zip");
const OUT_DIR = join(ROOT, "public", "sde");

const SDE_URL =
  "https://developers.eveonline.com/static-data/eve-online-static-data-latest-jsonl.zip";

// Concurrent blob uploads. Vercel Blob handles ~hundreds of req/s; this
// keeps prebuild from spending ~all its time waiting on serial PUTs without
// tipping into rate-limit territory.
const UPLOAD_CONCURRENCY = 25;

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
  console.log(`→ extracting blueprints.jsonl + types.jsonl → ${OUT_DIR}`);
  await new Promise((ok, fail) => {
    const p = spawn(
      "unzip",
      [
        "-q",
        "-o",
        "-j",
        ZIP_PATH,
        "*blueprints.jsonl",
        "*types.jsonl",
        "-d",
        OUT_DIR,
      ],
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

async function readTypesJsonl() {
  const path = join(OUT_DIR, "types.jsonl");
  const out = [];
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const obj = JSON.parse(line);
    const id = obj.typeID ?? obj._key;
    if (id == null) continue;
    out.push({ id: Number(id), line });
  }
  return out;
}

async function uploadToBlob(rows) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set — link a Vercel Blob store to this project (or `vercel env pull` for local).",
    );
  }
  console.log(
    `→ uploading ${rows.length} type blobs (concurrency=${UPLOAD_CONCURRENCY})`,
  );
  const start = Date.now();
  let next = 0;
  let done = 0;
  let baseUrl = null;
  const worker = async () => {
    while (true) {
      const idx = next++;
      if (idx >= rows.length) return;
      const { id, line } = rows[idx];
      const result = await put(`types/${id}.json`, line, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
      if (!baseUrl) baseUrl = new URL(result.url).origin;
      done++;
      if (done % 1000 === 0) {
        console.log(`    uploaded ${done}/${rows.length}`);
      }
    }
  };
  await Promise.all(
    Array.from({ length: UPLOAD_CONCURRENCY }, () => worker()),
  );
  console.log(
    `  uploaded ${done} type blobs in ${((Date.now() - start) / 1000).toFixed(1)}s`,
  );

  const ids = rows.map((r) => r.id).sort((a, b) => a - b);
  const indexBody = JSON.stringify(ids);
  const indexResult = await put("types/_ids.json", indexBody, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
  console.log(`  uploaded index → ${indexResult.url}`);
  return { count: done, baseUrl, indexUrl: indexResult.url };
}

const sdeZipBytes = await download();
await extract();
const files = await listOutDir();
console.log(`→ public/sde/ contents (${files.length} entries):`);
for (const f of files) {
  console.log(`    ${f.name}  ${fmtMB(f.bytes)}  (${f.bytes} bytes)`);
}
const rows = await readTypesJsonl();
const blob = await uploadToBlob(rows);
await writeFile(
  join(OUT_DIR, ".build-info.json"),
  JSON.stringify(
    { sdeZipBytes, files, blob, builtAt: new Date().toISOString() },
    null,
    2,
  ),
);
