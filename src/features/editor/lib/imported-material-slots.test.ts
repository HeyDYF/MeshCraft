import { describe, expect, it } from "vitest";
import { getImportedMaterialSlotsForSelection } from "./imported-material-slots";

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
