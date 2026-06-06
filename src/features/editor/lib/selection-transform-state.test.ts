import { describe, expect, it } from "vitest";
import type { TransformState } from "../types";
import {
  resolveSelectionTransform,
  updateSelectionTransformMaps,
} from "./selection-transform-state";

const proceduralTransforms: Record<string, TransformState> = {
  "mesh-core": {
    position: { x: 0, y: 0.45, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
};

const importedTransforms: Record<string, TransformState> = {
  "imported-mesh-a": {
    position: { x: 4, y: 5, z: 6 },
    rotation: { x: 0.1, y: 0.2, z: 0.3 },
    scale: { x: 2, y: 2, z: 2 },
  },
};

const fallback: TransformState = {
  position: { x: 9, y: 9, z: 9 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

describe("resolveSelectionTransform", () => {
  it("prefers procedural transforms for procedural mesh ids", () => {
    expect(
      resolveSelectionTransform("mesh-core", proceduralTransforms, importedTransforms, fallback),
    ).toEqual(proceduralTransforms["mesh-core"]);
  });

  it("reads imported object transforms for imported scene node ids", () => {
    expect(
      resolveSelectionTransform(
        "imported-mesh-a",
        proceduralTransforms,
        importedTransforms,
        fallback,
      ),
    ).toEqual(importedTransforms["imported-mesh-a"]);
  });

  it("falls back when selection has no transform binding", () => {
    expect(
      resolveSelectionTransform("mat-steel", proceduralTransforms, importedTransforms, fallback),
    ).toEqual(fallback);
  });
});

describe("updateSelectionTransformMaps", () => {
  it("updates procedural transform maps for procedural selections", () => {
    const next: TransformState = {
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0.4, y: 0.5, z: 0.6 },
      scale: { x: 1.1, y: 1.2, z: 1.3 },
    };

    const updated = updateSelectionTransformMaps(
      "mesh-core",
      next,
      proceduralTransforms,
      importedTransforms,
    );

    expect(updated.proceduralTransforms["mesh-core"]).toEqual(next);
    expect(updated.importedTransforms).toEqual(importedTransforms);
  });

  it("updates imported transform maps for imported selections", () => {
    const next: TransformState = {
      position: { x: 7, y: 8, z: 9 },
      rotation: { x: 0.7, y: 0.8, z: 0.9 },
      scale: { x: 0.9, y: 0.8, z: 0.7 },
    };

    const updated = updateSelectionTransformMaps(
      "imported-mesh-a",
      next,
      proceduralTransforms,
      importedTransforms,
    );

    expect(updated.importedTransforms["imported-mesh-a"]).toEqual(next);
    expect(updated.proceduralTransforms).toEqual(proceduralTransforms);
  });
});
