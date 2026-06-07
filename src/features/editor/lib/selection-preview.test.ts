import { describe, expect, it } from "vitest";
import { resolvePreviewTargetIds } from "./selection-preview";

describe("resolvePreviewTargetIds", () => {
  it("returns the selected procedural mesh directly", () => {
    expect(resolvePreviewTargetIds("mesh-core")).toEqual(["mesh-core"]);
  });

  it("maps procedural material nodes to all bound meshes", () => {
    expect(resolvePreviewTargetIds("mat-steel")).toEqual([
      "mesh-housing",
      "mesh-vents",
      "mesh-bolts",
    ]);
    expect(resolvePreviewTargetIds("mat-carbon")).toEqual(["mesh-core"]);
  });

  it("maps imported material nodes back to all bound imported objects", () => {
    expect(
      resolvePreviewTargetIds("imported-node:0:material:0", {
        importedNodeMaterialBindings: {
          "imported-node:0": "imported-node:0:material:0",
          "imported-node:1": "imported-node:0:material:0",
          "imported-node:0:material:0": "imported-node:0:material:0",
        },
      }),
    ).toEqual(["imported-node:0", "imported-node:1"]);
  });

  it("maps imported texture nodes back to every object using the parent material", () => {
    expect(
      resolvePreviewTargetIds("imported-node:0:material:0:texture:map", {
        importedNodeMaterialBindings: {
          "imported-node:0": "imported-node:0:material:0",
          "imported-node:1": "imported-node:0:material:0",
          "imported-node:0:material:0": "imported-node:0:material:0",
        },
      }),
    ).toEqual(["imported-node:0", "imported-node:1"]);
  });

  it("returns an empty list when no preview target can be resolved", () => {
    expect(resolvePreviewTargetIds("tex-albedo")).toEqual([]);
  });
});
