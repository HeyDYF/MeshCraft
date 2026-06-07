import { describe, expect, it } from "vitest";
import {
  getImportedMaterialSlotOptions,
  getImportedMaterialSlotsForSelection,
} from "./imported-material-slots";

describe("getImportedMaterialSlotsForSelection", () => {
  it("returns imported material slots for the selected imported object in slot order", () => {
    expect(
      getImportedMaterialSlotsForSelection("imported-node:0/2", {
        "imported-node:0/2:material:1": {
          baseColor: "#445566",
          metalness: 0.4,
          roughness: 0.6,
          emission: 0,
          opacity: 1,
        },
        "imported-node:0/2:material:0": {
          baseColor: "#112233",
          metalness: 0.2,
          roughness: 0.8,
          emission: 0,
          opacity: 1,
        },
      }),
    ).toEqual([
      "imported-node:0/2:material:0",
      "imported-node:0/2:material:1",
    ]);
  });

  it("resolves the owning imported object when the current selection is a material or texture node", () => {
    const materialLibrary = {
      "imported-node:0/2:material:1": {
        baseColor: "#445566",
        metalness: 0.4,
        roughness: 0.6,
        emission: 0,
        opacity: 1,
      },
      "imported-node:0/2:material:0": {
        baseColor: "#112233",
        metalness: 0.2,
        roughness: 0.8,
        emission: 0,
        opacity: 1,
      },
    };

    expect(
      getImportedMaterialSlotsForSelection(
        "imported-node:0/2:material:1",
        materialLibrary,
      ),
    ).toEqual([
      "imported-node:0/2:material:0",
      "imported-node:0/2:material:1",
    ]);
    expect(
      getImportedMaterialSlotsForSelection(
        "imported-node:0/2:material:1:texture:map",
        materialLibrary,
      ),
    ).toEqual([
      "imported-node:0/2:material:0",
      "imported-node:0/2:material:1",
    ]);
  });

  it("returns an empty list for non-imported selections or unbound imported objects", () => {
    expect(getImportedMaterialSlotsForSelection("mesh-core", {})).toEqual([]);
    expect(getImportedMaterialSlotsForSelection("imported-node:0/2", {})).toEqual([]);
    expect(getImportedMaterialSlotsForSelection("imported-node:0/2:material:1", {})).toEqual(
      [],
    );
  });
});

describe("getImportedMaterialSlotOptions", () => {
  it("includes slot indices and material names from the imported scene tree", () => {
    expect(
      getImportedMaterialSlotOptions(
        "imported-node:0/2:material:1:texture:map",
        {
          "imported-node:0/2:material:1": {
            baseColor: "#445566",
            metalness: 0.4,
            roughness: 0.6,
            emission: 0,
            opacity: 1,
          },
          "imported-node:0/2:material:0": {
            baseColor: "#112233",
            metalness: 0.2,
            roughness: 0.8,
            emission: 0,
            opacity: 1,
          },
        },
        {
          id: "imported-root",
          name: "robot",
          kind: "group",
          children: [
            {
              id: "imported-group:materials",
              name: "Materials",
              kind: "group",
              children: [
                {
                  id: "imported-node:0/2:material:0",
                  name: "Paint_A",
                  kind: "material",
                },
                {
                  id: "imported-node:0/2:material:1",
                  name: "Paint_B",
                  kind: "material",
                },
              ],
            },
          ],
        },
      ),
    ).toEqual([
      {
        materialId: "imported-node:0/2:material:0",
        materialName: "Paint_A",
        slotIndex: 0,
      },
      {
        materialId: "imported-node:0/2:material:1",
        materialName: "Paint_B",
        slotIndex: 1,
      },
    ]);
  });
});
