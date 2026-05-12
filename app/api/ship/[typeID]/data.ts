export type ShipBlueprintMaterial = { typeID: number; name: string; quantity: number };

export type ShipBlueprintActivity = "manufacturing" | "reaction";

export type ShipBlueprint = {
  typeID: number;
  name: string;
  shipType: string;
  blueprint: {
    typeID: number;
    name: string;
    activity: ShipBlueprintActivity;
    time: number;
    materials: ShipBlueprintMaterial[];
    products: ShipBlueprintMaterial[];
  };
};

// Generated from EVE Online SDE (eve-online-static-data-3333874-yaml).
// Tiebreak rule: if multiple blueprints produce the same hull, the one with the
// highest blueprint typeID wins. (No tiebreaks were needed for these 24 hulls.)

export const SHIP_BLUEPRINTS: readonly ShipBlueprint[] = [
  {
    "typeID": 20185,
    "name": "Charon",
    "shipType": "Freighter",
    "blueprint": {
      "typeID": 20186,
      "name": "Charon Blueprint",
      "activity": "manufacturing",
      "time": 1500000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 5
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21027,
          "name": "Capital Cargo Bay",
          "quantity": 50
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 5
        },
        {
          "typeID": 57471,
          "name": "R-O Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57475,
          "name": "Gravimetric-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 20185,
          "name": "Charon",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 20189,
    "name": "Fenrir",
    "shipType": "Freighter",
    "blueprint": {
      "typeID": 20190,
      "name": "Fenrir Blueprint",
      "activity": "manufacturing",
      "time": 1500000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 20
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21027,
          "name": "Capital Cargo Bay",
          "quantity": 35
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 5
        },
        {
          "typeID": 57473,
          "name": "G-O Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57477,
          "name": "Ladar-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 20189,
          "name": "Fenrir",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 20183,
    "name": "Providence",
    "shipType": "Freighter",
    "blueprint": {
      "typeID": 20184,
      "name": "Providence Blueprint",
      "activity": "manufacturing",
      "time": 1500000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 15
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21027,
          "name": "Capital Cargo Bay",
          "quantity": 40
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 5
        },
        {
          "typeID": 57470,
          "name": "U-C Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57474,
          "name": "Radar-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 20183,
          "name": "Providence",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 20187,
    "name": "Obelisk",
    "shipType": "Freighter",
    "blueprint": {
      "typeID": 20188,
      "name": "Obelisk Blueprint",
      "activity": "manufacturing",
      "time": 1500000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 10
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21027,
          "name": "Capital Cargo Bay",
          "quantity": 45
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 5
        },
        {
          "typeID": 57472,
          "name": "S-R Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57476,
          "name": "Magnetometric-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 20187,
          "name": "Obelisk",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 19726,
    "name": "Phoenix",
    "shipType": "Dreadnought",
    "blueprint": {
      "typeID": 19727,
      "name": "Phoenix Blueprint",
      "activity": "manufacturing",
      "time": 2000000,
      "materials": [
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 2
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 2
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 2
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 2
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 2
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 2
        },
        {
          "typeID": 57475,
          "name": "Gravimetric-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 4
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 4
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 4
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 15
        },
        {
          "typeID": 21041,
          "name": "Capital Launcher Hardpoint",
          "quantity": 15
        },
        {
          "typeID": 57471,
          "name": "R-O Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 19726,
          "name": "Phoenix",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 19722,
    "name": "Naglfar",
    "shipType": "Dreadnought",
    "blueprint": {
      "typeID": 19723,
      "name": "Naglfar Blueprint",
      "activity": "manufacturing",
      "time": 2000000,
      "materials": [
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 2
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 2
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 2
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 2
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 2
        },
        {
          "typeID": 57477,
          "name": "Ladar-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 3
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 3
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 3
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 4
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 15
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 15
        },
        {
          "typeID": 57473,
          "name": "G-O Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 19722,
          "name": "Naglfar",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 19720,
    "name": "Revelation",
    "shipType": "Dreadnought",
    "blueprint": {
      "typeID": 19721,
      "name": "Revelation Blueprint",
      "activity": "manufacturing",
      "time": 2000000,
      "materials": [
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 2
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 2
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 2
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 2
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 2
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 2
        },
        {
          "typeID": 57474,
          "name": "Radar-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 4
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 4
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 4
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 15
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 15
        },
        {
          "typeID": 57470,
          "name": "U-C Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 19720,
          "name": "Revelation",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 19724,
    "name": "Moros",
    "shipType": "Dreadnought",
    "blueprint": {
      "typeID": 19725,
      "name": "Moros Blueprint",
      "activity": "manufacturing",
      "time": 2000000,
      "materials": [
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 2
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 2
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 2
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 2
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 2
        },
        {
          "typeID": 57476,
          "name": "Magnetometric-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 3
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 3
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 3
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 4
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 15
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 15
        },
        {
          "typeID": 57472,
          "name": "S-R Trigger Neurolink Conduit",
          "quantity": 16
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 19724,
          "name": "Moros",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 42124,
    "name": "Vehement",
    "shipType": "Faction Dread",
    "blueprint": {
      "typeID": 42136,
      "name": "Vehement Blueprint",
      "activity": "manufacturing",
      "time": 2600000,
      "materials": [
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 57476,
          "name": "Magnetometric-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 57477,
          "name": "Ladar-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 4
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 4
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 5
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 5
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 5
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 5
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 5
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 5
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 5
        },
        {
          "typeID": 57472,
          "name": "S-R Trigger Neurolink Conduit",
          "quantity": 8
        },
        {
          "typeID": 57473,
          "name": "G-O Trigger Neurolink Conduit",
          "quantity": 8
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 10
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 10
        },
        {
          "typeID": 42226,
          "name": "Serpentis Modified Capital Microprocessor",
          "quantity": 50
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 42124,
          "name": "Vehement",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 42243,
    "name": "Chemosh",
    "shipType": "Faction Dread",
    "blueprint": {
      "typeID": 45044,
      "name": "Chemosh Blueprint",
      "activity": "manufacturing",
      "time": 2400000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 5
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 20
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 4
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 2
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 5
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 2
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 4
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 4
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 20
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 5
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 2
        },
        {
          "typeID": 57470,
          "name": "U-C Trigger Neurolink Conduit",
          "quantity": 8
        },
        {
          "typeID": 57473,
          "name": "G-O Trigger Neurolink Conduit",
          "quantity": 8
        },
        {
          "typeID": 57474,
          "name": "Radar-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 57477,
          "name": "Ladar-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 42243,
          "name": "Chemosh",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 45647,
    "name": "Caiman",
    "shipType": "Faction Dread",
    "blueprint": {
      "typeID": 45646,
      "name": "Caiman Blueprint",
      "activity": "manufacturing",
      "time": 2000000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 5
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 4
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 2
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 5
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 2
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 20
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 4
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 4
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 20
        },
        {
          "typeID": 21041,
          "name": "Capital Launcher Hardpoint",
          "quantity": 20
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 5
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 2
        },
        {
          "typeID": 57471,
          "name": "R-O Trigger Neurolink Conduit",
          "quantity": 8
        },
        {
          "typeID": 57472,
          "name": "S-R Trigger Neurolink Conduit",
          "quantity": 8
        },
        {
          "typeID": 57475,
          "name": "Gravimetric-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 57476,
          "name": "Magnetometric-FTL Interlink Communicator",
          "quantity": 2
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 45647,
          "name": "Caiman",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 52907,
    "name": "Zirnitra",
    "shipType": "Faction Dread",
    "blueprint": {
      "typeID": 53029,
      "name": "Zirnitra Blueprint",
      "activity": "manufacturing",
      "time": 2000000,
      "materials": [
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 2
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 2
        },
        {
          "typeID": 53037,
          "name": "Capital Absorption Thruster Array",
          "quantity": 3
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 2
        },
        {
          "typeID": 53036,
          "name": "Capital Radiation Conversion Unit",
          "quantity": 6
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 2
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 2
        },
        {
          "typeID": 53035,
          "name": "Capital Ultratidal Entropic Mounting",
          "quantity": 9
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 5
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 2
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 2
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 4
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 5
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 4
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 5
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 5
        },
        {
          "typeID": 21039,
          "name": "Capital Siege Array",
          "quantity": 20
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 52907,
          "name": "Zirnitra",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 23915,
    "name": "Chimera",
    "shipType": "Carrier",
    "blueprint": {
      "typeID": 23916,
      "name": "Chimera Blueprint",
      "activity": "manufacturing",
      "time": 1800000,
      "materials": [
        {
          "typeID": 57475,
          "name": "Gravimetric-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 3
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 3
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 3
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 3
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 3
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 4
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 4
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 4
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 6
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 6
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 12
        },
        {
          "typeID": 57471,
          "name": "R-O Trigger Neurolink Conduit",
          "quantity": 12
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 23915,
          "name": "Chimera",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 24483,
    "name": "Nidhoggur",
    "shipType": "Carrier",
    "blueprint": {
      "typeID": 24484,
      "name": "Nidhoggur Blueprint",
      "activity": "manufacturing",
      "time": 1800000,
      "materials": [
        {
          "typeID": 57477,
          "name": "Ladar-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 3
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 3
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 3
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 3
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 3
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 4
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 4
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 4
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 6
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 6
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 12
        },
        {
          "typeID": 57473,
          "name": "G-O Trigger Neurolink Conduit",
          "quantity": 12
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 24483,
          "name": "Nidhoggur",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 23757,
    "name": "Archon",
    "shipType": "Carrier",
    "blueprint": {
      "typeID": 23758,
      "name": "Archon Blueprint",
      "activity": "manufacturing",
      "time": 1800000,
      "materials": [
        {
          "typeID": 57474,
          "name": "Radar-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 3
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 3
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 3
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 3
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 3
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 4
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 4
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 4
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 6
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 6
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 12
        },
        {
          "typeID": 57470,
          "name": "U-C Trigger Neurolink Conduit",
          "quantity": 12
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 23757,
          "name": "Archon",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 23911,
    "name": "Thanatos",
    "shipType": "Carrier",
    "blueprint": {
      "typeID": 23912,
      "name": "Thanatos Blueprint",
      "activity": "manufacturing",
      "time": 1800000,
      "materials": [
        {
          "typeID": 57476,
          "name": "Magnetometric-FTL Interlink Communicator",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 1
        },
        {
          "typeID": 57488,
          "name": "Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 3
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 3
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 3
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 3
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 3
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 4
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 4
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 4
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 4
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 6
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 6
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 12
        },
        {
          "typeID": 57472,
          "name": "S-R Trigger Neurolink Conduit",
          "quantity": 12
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 200
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 400
        }
      ],
      "products": [
        {
          "typeID": 23911,
          "name": "Thanatos",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 23917,
    "name": "Wyvern",
    "shipType": "Supercarrier",
    "blueprint": {
      "typeID": 23918,
      "name": "Wyvern Blueprint",
      "activity": "manufacturing",
      "time": 6000000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 50
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 10
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 25
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 75
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 125
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 125
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 100
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 250
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 40
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 50
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 100
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 50
        },
        {
          "typeID": 57471,
          "name": "R-O Trigger Neurolink Conduit",
          "quantity": 64
        },
        {
          "typeID": 57475,
          "name": "Gravimetric-FTL Interlink Communicator",
          "quantity": 125
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 800
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 400
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 10
        },
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 23917,
          "name": "Wyvern",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 22852,
    "name": "Hel",
    "shipType": "Supercarrier",
    "blueprint": {
      "typeID": 22853,
      "name": "Hel Blueprint",
      "activity": "manufacturing",
      "time": 6000000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 50
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 40
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 50
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 150
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 50
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 100
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 100
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 250
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 10
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 50
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 100
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 50
        },
        {
          "typeID": 57473,
          "name": "G-O Trigger Neurolink Conduit",
          "quantity": 64
        },
        {
          "typeID": 57477,
          "name": "Ladar-FTL Interlink Communicator",
          "quantity": 125
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 800
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 400
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 10
        },
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 22852,
          "name": "Hel",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 23919,
    "name": "Aeon",
    "shipType": "Supercarrier",
    "blueprint": {
      "typeID": 23920,
      "name": "Aeon Blueprint",
      "activity": "manufacturing",
      "time": 6000000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 50
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 40
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 125
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 100
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 100
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 25
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 100
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 250
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 10
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 50
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 100
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 50
        },
        {
          "typeID": 57470,
          "name": "U-C Trigger Neurolink Conduit",
          "quantity": 64
        },
        {
          "typeID": 57474,
          "name": "Radar-FTL Interlink Communicator",
          "quantity": 125
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 800
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 400
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 10
        },
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 23919,
          "name": "Aeon",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 23913,
    "name": "Nyx",
    "shipType": "Supercarrier",
    "blueprint": {
      "typeID": 23914,
      "name": "Nyx Blueprint",
      "activity": "manufacturing",
      "time": 6000000,
      "materials": [
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 50
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 10
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 50
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 100
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 100
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 100
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 100
        },
        {
          "typeID": 21029,
          "name": "Capital Drone Bay",
          "quantity": 250
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 40
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 50
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 100
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 50
        },
        {
          "typeID": 57472,
          "name": "S-R Trigger Neurolink Conduit",
          "quantity": 64
        },
        {
          "typeID": 57476,
          "name": "Magnetometric-FTL Interlink Communicator",
          "quantity": 125
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 800
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 400
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 10
        },
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        }
      ],
      "products": [
        {
          "typeID": 23913,
          "name": "Nyx",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 3764,
    "name": "Leviathan",
    "shipType": "Titan",
    "blueprint": {
      "typeID": 3765,
      "name": "Leviathan Blueprint",
      "activity": "manufacturing",
      "time": 9000000,
      "materials": [
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 25
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 80
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 100
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 150
        },
        {
          "typeID": 57471,
          "name": "R-O Trigger Neurolink Conduit",
          "quantity": 192
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 200
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 200
        },
        {
          "typeID": 57475,
          "name": "Gravimetric-FTL Interlink Communicator",
          "quantity": 250
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 300
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 300
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 300
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 400
        },
        {
          "typeID": 21041,
          "name": "Capital Launcher Hardpoint",
          "quantity": 400
        },
        {
          "typeID": 24545,
          "name": "Capital Jump Bridge Array",
          "quantity": 500
        },
        {
          "typeID": 24547,
          "name": "Capital Clone Vat Bay",
          "quantity": 500
        },
        {
          "typeID": 24556,
          "name": "Capital Doomsday Weapon Mount",
          "quantity": 500
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 500
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 500
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 1600
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 3200
        }
      ],
      "products": [
        {
          "typeID": 3764,
          "name": "Leviathan",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 23773,
    "name": "Ragnarok",
    "shipType": "Titan",
    "blueprint": {
      "typeID": 23774,
      "name": "Ragnarok Blueprint",
      "activity": "manufacturing",
      "time": 9000000,
      "materials": [
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 25
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 80
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 100
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 150
        },
        {
          "typeID": 57473,
          "name": "G-O Trigger Neurolink Conduit",
          "quantity": 192
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 200
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 200
        },
        {
          "typeID": 57477,
          "name": "Ladar-FTL Interlink Communicator",
          "quantity": 250
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 300
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 300
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 300
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 400
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 400
        },
        {
          "typeID": 24545,
          "name": "Capital Jump Bridge Array",
          "quantity": 500
        },
        {
          "typeID": 24547,
          "name": "Capital Clone Vat Bay",
          "quantity": 500
        },
        {
          "typeID": 24556,
          "name": "Capital Doomsday Weapon Mount",
          "quantity": 500
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 500
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 500
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 1600
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 3200
        }
      ],
      "products": [
        {
          "typeID": 23773,
          "name": "Ragnarok",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 11567,
    "name": "Avatar",
    "shipType": "Titan",
    "blueprint": {
      "typeID": 11568,
      "name": "Avatar Blueprint",
      "activity": "manufacturing",
      "time": 9000000,
      "materials": [
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 25
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 50
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 80
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 100
        },
        {
          "typeID": 57470,
          "name": "U-C Trigger Neurolink Conduit",
          "quantity": 192
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 200
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 200
        },
        {
          "typeID": 57474,
          "name": "Radar-FTL Interlink Communicator",
          "quantity": 250
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 300
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 300
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 400
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 400
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 400
        },
        {
          "typeID": 24545,
          "name": "Capital Jump Bridge Array",
          "quantity": 500
        },
        {
          "typeID": 24547,
          "name": "Capital Clone Vat Bay",
          "quantity": 500
        },
        {
          "typeID": 24556,
          "name": "Capital Doomsday Weapon Mount",
          "quantity": 500
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 500
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 500
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 1600
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 3200
        }
      ],
      "products": [
        {
          "typeID": 11567,
          "name": "Avatar",
          "quantity": 1
        }
      ]
    }
  },
  {
    "typeID": 671,
    "name": "Erebus",
    "shipType": "Titan",
    "blueprint": {
      "typeID": 1002,
      "name": "Erebus Blueprint",
      "activity": "manufacturing",
      "time": 9000000,
      "materials": [
        {
          "typeID": 57489,
          "name": "Enhanced Neurolink Protection Cell",
          "quantity": 1
        },
        {
          "typeID": 57487,
          "name": "Capital Core Temperature Regulator",
          "quantity": 25
        },
        {
          "typeID": 21009,
          "name": "Capital Propulsion Engine",
          "quantity": 80
        },
        {
          "typeID": 21035,
          "name": "Capital Computer System",
          "quantity": 100
        },
        {
          "typeID": 21023,
          "name": "Capital Shield Emitter",
          "quantity": 150
        },
        {
          "typeID": 57472,
          "name": "S-R Trigger Neurolink Conduit",
          "quantity": 192
        },
        {
          "typeID": 21013,
          "name": "Capital Sensor Cluster",
          "quantity": 200
        },
        {
          "typeID": 21037,
          "name": "Capital Construction Parts",
          "quantity": 200
        },
        {
          "typeID": 57476,
          "name": "Magnetometric-FTL Interlink Communicator",
          "quantity": 250
        },
        {
          "typeID": 21017,
          "name": "Capital Armor Plates",
          "quantity": 300
        },
        {
          "typeID": 21021,
          "name": "Capital Power Generator",
          "quantity": 300
        },
        {
          "typeID": 21025,
          "name": "Capital Jump Drive",
          "quantity": 300
        },
        {
          "typeID": 21011,
          "name": "Capital Turret Hardpoint",
          "quantity": 400
        },
        {
          "typeID": 21019,
          "name": "Capital Capacitor Battery",
          "quantity": 400
        },
        {
          "typeID": 24545,
          "name": "Capital Jump Bridge Array",
          "quantity": 500
        },
        {
          "typeID": 24547,
          "name": "Capital Clone Vat Bay",
          "quantity": 500
        },
        {
          "typeID": 24556,
          "name": "Capital Doomsday Weapon Mount",
          "quantity": 500
        },
        {
          "typeID": 24558,
          "name": "Capital Ship Maintenance Bay",
          "quantity": 500
        },
        {
          "typeID": 24560,
          "name": "Capital Corporate Hangar Bay",
          "quantity": 500
        },
        {
          "typeID": 57486,
          "name": "Life Support Backup Unit",
          "quantity": 1600
        },
        {
          "typeID": 57478,
          "name": "Auto-Integrity Preservation Seal",
          "quantity": 3200
        }
      ],
      "products": [
        {
          "typeID": 671,
          "name": "Erebus",
          "quantity": 1
        }
      ]
    }
  }
];

export const BLUEPRINT_BY_TYPE_ID: Record<number, ShipBlueprint> = Object.fromEntries(
  SHIP_BLUEPRINTS.map((b) => [b.typeID, b]),
);
