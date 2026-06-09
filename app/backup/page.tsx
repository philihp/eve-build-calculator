"use client";

import { useState } from "react";
import * as R from "ramda";
import {
  BOM,
  COMPONENTS,
  SHIP_CATALOG,
  type CatalogEntry,
  type Component,
} from "../sde-data";

// ── Ship Entry (list state) ────────────────────────────────────────────────────

type ShipEntry = CatalogEntry & { id: string; count: number; me: number };

const ME_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// ── Pure computation ───────────────────────────────────────────────────────────

const computeTotals = (
  entries: ShipEntry[],
): Partial<Record<Component, number>> => {
  type Pair = [Component, number];
  const pairs: Pair[] = entries.flatMap((e) =>
    (R.toPairs(BOM[e.shipType] ?? {}) as Pair[]).map(
      ([component, perShip]) => [component, e.count * perShip] as Pair,
    ),
  );
  return R.reduce(
    (acc: Partial<Record<Component, number>>, [component, qty]: Pair) =>
      R.assoc(component, (acc[component] ?? 0) + qty, acc),
    {},
    pairs,
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [entries, setEntries] = useState<ShipEntry[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedME, setSelectedME] = useState(0);

  const addEntry = () => {
    const catalog = SHIP_CATALOG[selectedIdx];
    setEntries(
      R.append({
        id: crypto.randomUUID(),
        ...catalog,
        count: 0,
        me: selectedME,
      }),
    );
  };

  const updateCount = (id: string, delta: number) =>
    setEntries(
      R.map((e) =>
        e.id === id ? { ...e, count: Math.max(0, e.count + delta) } : e,
      ),
    );

  const removeEntry = (id: string) =>
    setEntries(R.filter((e: ShipEntry) => e.id !== id));

  const totals = computeTotals(entries);
  const hasAny = R.any((qty) => (qty ?? 0) > 0, R.values(totals) as number[]);

  return (
    <main>
      {/* ── Add Ship ── */}
      <div>
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
        >
          {SHIP_CATALOG.map((ship, i) => (
            <option key={i} value={i}>
              {ship.name} ({ship.typeId}) — {ship.shipType}
            </option>
          ))}
        </select>
        <label>
          ME{" "}
          <select
            value={selectedME}
            onChange={(e) => setSelectedME(Number(e.target.value))}
          >
            {ME_LEVELS.map((me) => (
              <option key={me} value={me}>
                {me}%
              </option>
            ))}
          </select>
        </label>
        <button onClick={addEntry}>Add</button>
      </div>

      {/* ── Ship List ── */}
      {entries.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Ship</th>
              <th>Count</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  {entry.name} ({entry.typeId})
                </td>
                <td>{entry.count}</td>
                <td>
                  <button onClick={() => updateCount(entry.id, 1)}>+</button>
                  <button
                    onClick={() => updateCount(entry.id, -1)}
                    disabled={entry.count === 0}
                  >
                    −
                  </button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    disabled={entry.count > 0}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      {/* ── Output ── */}
      {hasAny ? (
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {COMPONENTS.filter((c) => (totals[c] ?? 0) > 0).map((component) => (
              <tr key={component}>
                <td>{component}</td>
                <td>{totals[component]!.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Add ships above to see component requirements.</p>
      )}
    </main>
  );
}
