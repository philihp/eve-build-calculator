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
  "Auto-Integrity Preservation Seal",
  "Capital Absorption Thruster Array",
  "Capital Armor Plates",
  "Capital Capacitor Battery",
  "Capital Cargo Bay",
  "Capital Clone Vat Bay",
  "Capital Computer System",
  "Capital Construction Parts",
  "Capital Core Temperature Regulator",
  "Capital Corporate Hangar Bay",
  "Capital Doomsday Weapon Mount",
  "Capital Drone Bay",
  "Capital Jump Bridge Array",
  "Capital Jump Drive",
  "Capital Launcher Hardpoint",
  "Capital Power Generator",
  "Capital Propulsion Engine",
  "Capital Radiation Conversion Unit",
  "Capital Sensor Cluster",
  "Capital Shield Emitter",
  "Capital Ship Maintenance Bay",
  "Capital Siege Array",
  "Capital Turret Hardpoint",
  "Capital Ultratidal Entropic Mounting",
  "Enhanced Neurolink Protection Cell",
  "G-O Trigger Neurolink Conduit",
  "Gravimetric-FTL Interlink Communicator",
  "Ladar-FTL Interlink Communicator",
  "Life Support Backup Unit",
  "Magnetometric-FTL Interlink Communicator",
  "Neurolink Protection Cell",
  "R-O Trigger Neurolink Conduit",
  "Radar-FTL Interlink Communicator",
  "S-R Trigger Neurolink Conduit",
  "Serpentis Modified Capital Microprocessor",
  "U-C Trigger Neurolink Conduit",
] as const;

// ── BOM ──────────────────────────────────────────────────────────────────────
// Component quantities per ship hull (keyed by ship typeID).
// Source: EVE Online SDE — verify against current patch before trusting.

const BOM: Record<number, Partial<Record<Component, number>>> = {
  // Charon (Freighter)
  20185: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 5,
    "Capital Cargo Bay": 50,
    "Capital Construction Parts": 5,
    "Capital Core Temperature Regulator": 1,
    "Capital Propulsion Engine": 5,
    "Gravimetric-FTL Interlink Communicator": 1,
    "Life Support Backup Unit": 200,
    "R-O Trigger Neurolink Conduit": 16,
  },
  // Fenrir (Freighter)
  20189: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 5,
    "Capital Cargo Bay": 35,
    "Capital Construction Parts": 5,
    "Capital Core Temperature Regulator": 1,
    "Capital Propulsion Engine": 20,
    "G-O Trigger Neurolink Conduit": 16,
    "Ladar-FTL Interlink Communicator": 1,
    "Life Support Backup Unit": 200,
  },
  // Providence (Freighter)
  20183: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 5,
    "Capital Cargo Bay": 40,
    "Capital Construction Parts": 5,
    "Capital Core Temperature Regulator": 1,
    "Capital Propulsion Engine": 15,
    "Life Support Backup Unit": 200,
    "Radar-FTL Interlink Communicator": 1,
    "U-C Trigger Neurolink Conduit": 16,
  },
  // Obelisk (Freighter)
  20187: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 5,
    "Capital Cargo Bay": 45,
    "Capital Construction Parts": 5,
    "Capital Core Temperature Regulator": 1,
    "Capital Propulsion Engine": 10,
    "Life Support Backup Unit": 200,
    "Magnetometric-FTL Interlink Communicator": 1,
    "S-R Trigger Neurolink Conduit": 16,
  },
  // Phoenix (Dreadnought)
  19726: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 2,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 4,
    "Capital Construction Parts": 2,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 2,
    "Capital Jump Drive": 2,
    "Capital Launcher Hardpoint": 15,
    "Capital Power Generator": 2,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 2,
    "Capital Shield Emitter": 4,
    "Capital Ship Maintenance Bay": 4,
    "Capital Siege Array": 15,
    "Gravimetric-FTL Interlink Communicator": 2,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 1,
    "R-O Trigger Neurolink Conduit": 16,
  },
  // Naglfar (Dreadnought)
  19722: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 3,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 3,
    "Capital Construction Parts": 2,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 2,
    "Capital Jump Drive": 2,
    "Capital Power Generator": 2,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 2,
    "Capital Shield Emitter": 3,
    "Capital Ship Maintenance Bay": 4,
    "Capital Siege Array": 15,
    "Capital Turret Hardpoint": 15,
    "G-O Trigger Neurolink Conduit": 16,
    "Ladar-FTL Interlink Communicator": 2,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 1,
  },
  // Revelation (Dreadnought)
  19720: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 4,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 2,
    "Capital Construction Parts": 2,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 2,
    "Capital Jump Drive": 2,
    "Capital Power Generator": 2,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 4,
    "Capital Shield Emitter": 2,
    "Capital Ship Maintenance Bay": 4,
    "Capital Siege Array": 15,
    "Capital Turret Hardpoint": 15,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 1,
    "Radar-FTL Interlink Communicator": 2,
    "U-C Trigger Neurolink Conduit": 16,
  },
  // Moros (Dreadnought)
  19724: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 3,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 2,
    "Capital Construction Parts": 2,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 2,
    "Capital Jump Drive": 2,
    "Capital Power Generator": 2,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 3,
    "Capital Shield Emitter": 3,
    "Capital Ship Maintenance Bay": 4,
    "Capital Siege Array": 15,
    "Capital Turret Hardpoint": 15,
    "Life Support Backup Unit": 200,
    "Magnetometric-FTL Interlink Communicator": 2,
    "Neurolink Protection Cell": 1,
    "S-R Trigger Neurolink Conduit": 16,
  },
  // Vehement (Faction Dread)
  42124: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 5,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 4,
    "Capital Construction Parts": 5,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 5,
    "Capital Jump Drive": 5,
    "Capital Power Generator": 5,
    "Capital Propulsion Engine": 5,
    "Capital Sensor Cluster": 4,
    "Capital Shield Emitter": 5,
    "Capital Ship Maintenance Bay": 5,
    "Capital Siege Array": 10,
    "Capital Turret Hardpoint": 10,
    "G-O Trigger Neurolink Conduit": 8,
    "Ladar-FTL Interlink Communicator": 2,
    "Life Support Backup Unit": 200,
    "Magnetometric-FTL Interlink Communicator": 2,
    "Neurolink Protection Cell": 1,
    "S-R Trigger Neurolink Conduit": 8,
    "Serpentis Modified Capital Microprocessor": 50,
  },
  // Chemosh (Faction Dread)
  42243: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 5,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 4,
    "Capital Construction Parts": 4,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 2,
    "Capital Jump Drive": 2,
    "Capital Power Generator": 2,
    "Capital Propulsion Engine": 5,
    "Capital Sensor Cluster": 4,
    "Capital Shield Emitter": 5,
    "Capital Ship Maintenance Bay": 5,
    "Capital Siege Array": 20,
    "Capital Turret Hardpoint": 20,
    "G-O Trigger Neurolink Conduit": 8,
    "Ladar-FTL Interlink Communicator": 2,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 1,
    "Radar-FTL Interlink Communicator": 2,
    "U-C Trigger Neurolink Conduit": 8,
  },
  // Caiman (Faction Dread)
  45647: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 5,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 4,
    "Capital Construction Parts": 4,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 2,
    "Capital Drone Bay": 20,
    "Capital Jump Drive": 2,
    "Capital Launcher Hardpoint": 20,
    "Capital Power Generator": 2,
    "Capital Propulsion Engine": 5,
    "Capital Sensor Cluster": 4,
    "Capital Shield Emitter": 5,
    "Capital Ship Maintenance Bay": 5,
    "Capital Siege Array": 20,
    "Gravimetric-FTL Interlink Communicator": 2,
    "Life Support Backup Unit": 200,
    "Magnetometric-FTL Interlink Communicator": 2,
    "Neurolink Protection Cell": 1,
    "R-O Trigger Neurolink Conduit": 8,
    "S-R Trigger Neurolink Conduit": 8,
  },
  // Zirnitra (Faction Dread)
  52907: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Absorption Thruster Array": 3,
    "Capital Armor Plates": 5,
    "Capital Capacitor Battery": 2,
    "Capital Computer System": 4,
    "Capital Construction Parts": 2,
    "Capital Core Temperature Regulator": 2,
    "Capital Corporate Hangar Bay": 2,
    "Capital Jump Drive": 2,
    "Capital Power Generator": 2,
    "Capital Propulsion Engine": 5,
    "Capital Radiation Conversion Unit": 6,
    "Capital Sensor Cluster": 4,
    "Capital Shield Emitter": 5,
    "Capital Ship Maintenance Bay": 5,
    "Capital Siege Array": 20,
    "Capital Ultratidal Entropic Mounting": 9,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 2,
  },
  // Chimera (Carrier)
  23915: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 3,
    "Capital Capacitor Battery": 3,
    "Capital Computer System": 4,
    "Capital Construction Parts": 4,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 3,
    "Capital Drone Bay": 12,
    "Capital Jump Drive": 4,
    "Capital Power Generator": 3,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 3,
    "Capital Shield Emitter": 6,
    "Capital Ship Maintenance Bay": 6,
    "Gravimetric-FTL Interlink Communicator": 1,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 1,
    "R-O Trigger Neurolink Conduit": 12,
  },
  // Nidhoggur (Carrier)
  24483: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 3,
    "Capital Capacitor Battery": 3,
    "Capital Computer System": 4,
    "Capital Construction Parts": 4,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 3,
    "Capital Drone Bay": 12,
    "Capital Jump Drive": 4,
    "Capital Power Generator": 3,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 3,
    "Capital Shield Emitter": 6,
    "Capital Ship Maintenance Bay": 6,
    "G-O Trigger Neurolink Conduit": 12,
    "Ladar-FTL Interlink Communicator": 1,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 1,
  },
  // Archon (Carrier)
  23757: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 6,
    "Capital Capacitor Battery": 3,
    "Capital Computer System": 3,
    "Capital Construction Parts": 4,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 3,
    "Capital Drone Bay": 12,
    "Capital Jump Drive": 4,
    "Capital Power Generator": 3,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 4,
    "Capital Shield Emitter": 3,
    "Capital Ship Maintenance Bay": 6,
    "Life Support Backup Unit": 200,
    "Neurolink Protection Cell": 1,
    "Radar-FTL Interlink Communicator": 1,
    "U-C Trigger Neurolink Conduit": 12,
  },
  // Thanatos (Carrier)
  23911: {
    "Auto-Integrity Preservation Seal": 400,
    "Capital Armor Plates": 6,
    "Capital Capacitor Battery": 3,
    "Capital Computer System": 3,
    "Capital Construction Parts": 4,
    "Capital Core Temperature Regulator": 1,
    "Capital Corporate Hangar Bay": 3,
    "Capital Drone Bay": 12,
    "Capital Jump Drive": 4,
    "Capital Power Generator": 3,
    "Capital Propulsion Engine": 4,
    "Capital Sensor Cluster": 4,
    "Capital Shield Emitter": 3,
    "Capital Ship Maintenance Bay": 6,
    "Life Support Backup Unit": 200,
    "Magnetometric-FTL Interlink Communicator": 1,
    "Neurolink Protection Cell": 1,
    "S-R Trigger Neurolink Conduit": 12,
  },
  // Wyvern (Supercarrier)
  23917: {
    "Auto-Integrity Preservation Seal": 800,
    "Capital Armor Plates": 25,
    "Capital Capacitor Battery": 75,
    "Capital Computer System": 40,
    "Capital Construction Parts": 50,
    "Capital Core Temperature Regulator": 10,
    "Capital Corporate Hangar Bay": 50,
    "Capital Drone Bay": 250,
    "Capital Jump Drive": 100,
    "Capital Power Generator": 125,
    "Capital Propulsion Engine": 50,
    "Capital Sensor Cluster": 10,
    "Capital Shield Emitter": 125,
    "Capital Ship Maintenance Bay": 100,
    "Enhanced Neurolink Protection Cell": 1,
    "Gravimetric-FTL Interlink Communicator": 125,
    "Life Support Backup Unit": 400,
    "R-O Trigger Neurolink Conduit": 64,
  },
  // Hel (Supercarrier)
  22852: {
    "Auto-Integrity Preservation Seal": 800,
    "Capital Armor Plates": 50,
    "Capital Capacitor Battery": 150,
    "Capital Computer System": 10,
    "Capital Construction Parts": 50,
    "Capital Core Temperature Regulator": 10,
    "Capital Corporate Hangar Bay": 50,
    "Capital Drone Bay": 250,
    "Capital Jump Drive": 100,
    "Capital Power Generator": 50,
    "Capital Propulsion Engine": 50,
    "Capital Sensor Cluster": 40,
    "Capital Shield Emitter": 100,
    "Capital Ship Maintenance Bay": 100,
    "Enhanced Neurolink Protection Cell": 1,
    "G-O Trigger Neurolink Conduit": 64,
    "Ladar-FTL Interlink Communicator": 125,
    "Life Support Backup Unit": 400,
  },
  // Aeon (Supercarrier)
  23919: {
    "Auto-Integrity Preservation Seal": 800,
    "Capital Armor Plates": 125,
    "Capital Capacitor Battery": 100,
    "Capital Computer System": 10,
    "Capital Construction Parts": 50,
    "Capital Core Temperature Regulator": 10,
    "Capital Corporate Hangar Bay": 50,
    "Capital Drone Bay": 250,
    "Capital Jump Drive": 100,
    "Capital Power Generator": 100,
    "Capital Propulsion Engine": 50,
    "Capital Sensor Cluster": 40,
    "Capital Shield Emitter": 25,
    "Capital Ship Maintenance Bay": 100,
    "Enhanced Neurolink Protection Cell": 1,
    "Life Support Backup Unit": 400,
    "Radar-FTL Interlink Communicator": 125,
    "U-C Trigger Neurolink Conduit": 64,
  },
  // Nyx (Supercarrier)
  23913: {
    "Auto-Integrity Preservation Seal": 800,
    "Capital Armor Plates": 50,
    "Capital Capacitor Battery": 100,
    "Capital Computer System": 40,
    "Capital Construction Parts": 50,
    "Capital Core Temperature Regulator": 10,
    "Capital Corporate Hangar Bay": 50,
    "Capital Drone Bay": 250,
    "Capital Jump Drive": 100,
    "Capital Power Generator": 100,
    "Capital Propulsion Engine": 50,
    "Capital Sensor Cluster": 10,
    "Capital Shield Emitter": 100,
    "Capital Ship Maintenance Bay": 100,
    "Enhanced Neurolink Protection Cell": 1,
    "Life Support Backup Unit": 400,
    "Magnetometric-FTL Interlink Communicator": 125,
    "S-R Trigger Neurolink Conduit": 64,
  },
  // Leviathan (Titan)
  3764: {
    "Auto-Integrity Preservation Seal": 3200,
    "Capital Armor Plates": 150,
    "Capital Capacitor Battery": 300,
    "Capital Clone Vat Bay": 500,
    "Capital Computer System": 100,
    "Capital Construction Parts": 200,
    "Capital Core Temperature Regulator": 25,
    "Capital Corporate Hangar Bay": 500,
    "Capital Doomsday Weapon Mount": 500,
    "Capital Jump Bridge Array": 500,
    "Capital Jump Drive": 300,
    "Capital Launcher Hardpoint": 400,
    "Capital Power Generator": 400,
    "Capital Propulsion Engine": 80,
    "Capital Sensor Cluster": 200,
    "Capital Shield Emitter": 300,
    "Capital Ship Maintenance Bay": 500,
    "Enhanced Neurolink Protection Cell": 1,
    "Gravimetric-FTL Interlink Communicator": 250,
    "Life Support Backup Unit": 1600,
    "R-O Trigger Neurolink Conduit": 192,
  },
  // Ragnarok (Titan)
  23773: {
    "Auto-Integrity Preservation Seal": 3200,
    "Capital Armor Plates": 300,
    "Capital Capacitor Battery": 300,
    "Capital Clone Vat Bay": 500,
    "Capital Computer System": 200,
    "Capital Construction Parts": 200,
    "Capital Core Temperature Regulator": 25,
    "Capital Corporate Hangar Bay": 500,
    "Capital Doomsday Weapon Mount": 500,
    "Capital Jump Bridge Array": 500,
    "Capital Jump Drive": 300,
    "Capital Power Generator": 400,
    "Capital Propulsion Engine": 80,
    "Capital Sensor Cluster": 100,
    "Capital Shield Emitter": 150,
    "Capital Ship Maintenance Bay": 500,
    "Capital Turret Hardpoint": 400,
    "Enhanced Neurolink Protection Cell": 1,
    "G-O Trigger Neurolink Conduit": 192,
    "Ladar-FTL Interlink Communicator": 250,
    "Life Support Backup Unit": 1600,
  },
  // Avatar (Titan)
  11567: {
    "Auto-Integrity Preservation Seal": 3200,
    "Capital Armor Plates": 400,
    "Capital Capacitor Battery": 400,
    "Capital Clone Vat Bay": 500,
    "Capital Computer System": 200,
    "Capital Construction Parts": 200,
    "Capital Core Temperature Regulator": 25,
    "Capital Corporate Hangar Bay": 500,
    "Capital Doomsday Weapon Mount": 500,
    "Capital Jump Bridge Array": 500,
    "Capital Jump Drive": 300,
    "Capital Power Generator": 300,
    "Capital Propulsion Engine": 80,
    "Capital Sensor Cluster": 100,
    "Capital Shield Emitter": 50,
    "Capital Ship Maintenance Bay": 500,
    "Capital Turret Hardpoint": 400,
    "Enhanced Neurolink Protection Cell": 1,
    "Life Support Backup Unit": 1600,
    "Radar-FTL Interlink Communicator": 250,
    "U-C Trigger Neurolink Conduit": 192,
  },
  // Erebus (Titan)
  671: {
    "Auto-Integrity Preservation Seal": 3200,
    "Capital Armor Plates": 300,
    "Capital Capacitor Battery": 400,
    "Capital Clone Vat Bay": 500,
    "Capital Computer System": 100,
    "Capital Construction Parts": 200,
    "Capital Core Temperature Regulator": 25,
    "Capital Corporate Hangar Bay": 500,
    "Capital Doomsday Weapon Mount": 500,
    "Capital Jump Bridge Array": 500,
    "Capital Jump Drive": 300,
    "Capital Power Generator": 300,
    "Capital Propulsion Engine": 80,
    "Capital Sensor Cluster": 200,
    "Capital Shield Emitter": 150,
    "Capital Ship Maintenance Bay": 500,
    "Capital Turret Hardpoint": 400,
    "Enhanced Neurolink Protection Cell": 1,
    "Life Support Backup Unit": 1600,
    "Magnetometric-FTL Interlink Communicator": 250,
    "S-R Trigger Neurolink Conduit": 192,
  },
};

// ── Ship Catalog ───────────────────────────────────────────────────────────────
// Type IDs from EVE Online SDE — verify against current patch before trusting.

type CatalogEntry = { name: string; typeId: number; shipType: Ship };

const SHIP_CATALOG: CatalogEntry[] = [
  // Freighters
  { name: "Charon", typeId: 20185, shipType: "Freighter" },
  { name: "Fenrir", typeId: 20189, shipType: "Freighter" },
  { name: "Providence", typeId: 20183, shipType: "Freighter" },
  { name: "Obelisk", typeId: 20187, shipType: "Freighter" },
  // Dreadnoughts
  { name: "Phoenix", typeId: 19726, shipType: "Dreadnought" },
  { name: "Naglfar", typeId: 19722, shipType: "Dreadnought" },
  { name: "Revelation", typeId: 19720, shipType: "Dreadnought" },
  { name: "Moros", typeId: 19724, shipType: "Dreadnought" },
  // Faction Dreadnoughts
  { name: "Vehement", typeId: 42124, shipType: "Faction Dread" },
  { name: "Chemosh", typeId: 42243, shipType: "Faction Dread" },
  { name: "Caiman", typeId: 45647, shipType: "Faction Dread" },
  { name: "Zirnitra", typeId: 52907, shipType: "Faction Dread" },
  // Carriers
  { name: "Chimera", typeId: 23915, shipType: "Carrier" },
  { name: "Nidhoggur", typeId: 24483, shipType: "Carrier" },
  { name: "Archon", typeId: 23757, shipType: "Carrier" },
  { name: "Thanatos", typeId: 23911, shipType: "Carrier" },
  // Supercarriers
  { name: "Wyvern", typeId: 23917, shipType: "Supercarrier" },
  { name: "Hel", typeId: 22852, shipType: "Supercarrier" },
  { name: "Aeon", typeId: 23919, shipType: "Supercarrier" },
  { name: "Nyx", typeId: 23913, shipType: "Supercarrier" },
  // Titans
  { name: "Leviathan", typeId: 3764, shipType: "Titan" },
  { name: "Ragnarok", typeId: 23773, shipType: "Titan" },
  { name: "Avatar", typeId: 11567, shipType: "Titan" },
  { name: "Erebus", typeId: 671, shipType: "Titan" },
];

// ── Ship Entry (list state) ────────────────────────────────────────────────────

type ShipEntry = CatalogEntry & { id: string; count: number; me: number };

const ME_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// ── Pure computation ───────────────────────────────────────────────────────────

const computeTotals = (
  entries: ShipEntry[],
): Partial<Record<Component, number>> => {
  type Pair = [Component, number];
  const pairs: Pair[] = entries.flatMap((e) =>
    (R.toPairs(BOM[e.typeId] ?? {}) as Pair[]).map(
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
