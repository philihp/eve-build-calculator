import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Constellations keyed by constellationID (SDE `_key`); carries regionID and member solarSystemIDs.
const lookup = createJsonlLookup({
  fileName: "mapConstellations.jsonl",
  blobPrefix: "constellations/bucket-",
});

export const GET = lookup.GET;
