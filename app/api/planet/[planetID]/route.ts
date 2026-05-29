import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Planets keyed by planetID (SDE `_key`).
const lookup = createJsonlLookup({
  fileName: "mapPlanets.jsonl",
  blobPrefix: "planets/bucket-",
});

export const GET = lookup.GET;
