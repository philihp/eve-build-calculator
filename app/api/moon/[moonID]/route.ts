import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Moons keyed by moonID (SDE `_key`).
const lookup = createJsonlLookup({
  fileName: "mapMoons.jsonl",
  blobPrefix: "moons/bucket-",
});

export const GET = lookup.GET;
