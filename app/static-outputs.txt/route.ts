import { sdeCacheHeaders } from "../sde-cache-headers";
import { computeStaticOutputs, toCsv } from "../static-outputs/static-outputs-data";

export const dynamic = "force-static";

export async function GET() {
  const rows = await computeStaticOutputs();
  return new Response(toCsv(rows), {
    headers: sdeCacheHeaders("text/plain; charset=utf-8"),
  });
}
