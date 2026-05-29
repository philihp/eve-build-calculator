import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Asteroid belts keyed by asteroidBeltID (SDE `_key`).
const lookup = createJsonlLookup({
  fileName: "mapAsteroidBelts.jsonl",
  blobPrefix: "asteroidbelts/bucket-",
});

export const GET = lookup.GET;
