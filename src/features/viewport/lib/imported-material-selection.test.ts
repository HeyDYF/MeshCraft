import { describe, expect, it } from "vitest";
import { resolveImportedMaterialSelection } from "./imported-material-selection";

describe("resolveImportedMaterialSelection", () => {
  it("returns the clicked imported material slot when the mesh exposes multiple materials", () => {
    expect(
      resolveImportedMaterialSelection("imported-node:0/2", 1, {
        "imported-node:0/2:material:0": {
          baseColor: "#112233",
          metalness: 0.2,
          roughness: 0.8,
          emission: 0,
          opacity: 1,
        },
        "imported-node:0/2:material:1": {
          baseColor: "#445566",
          metalness: 0.4,
          roughness: 0.6,
          emission: 0,
          opacity: 1,
        },
      }),
    ).toBe("imported-node:0/2:material:1");
  });

  it("falls back to the first available imported material slot when the clicked index is missing", () => {
    expect(
      resolveImportedMaterialSelection("imported-node:0/2", 3, {
        "imported-node:0/2:material:0": {
          baseColor: "#112233",
          metalness: 0.2,
          roughness: 0.8,
          emission: 0,
          opacity: 1,
        },
        "imported-node:0/2:material:1": {
          baseColor: "#445566",
          metalness: 0.4,
          roughness: 0.6,
          emission: 0,
          opacity: 1,
        },
      }),
    ).toBe("imported-node:0/2:material:0");
  });

  it("returns null when the imported object has no known material slots", () => {
    expect(resolveImportedMaterialSelection("imported-node:0/2", 0, {})).toBeNull();
  });
});
