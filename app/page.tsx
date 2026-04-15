"use client";

import { useState } from "react";
import * as R from "ramda";

// ── Types ─────────────────────────────────────────────────────────────────────

const SHIPS = [
  "Freighter",
  "Dreadnought",
  "Faction Dread",
  "Carrier",
  "Supercarrier",
  "Titan",
] as const;

type Ship = (typeof SHIPS)[number];
type Component = (typeof COMPONENTS)[number];

const COMPONENTS = [
  "Capital Armor Plates",
  "Capital Capacitor Battery",
  "Capital Computer System",
  "Capital Construction Parts",
  "Capital Corporate Hangar Bay",
  "Capital Drone Bay",
  "Capital Jump Drive",
  "Capital Power Generator",
  "Capital Propulsion Engine",
  "Capital Sensor Cluster",
  "Capital Shield Emitter",
  "Capital Ship Maintenance Bay",
] as const;

// ── BOM ───────────────────────────────────────────────────────────────────────
// Component quantities per ship hull class.
// Source: Eve Online SDE — verify against current patch before trusting.

const BOM: Record<Ship, Partial<Record<Component, number>>> = {
  Freighter: {
    "Capital Armor Plates": 40,
    "Capital Computer System": 40,
    "Capital Construction Parts": 40,
    "Capital Power Generator": 40,
    "Capital Propulsion Engine": 40,
  },
  Dreadnought: {
    "Capital Armor Plates": 88,
    "Capital Capacitor Battery": 72,
    "Capital Computer System": 76,
    "Capital Construction Parts": 88,
    "Capital Jump Drive": 32,
    "Capital Power Generator": 88,
    "Capital Propulsion Engine": 88,
    "Capital Sensor Cluster": 76,
    "Capital Shield Emitter": 72,
  },
  "Faction Dread": {
    "Capital Armor Plates": 80,
    "Capital Capacitor Battery": 64,
    "Capital Computer System": 68,
    "Capital Construction Parts": 80,
    "Capital Jump Drive": 32,
    "Capital Power Generator": 80,
    "Capital Propulsion Engine": 80,
    "Capital Sensor Cluster": 68,
    "Capital Shield Emitter": 64,
  },
  Carrier: {
    "Capital Armor Plates": 68,
    "Capital Capacitor Battery": 48,
    "Capital Computer System": 68,
    "Capital Construction Parts": 68,
    "Capital Corporate Hangar Bay": 50,
    "Capital Drone Bay": 50,
    "Capital Jump Drive": 32,
    "Capital Power Generator": 68,
    "Capital Propulsion Engine": 68,
    "Capital Sensor Cluster": 68,
    "Capital Shield Emitter": 48,
    "Capital Ship Maintenance Bay": 50,
  },
  Supercarrier: {
    "Capital Armor Plates": 144,
    "Capital Capacitor Battery": 96,
    "Capital Computer System": 132,
    "Capital Construction Parts": 144,
    "Capital Corporate Hangar Bay": 100,
    "Capital Drone Bay": 100,
    "Capital Jump Drive": 64,
    "Capital Power Generator": 144,
    "Capital Propulsion Engine": 144,
    "Capital Sensor Cluster": 132,
    "Capital Shield Emitter": 96,
    "Capital Ship Maintenance Bay": 100,
  },
  Titan: {
    "Capital Armor Plates": 280,
    "Capital Capacitor Battery": 200,
    "Capital Computer System": 240,
    "Capital Construction Parts": 280,
    "Capital Corporate Hangar Bay": 200,
    "Capital Drone Bay": 200,
    "Capital Jump Drive": 80,
    "Capital Power Generator": 280,
    "Capital Propulsion Engine": 280,
    "Capital Sensor Cluster": 240,
    "Capital Shield Emitter": 200,
    "Capital Ship Maintenance Bay": 200,
  },
};

// ── Ship Catalog ───────────────────────────────────────────────────────────────
// Type IDs from EVE Online SDE — verify against current patch before trusting.

type CatalogEntry = { name: string; typeId: number; shipType: Ship };

const SHIP_CATALOG: CatalogEntry[] = [
  // Freighters
  { name: "Charon", typeId: 20189, shipType: "Freighter" },
  { name: "Fenrir", typeId: 20187, shipType: "Freighter" },
  { name: "Providence", typeId: 20183, shipType: "Freighter" },
  { name: "Obelisk", typeId: 20185, shipType: "Freighter" },
  // Dreadnoughts
  { name: "Phoenix", typeId: 638, shipType: "Dreadnought" },
  { name: "Naglfar", typeId: 19720, shipType: "Dreadnought" },
  { name: "Revelation", typeId: 19722, shipType: "Dreadnought" },
  { name: "Moros", typeId: 19724, shipType: "Dreadnought" },
  // Faction Dreadnoughts
  { name: "Vehement", typeId: 52907, shipType: "Faction Dread" },
  { name: "Chemosh", typeId: 52911, shipType: "Faction Dread" },
  { name: "Caiman", typeId: 52914, shipType: "Faction Dread" },
  { name: "Zirnitra", typeId: 56201, shipType: "Faction Dread" },
  // Carriers
  { name: "Chimera", typeId: 23757, shipType: "Carrier" },
  { name: "Nidhoggur", typeId: 24483, shipType: "Carrier" },
  { name: "Archon", typeId: 23915, shipType: "Carrier" },
  { name: "Thanatos", typeId: 23911, shipType: "Carrier" },
  // Supercarriers
  { name: "Wyvern", typeId: 23919, shipType: "Supercarrier" },
  { name: "Hel", typeId: 22852, shipType: "Supercarrier" },
  { name: "Aeon", typeId: 23773, shipType: "Supercarrier" },
  { name: "Nyx", typeId: 23913, shipType: "Supercarrier" },
  // Titans
  { name: "Leviathan", typeId: 3764, shipType: "Titan" },
  { name: "Ragnarok", typeId: 11567, shipType: "Titan" },
  { name: "Avatar", typeId: 11568, shipType: "Titan" },
  { name: "Erebus", typeId: 671, shipType: "Titan" },
];

// ── Ship Entry (list state) ────────────────────────────────────────────────────

type ShipEntry = CatalogEntry & { id: string; count: number };

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

  const addEntry = () => {
    const catalog = SHIP_CATALOG[selectedIdx];
    setEntries(R.append({ id: crypto.randomUUID(), ...catalog, count: 0 }));
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
