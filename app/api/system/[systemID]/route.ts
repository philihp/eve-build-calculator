import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Solar systems keyed by solarSystemID (SDE `_key`); carries constellationID, regionID, factionID, securityStatus.
const lookup = createJsonlLookup({
  fileName: "mapSolarSystems.jsonl",
  blobPrefix: "systems/bucket-",
});

export const GET = lookup.GET;
