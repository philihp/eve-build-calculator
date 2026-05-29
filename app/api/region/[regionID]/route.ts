import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Regions keyed by regionID (SDE `_key`).
const lookup = createJsonlLookup({
  fileName: "mapRegions.jsonl",
  blobPrefix: "regions/bucket-",
});

export const GET = lookup.GET;
