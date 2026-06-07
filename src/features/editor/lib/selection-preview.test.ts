import { describe, expect, it } from "vitest";
import { resolvePreviewTargetId } from "./selection-preview";

describe("resolvePreviewTargetId", () => {
  it("returns the selected procedural mesh directly", () => {
    expect(resolvePreviewTargetId("mesh-core")).toBe("mesh-core");
  });

  it("maps procedural material nodes to a representative bound mesh", () => {
    expect(resolvePreviewTargetId("mat-steel")).toBe("mesh-housing");
    expect(resolvePreviewTargetId("mat-carbon")).toBe("mesh-core");
  });

  it("maps imported material nodes back to the first bound imported object", () => {
    expect(
      resolvePreviewTargetId("imported-node:0:material:0", {
        importedNodeMaterialBindings: {
          "imported-node:0": "imported-node:0:material:0",
          "imported-node:1": "imported-node:1:material:0",
          "imported-node:0:material:0": "imported-node:0:material:0",
        },
      }),
    ).toBe("imported-node:0");
  });

  it("maps imported texture nodes back to the object using the parent material", () => {
    expect(
      resolvePreviewTargetId("imported-node:0:material:0:texture:map", {
        importedNodeMaterialBindings: {
          "imported-node:0": "imported-node:0:material:0",
          "imported-node:0:material:0": "imported-node:0:material:0",
        },
      }),
    ).toBe("imported-node:0");
  });

  it("returns null when no preview target can be resolved", () => {
    expect(resolvePreviewTargetId("tex-albedo")).toBeNull();
  });
});
