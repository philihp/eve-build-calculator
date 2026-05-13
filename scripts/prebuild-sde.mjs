#!/usr/bin/env node
// Downloads CCP's SDE and extracts blueprints.jsonl + types.jsonl into
// public/sde/ so the deployed site serves them at /sde/*.
//
// Runs as `prebuild` before `next build`.

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
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

async function download() {
  await mkdir(CACHE_DIR, { recursive: true });
  console.log(`→ fetching ${SDE_URL}`);
  const res = await fetch(SDE_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(ZIP_PATH));
  console.log(`  saved → ${ZIP_PATH}`);
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

await download();
await extract();
