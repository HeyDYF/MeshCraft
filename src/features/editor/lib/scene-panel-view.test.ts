import { describe, expect, it } from "vitest";
import type { SceneNode } from "../types";
import {
  filterSceneTreeByQuery,
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

describe("getScenePanelTreeForTab", () => {
  it.each<[ScenePanelTab, string[]]>([
    ["scene", ["Meshes", "Materials", "Textures"]],
    ["assets", ["Meshes", "Textures"]],
    ["materials", ["Materials"]],
  ])("returns the expected top-level groups for %s", (tab, expectedNames) => {
    const filtered = getScenePanelTreeForTab(TREE, tab);

    expect(filtered.children?.map((node) => node.name)).toEqual(expectedNames);
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
