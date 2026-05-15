import { BlobNotFoundError, head } from "@vercel/blob";
import { NextResponse } from "next/server";

// Prerender nothing at build time; each typeID is rendered on its first
// request and cached by Next afterwards.
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
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
