// Generated EVE Online SDE data for the capital BOM calculator.
//
// To refresh from the latest official SDE, run: `npm run refresh-sde`
// Source: https://developers.eveonline.com/static-data
// Format: JSON Lines (`eve-online-static-data-latest-jsonl.zip`)
//
// The values below were transcribed from an earlier patch and have NOT been
// regenerated against the current SDE — re-run `npm run refresh-sde` to
// refresh against CCP's latest publish (currently SDE v3333874, 2026-05-06).

export const SHIPS = [
  "Freighter",
  "Dreadnought",
  "Faction Dread",
  "Carrier",
  "Supercarrier",
  "Titan",
] as const;

export type Ship = (typeof SHIPS)[number];

export const COMPONENTS = [
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

export type Component = (typeof COMPONENTS)[number];

export const BOM: Record<Ship, Partial<Record<Component, number>>> = {
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

export type CatalogEntry = { name: string; typeId: number; shipType: Ship };

export const SHIP_CATALOG: CatalogEntry[] = [
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
