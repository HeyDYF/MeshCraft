import { describe, expect, it } from "vitest";
import type { TransformState } from "../types";
import {
  DEFAULT_PROCEDURAL_TRANSFORMS,
  getSelectedTransform,
  updateSelectedTransform,
} from "./procedural-scene";

describe("DEFAULT_PROCEDURAL_TRANSFORMS", () => {
  it("defines independent transforms for each procedural mesh node", () => {
    expect(Object.keys(DEFAULT_PROCEDURAL_TRANSFORMS)).toEqual([
      "mesh-housing",
      "mesh-core",
      "mesh-vents",
      "mesh-bolts",
    ]);
    expect(DEFAULT_PROCEDURAL_TRANSFORMS["mesh-core"]).not.toEqual(
      DEFAULT_PROCEDURAL_TRANSFORMS["mesh-housing"],
    );
  });
});

describe("getSelectedTransform", () => {
  it("returns the selected object's transform when the node is transformable", () => {
    expect(
      getSelectedTransform("mesh-core", DEFAULT_PROCEDURAL_TRANSFORMS),
    ).toEqual(DEFAULT_PROCEDURAL_TRANSFORMS["mesh-core"]);
  });

  it("falls back to the current transform for non-transformable selections", () => {
    const fallback: TransformState = {
      position: { x: 9, y: 8, z: 7 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };

    expect(
      getSelectedTransform("mat-steel", DEFAULT_PROCEDURAL_TRANSFORMS, fallback),
    ).toEqual(fallback);
  });
});

describe("updateSelectedTransform", () => {
  it("updates only the targeted procedural object transform", () => {
    const next: TransformState = {
      position: { x: 3, y: 2, z: 1 },
      rotation: { x: 0.4, y: 0.5, z: 0.6 },
      scale: { x: 1.1, y: 1.2, z: 1.3 },
    };

    const updated = updateSelectedTransform(
      DEFAULT_PROCEDURAL_TRANSFORMS,
      "mesh-core",
      next,
    );

    expect(updated["mesh-core"]).toEqual(next);
    expect(updated["mesh-housing"]).toEqual(
      DEFAULT_PROCEDURAL_TRANSFORMS["mesh-housing"],
    );
  });
});
