import { describe, expect, it } from "vitest";
import type { SceneNode } from "../types";
import {
  collectRelatedSceneNodeIds,
  filterSceneTreeByQuery,
  filterSceneTreeByRelatedSelection,
  getScenePanelTreeForTab,
  type ScenePanelTab,
} from "./scene-panel-view";

const TREE: SceneNode = {
  id: "root",
  name: "TurbineAssembly",
  kind: "group",
  children: [
    {
      id: "meshes",
      name: "Meshes",
      kind: "group",
      children: [
        { id: "mesh-housing", name: "Housing_Shell", kind: "mesh", tris: 184320 },
        { id: "mesh-core", name: "Core_Rotor", kind: "mesh", tris: 96204 },
      ],
    },
    {
      id: "materials",
      name: "Materials",
      kind: "group",
      children: [
        { id: "mat-steel", name: "Brushed_Steel", kind: "material" },
        { id: "mat-carbon", name: "Carbon_Weave", kind: "material" },
      ],
    },
    {
      id: "textures",
      name: "Textures",
      kind: "group",
      children: [{ id: "tex-albedo", name: "albedo_4k.ktx2", kind: "texture" }],
    },
  ],
};

const IMPORTED_TREE: SceneNode = {
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
            { id: "imported-node:0/0", name: "HousingShell", kind: "mesh", tris: 42 },
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
  ],
};

describe("getScenePanelTreeForTab", () => {
  it.each<[ScenePanelTab, string[]]>([
    ["scene", ["Meshes", "Materials", "Textures"]],
    ["assets", ["Meshes", "Textures"]],
    ["materials", ["Materials"]],
  ])("returns the expected top-level groups for %s", (tab, expectedNames) => {
    const filtered = getScenePanelTreeForTab(TREE, tab);

    expect(filtered.children?.map((node) => node.name)).toEqual(expectedNames);
  });

  it("keeps imported scene hierarchy in the scene tab while preserving assets and materials views", () => {
    expect(
      getScenePanelTreeForTab(IMPORTED_TREE, "scene").children?.map((node) => node.name),
    ).toEqual(["Scene", "Materials", "Textures"]);
    expect(
      getScenePanelTreeForTab(IMPORTED_TREE, "assets").children?.map((node) => node.name),
    ).toEqual(["Scene", "Textures"]);
    expect(
      getScenePanelTreeForTab(IMPORTED_TREE, "materials").children?.map((node) => node.name),
    ).toEqual(["Materials"]);
  });
});

describe("filterSceneTreeByQuery", () => {
  it("keeps matching descendants and their parent chain", () => {
    const filtered = filterSceneTreeByQuery(TREE, "core");

    expect(filtered?.children?.[0]?.name).toBe("Meshes");
    expect(filtered?.children?.[0]?.children).toEqual([
      { id: "mesh-core", name: "Core_Rotor", kind: "mesh", tris: 96204 },
    ]);
  });

  it("returns null when nothing matches", () => {
    expect(filterSceneTreeByQuery(TREE, "does-not-exist")).toBeNull();
  });
});

describe("filterSceneTreeByRelatedSelection", () => {
  it("keeps only the owning imported object materials in the materials tab", () => {
    const filtered = filterSceneTreeByRelatedSelection(
      getScenePanelTreeForTab(IMPORTED_TREE, "materials"),
      "imported-node:0/0",
      "materials",
    );

    expect(filtered?.children?.[0]?.name).toBe("Materials");
    expect(filtered?.children?.[0]?.children?.map((node) => node.id)).toEqual([
      "imported-node:0/0:material:0",
    ]);
  });

  it("keeps only the owning imported material texture in the assets tab", () => {
    const filtered = filterSceneTreeByRelatedSelection(
      getScenePanelTreeForTab(IMPORTED_TREE, "assets"),
      "imported-node:0/0:material:0",
      "assets",
    );

    expect(filtered?.children?.map((node) => node.name)).toEqual(["Scene", "Textures"]);
    expect(filtered?.children?.[1]?.children?.map((node) => node.id)).toEqual([
      "imported-node:0/0:material:0:texture:map",
    ]);
  });
});

describe("collectRelatedSceneNodeIds", () => {
  it("returns the owning object, material, and texture ids for imported texture selections", () => {
    expect(
      Array.from(
        collectRelatedSceneNodeIds(
          getScenePanelTreeForTab(IMPORTED_TREE, "assets"),
          "imported-node:0/0:material:0:texture:map",
          "assets",
        ),
      ),
    ).toEqual(
      expect.arrayContaining([
        "imported-node:0/0",
        "imported-node:0/0:material:0",
        "imported-node:0/0:material:0:texture:map",
      ]),
    );
  });
});
