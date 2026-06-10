import { sdeCacheHeaders } from "../sde-cache-headers";
import { computeStaticInputs, toCsv } from "./static-inputs-data";

export const dynamic = "force-static";

export async function GET() {
  const rows = await computeStaticInputs();
  return new Response(toCsv(rows), {
    headers: sdeCacheHeaders("text/plain; charset=utf-8"),
  });
}
