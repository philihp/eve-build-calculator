#!/usr/bin/env node
// Stub: stream the EVE Online SDE bundle to ephemeral build-time /tmp.
// Runs as the `prebuild` npm lifecycle so it fires during `next build` on Vercel.
// Source: https://developers.eveonline.com/static-data (fallback: Fuzzworks).
// Nothing downstream consumes the file yet — future steps will wire it in.

import { createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const SDE_URL =
  "https://developers.eveonline.com/static-data/eve-online-static-data-latest-jsonl.zip";
const DEST = join(tmpdir(), "eve-online-sde.zip");

const fmtMB = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " MB";

const main = async () => {
  console.log(`[fetch-sde] GET ${SDE_URL}`);
  const res = await fetch(SDE_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(DEST));
  const { size } = await stat(DEST);
  console.log(`[fetch-sde] downloaded to ${DEST} (${fmtMB(size)})`);
};

main().catch((e) => {
  console.error("[fetch-sde] failed:", e.message);
  process.exit(1);
});
