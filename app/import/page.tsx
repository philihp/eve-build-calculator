"use client";

import { useMemo, useState } from "react";

type Row = {
  typeId: number;
  item: string;
  required: number;
  available: number;
  needed: number;
};

type Parsed = {
  blueprintName: string | null;
  blueprintTypeId: number | null;
  rows: Row[];
};

const parseNumber = (s: string): number => {
  const n = Number(s.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};

const parseTsv = (input: string): Parsed => {
  const lines = input.split(/\r?\n/);

  let blueprintName: string | null = null;
  let blueprintTypeId: number | null = null;
  let headerIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i].split("\t").map((c) => c.trim());
    if (cells[0] && cells.some((c) => c.toLowerCase() === "required")) {
      headerIdx = i;
      break;
    }
    if (!blueprintName && cells[0]) {
      blueprintName = cells[0];
      const maybeId = cells.find((c, idx) => idx > 0 && /^\d+$/.test(c));
      if (maybeId) blueprintTypeId = Number(maybeId);
    }
  }

  if (headerIdx === -1) {
    return { blueprintName, blueprintTypeId, rows: [] };
  }

  const header = lines[headerIdx].split("\t").map((c) => c.trim().toLowerCase());
  const itemCol = header.indexOf("item");
  const reqCol = header.indexOf("required");
  const availCol = header.indexOf("available");
  const idCol = header.findIndex((c) => c === "typeid" || c === "type id");

  const rows: Row[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = line.split("\t").map((c) => c.trim());
    const item = cells[itemCol] ?? "";
    if (!item) continue;
    const required = parseNumber(cells[reqCol] ?? "0");
    const available = parseNumber(cells[availCol] ?? "0");
    const typeId = idCol >= 0 ? parseNumber(cells[idCol] ?? "0") : 0;
    rows.push({
      typeId,
      item,
      required,
      available,
      needed: Math.max(0, required - available),
    });
  }

  return { blueprintName, blueprintTypeId, rows };
};

const EXAMPLE = `Ragnarok Blueprint\t23774\t\t\t

Components\t\t\t\t
Item\tRequired\tAvailable\tEst. Unit price\ttypeID
Capital Propulsion Engine\t70\t70\t14619077.71\t21009
Capital Turret Hardpoint\t350\t392\t10675408.52\t21011`;

export default function ImportPage() {
  const [text, setText] = useState("");

  const parsed = useMemo(() => parseTsv(text), [text]);

  return (
    <main style={{ padding: "1rem", maxWidth: 1000, margin: "0 auto" }}>
      <h1>Import Blueprint TSV</h1>
      <p>
        Paste the TSV output from EVE Online&apos;s blueprint window below.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={EXAMPLE}
        rows={16}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          padding: "0.5rem",
          boxSizing: "border-box",
        }}
      />

      {parsed.blueprintName && (
        <h2>
          {parsed.blueprintName}
          {parsed.blueprintTypeId !== null && ` (${parsed.blueprintTypeId})`}
        </h2>
      )}

      {parsed.rows.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #888" }}>
                TypeID
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #888" }}>
                Item
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #888" }}>
                Required
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #888" }}>
                Available
              </th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #888" }}>
                Needed
              </th>
            </tr>
          </thead>
          <tbody>
            {parsed.rows.map((row, i) => (
              <tr key={`${row.typeId}-${i}`}>
                <td>{row.typeId || ""}</td>
                <td>{row.item}</td>
                <td style={{ textAlign: "right" }}>
                  {row.required.toLocaleString()}
                </td>
                <td style={{ textAlign: "right" }}>
                  {row.available.toLocaleString()}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: row.needed > 0 ? "bold" : "normal",
                  }}
                >
                  {row.needed.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Paste TSV above to see parsed rows.</p>
      )}
    </main>
  );
}
