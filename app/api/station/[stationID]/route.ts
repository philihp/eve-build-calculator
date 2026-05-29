import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// NPC stations keyed by stationID (SDE `_key`).
const lookup = createJsonlLookup({
  fileName: "npcStations.jsonl",
  blobPrefix: "stations/bucket-",
});

export const GET = lookup.GET;
