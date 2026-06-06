import { describe, expect, it } from "vitest";
import {
  DEFAULT_MATERIAL_LIBRARY,
  getSelectionCapabilities,
  getMaterialBindingForSelection,
} from "./editor-bindings";

describe("getMaterialBindingForSelection", () => {
  it("resolves mesh nodes to their bound material slots", () => {
    expect(getMaterialBindingForSelection("mesh-housing")).toBe("mat-steel");
    expect(getMaterialBindingForSelection("mesh-core")).toBe("mat-carbon");
    expect(getMaterialBindingForSelection("mesh-vents")).toBe("mat-steel");
    expect(getMaterialBindingForSelection("mesh-bolts")).toBe("mat-steel");
  });

  it("passes through direct material selection and returns null for unbound nodes", () => {
    expect(getMaterialBindingForSelection("mat-glow")).toBe("mat-glow");
    expect(getMaterialBindingForSelection("tex-albedo")).toBeNull();
    expect(getMaterialBindingForSelection("light-key")).toBeNull();
  });
});

describe("DEFAULT_MATERIAL_LIBRARY", () => {
  it("contains the baseline procedural material slots required by the editor", () => {
    expect(Object.keys(DEFAULT_MATERIAL_LIBRARY)).toEqual([
      "mat-steel",
      "mat-carbon",
      "mat-glow",
    ]);
  });
});

describe("getSelectionCapabilities", () => {
  it("enables transform for mesh-like nodes and material editing for bound material nodes", () => {
    expect(getSelectionCapabilities("mesh-core")).toEqual({
      canTransform: true,
      canEditMaterial: true,
    });
    expect(getSelectionCapabilities("mat-steel")).toEqual({
      canTransform: false,
      canEditMaterial: true,
    });
    expect(getSelectionCapabilities("tex-albedo")).toEqual({
      canTransform: false,
      canEditMaterial: false,
    });
  });
});
