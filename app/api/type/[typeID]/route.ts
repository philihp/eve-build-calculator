import { createJsonlLookup } from "@/app/sde-lookup";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

// Group typeIDs by their last two digits so the whole catalogue lives in
// ~100 blobs instead of one-per-typeID. Vercel Blob caps daily operations,
// and a per-typeID layout would burn through that on a single crawl.
const lookup = createJsonlLookup({
  fileName: "types.jsonl",
  blobPrefix: "types/bucket-",
});

export const GET = lookup.GET;
