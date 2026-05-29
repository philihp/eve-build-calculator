import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Stars keyed by starID (SDE `_key`).
const lookup = createJsonlLookup({
  fileName: "mapStars.jsonl",
  blobPrefix: "stars/bucket-",
});

export const GET = lookup.GET;
