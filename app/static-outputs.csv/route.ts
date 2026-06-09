import { computeStaticOutputs, toCsv } from "../static-outputs/static-outputs-data";

export const dynamic = "force-static";

export async function GET() {
  const rows = await computeStaticOutputs();
  return new Response(toCsv(rows), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
