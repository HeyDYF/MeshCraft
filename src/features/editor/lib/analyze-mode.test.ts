import { describe, expect, it } from "vitest";
import { deriveAnalyzeSummary } from "./analyze-mode";
import type { SceneNode } from "../types";

const TREE: SceneNode = {
  id: "imported-root",
  name: "ImportedAsset",
  kind: "group",
  children: [
    {
      id: "imported-group:scene",
      name: "Scene",
      kind: "group",
      children: [
        {
          id: "imported-node:0",
          name: "HullGroup",
          kind: "group",
          children: [
            {
              id: "imported-node:0/0",
              name: "HousingShell",
              kind: "mesh",
              tris: 42,
            },
          ],
        },
      ],
    },
    {
      id: "imported-group:materials",
      name: "Materials",
      kind: "group",
      children: [
        {
          id: "imported-node:0/0:material:0",
          name: "ShellMaterial",
          kind: "material",
        },
      ],
    },
    {
      id: "imported-group:textures",
      name: "Textures",
      kind: "group",
      children: [
        {
          id: "imported-node:0/0:material:0:texture:map",
          name: "shell_albedo",
          kind: "texture",
        },
      ],
    },
    {
      id: "imported-group:lighting",
      name: "Lighting",
      kind: "group",
      children: [{ id: "light-key", name: "KeyLight", kind: "light" }],
    },
  ],
};

describe("deriveAnalyzeSummary", () => {
  it("collects scene-wide counts and selection diagnostics from the active scene tree", () => {
    const summary = deriveAnalyzeSummary(TREE, "imported-node:0/0", "imported-node:0/0:material:0");

    expect(summary.scene).toEqual({
      totalNodes: 10,
      groups: 6,
      meshes: 1,
      materials: 1,
      textures: 1,
      lights: 1,
      cameras: 0,
      topLevelChildren: 4,
      totalTriangles: 42,
    });
    expect(summary.selection).toEqual({
      id: "imported-node:0/0",
      kind: "mesh",
      name: "HousingShell",
      triangles: 42,
      childCount: 0,
      path: ["ImportedAsset", "Scene", "HullGroup", "HousingShell"],
      activeMaterialId: "imported-node:0/0:material:0",
    });
  });

  it("returns an explicit missing-selection summary when the selected id is absent", () => {
    const summary = deriveAnalyzeSummary(TREE, "missing-node", null);

    expect(summary.selection).toEqual({
      id: "missing-node",
      kind: null,
      name: null,
      triangles: null,
      childCount: 0,
      path: [],
      activeMaterialId: null,
    });
  });
});
