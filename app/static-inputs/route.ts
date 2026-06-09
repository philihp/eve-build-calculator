import { computeStaticInputs, toCsv } from "./static-inputs-data";

// Computed once from the SDE at build time and cached thereafter.
export const dynamic = "force-static";

// Serve the table as raw text/csv (not an HTML page) so tools like Google
// Sheets' IMPORTDATA parse the columns directly instead of choking on markup.
export async function GET() {
  const rows = await computeStaticInputs();
  return new Response(toCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "inline",
    },
  });
}
