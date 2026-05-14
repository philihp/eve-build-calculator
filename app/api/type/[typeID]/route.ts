import { BlobNotFoundError, head } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
// Prerender only the lowest 200 typeIDs (see generateStaticParams). Letting
// the long tail render on demand keeps the build fast while still making any
// typeID reachable at /api/type/{id}.json — Next caches the rendered output.
export const dynamicParams = true;

const STATIC_LIMIT = 200;

export async function generateStaticParams() {
  const indexBlob = await head("types/_ids.json");
  const ids = (await fetch(indexBlob.url).then((r) => r.json())) as number[];
  return ids.slice(0, STATIC_LIMIT).map((id) => ({ typeID: String(id) }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ typeID: string }> },
) {
  const { typeID } = await params;
  let blob;
  try {
    blob = await head(`types/${typeID}.json`);
  } catch (e) {
    if (e instanceof BlobNotFoundError) {
      return new NextResponse("not found", { status: 404 });
    }
    throw e;
  }
  const upstream = await fetch(blob.url);
  const body = await upstream.text();
  return new NextResponse(body, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
