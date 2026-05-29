import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Stargates keyed by stargateID (SDE `_key`); links a system to its neighbour via destination.
const lookup = createJsonlLookup({
  fileName: "mapStargates.jsonl",
  blobPrefix: "stargates/bucket-",
});

export const GET = lookup.GET;
