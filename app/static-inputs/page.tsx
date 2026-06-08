import { computeStaticInputs, toCsv } from "./static-inputs-data";

// Computed once from the SDE at build time and cached thereafter.
export const dynamic = "force-static";

export const metadata = {
  title: "Static Inputs CSV",
};

export default async function StaticInputs() {
  const rows = await computeStaticInputs();
  const csv = toCsv(rows);

  return (
    <main>
      <pre>{csv}</pre>
    </main>
  );
}
