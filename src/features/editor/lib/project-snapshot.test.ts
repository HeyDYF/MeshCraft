import { describe, expect, it } from "vitest";
import { DEFAULT_MATERIAL_LIBRARY } from "./editor-bindings";
import { DEFAULT_PROCEDURAL_TRANSFORMS } from "./procedural-scene";
import {
  applyProjectSnapshot,
  createProjectSnapshot,
  parseProjectSnapshot,
  PROJECT_SNAPSHOT_VERSION,
} from "./project-snapshot";
import { SCENE_TREE } from "../types";

describe("createProjectSnapshot", () => {
  it("captures the serializable editor state needed to restore a full local project session", () => {
    const snapshot = createProjectSnapshot({
      mode: "material",
      selectedId: "imported-node:0",
      selectedName: "ImportedHull",
      activeMaterialId: "imported-node:0:material:0",
      transformTool: "rotate",
      materialLibrary: DEFAULT_MATERIAL_LIBRARY,
      objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
      display: {
        shading: "matcap",
        showGrid: false,
        showGizmo: true,
        showScatterField: false,
        showHologramScan: true,
        showShadows: false,
        postFx: false,
        autoRotate: false,
        lodPreview: true,
      },
      importedAssetName: "robot.glb",
      importedAssetUrl: "data:model/gltf-binary;base64,AAAA",
      importedMaterialLibrary: {
        "imported-node:0:material:0": {
          baseColor: "#123456",
          metalness: 0.2,
          roughness: 0.7,
          emission: 0,
          opacity: 1,
        },
      },
      importedNodeMaterialBindings: {
        "imported-node:0": "imported-node:0:material:0",
        "imported-node:0:material:0": "imported-node:0:material:0",
      },
      importedMaterialTextureSlots: {
        "imported-node:0:material:0": [
          {
            channel: "map",
            textureId: "imported-node:0:material:0:texture:map",
            textureName: "albedo.png",
          },
        ],
      },
      importedMaterialTextureOverrides: {
        "imported-node:0:material:0": {
          map: {
            name: "albedo_override.png",
            objectUrl: "data:image/png;base64,BBBB",
          },
        },
      },
      importedObjectTransforms: {
        "imported-root": {
          position: { x: 0, y: -1.15, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        "imported-node:0": {
          position: { x: 1, y: 2, z: 3 },
          rotation: { x: 0.1, y: 0.2, z: 0.3 },
          scale: { x: 2, y: 2, z: 2 },
        },
      },
      sceneTree: {
        id: "imported-root",
        name: "robot",
        kind: "group",
        children: [
          {
            id: "imported-group:meshes",
            name: "Meshes",
            kind: "group",
            children: [
              {
                id: "imported-node:0",
                name: "ImportedHull",
                kind: "mesh",
                tris: 42,
              },
            ],
          },
        ],
      },
    });

    expect(snapshot.version).toBe(PROJECT_SNAPSHOT_VERSION);
    expect(snapshot.selectedId).toBe("imported-node:0");
    expect(snapshot.activeMaterialId).toBe("imported-node:0:material:0");
    expect(snapshot.transformTool).toBe("rotate");
    expect(snapshot.importedAssetName).toBe("robot.glb");
    expect(snapshot.importedAssetUrl).toContain("data:model/gltf-binary");
    expect(snapshot.importedObjectTransforms["imported-node:0"].position.x).toBe(1);
    expect(snapshot.sceneTree.id).toBe("imported-root");
  });
});

describe("parseProjectSnapshot", () => {
  it("parses a valid snapshot payload", () => {
    const parsed = parseProjectSnapshot(
      JSON.stringify(
        createProjectSnapshot({
          mode: "object",
          selectedId: "mesh-core",
          selectedName: "Core_Rotor",
          activeMaterialId: "mat-carbon",
          transformTool: "translate",
          materialLibrary: DEFAULT_MATERIAL_LIBRARY,
          objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
          display: {
            shading: "shaded",
            showGrid: true,
            showGizmo: true,
            showScatterField: true,
            showHologramScan: true,
            showShadows: true,
            postFx: true,
            autoRotate: true,
            lodPreview: false,
          },
          importedAssetName: null,
          importedAssetUrl: null,
          importedMaterialLibrary: {},
          importedNodeMaterialBindings: {},
          importedMaterialTextureSlots: {},
          importedMaterialTextureOverrides: {},
          importedObjectTransforms: {},
          sceneTree: SCENE_TREE,
        }),
      ),
    );

    expect(parsed.selectedId).toBe("mesh-core");
    expect(parsed.materialLibrary["mat-glow"].baseColor).toBe("#39d8ff");
  });

  it("rejects unknown versions and malformed payloads", () => {
    expect(() =>
      parseProjectSnapshot(
        JSON.stringify({
          version: 999,
        }),
      ),
    ).toThrow("Unsupported project snapshot");

    expect(() => parseProjectSnapshot("{")).toThrow();
  });
});

describe("applyProjectSnapshot", () => {
  it("restores imported session state when serialized asset content is available", () => {
    const snapshot = createProjectSnapshot({
      mode: "object",
      selectedId: "imported-node:0",
      selectedName: "ImportedHull",
      activeMaterialId: "imported-node:0:material:0",
      transformTool: "translate",
      materialLibrary: DEFAULT_MATERIAL_LIBRARY,
      objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
      display: {
        shading: "shaded",
        showGrid: true,
        showGizmo: true,
        showScatterField: true,
        showHologramScan: true,
        showShadows: true,
        postFx: true,
        autoRotate: true,
        lodPreview: false,
      },
      importedAssetName: "robot.glb",
      importedAssetUrl: "data:model/gltf-binary;base64,AAAA",
      importedMaterialLibrary: {
        "imported-node:0:material:0": {
          baseColor: "#123456",
          metalness: 0.2,
          roughness: 0.7,
          emission: 0,
          opacity: 1,
        },
      },
      importedNodeMaterialBindings: {
        "imported-node:0": "imported-node:0:material:0",
        "imported-node:0:material:0": "imported-node:0:material:0",
      },
      importedMaterialTextureSlots: {
        "imported-node:0:material:0": [
          {
            channel: "map",
            textureId: "imported-node:0:material:0:texture:map",
            textureName: "albedo.png",
          },
        ],
      },
      importedMaterialTextureOverrides: {
        "imported-node:0:material:0": {
          map: {
            name: "albedo_override.png",
            objectUrl: "data:image/png;base64,BBBB",
          },
        },
      },
      importedObjectTransforms: {
        "imported-root": {
          position: { x: 0, y: -1.15, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        "imported-node:0": {
          position: { x: 1, y: 2, z: 3 },
          rotation: { x: 0.1, y: 0.2, z: 0.3 },
          scale: { x: 2, y: 2, z: 2 },
        },
      },
      sceneTree: {
        id: "imported-root",
        name: "robot",
        kind: "group",
        children: [],
      },
    });

    const applied = applyProjectSnapshot(snapshot);

    expect(applied.importedAssetName).toBe("robot.glb");
    expect(applied.importedAssetUrl).toContain("data:model/gltf-binary");
    expect(applied.importStatus).toBe("loading");
    expect(applied.selectedId).toBe("imported-node:0");
    expect(applied.activeMaterialId).toBe("imported-node:0:material:0");
    expect(applied.importedMaterialLibrary["imported-node:0:material:0"].baseColor).toBe(
      "#123456",
    );
    expect(applied.importedMaterialTextureOverrides["imported-node:0:material:0"].map.name).toBe(
      "albedo_override.png",
    );
    expect(applied.sceneTree.id).toBe("imported-root");
  });

  it("preserves an explicit imported active material slot when the selected node has multiple materials", () => {
    const snapshot = createProjectSnapshot({
      mode: "material",
      selectedId: "imported-node:0",
      selectedName: "ImportedHull",
      activeMaterialId: "imported-node:0:material:1",
      transformTool: "translate",
      materialLibrary: DEFAULT_MATERIAL_LIBRARY,
      objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
      display: {
        shading: "shaded",
        showGrid: true,
        showGizmo: true,
        showScatterField: true,
        showHologramScan: true,
        showShadows: true,
        postFx: true,
        autoRotate: true,
        lodPreview: false,
      },
      importedAssetName: "robot.glb",
      importedAssetUrl: "data:model/gltf-binary;base64,AAAA",
      importedMaterialLibrary: {
        "imported-node:0:material:0": {
          baseColor: "#123456",
          metalness: 0.2,
          roughness: 0.7,
          emission: 0,
          opacity: 1,
        },
        "imported-node:0:material:1": {
          baseColor: "#abcdef",
          metalness: 0.5,
          roughness: 0.4,
          emission: 0,
          opacity: 1,
        },
      },
      importedNodeMaterialBindings: {
        "imported-node:0": "imported-node:0:material:0",
        "imported-node:0:material:0": "imported-node:0:material:0",
        "imported-node:0:material:1": "imported-node:0:material:1",
      },
      importedMaterialTextureSlots: {},
      importedMaterialTextureOverrides: {},
      importedObjectTransforms: {
        "imported-root": {
          position: { x: 0, y: -1.15, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        "imported-node:0": {
          position: { x: 1, y: 2, z: 3 },
          rotation: { x: 0.1, y: 0.2, z: 0.3 },
          scale: { x: 2, y: 2, z: 2 },
        },
      },
      sceneTree: {
        id: "imported-root",
        name: "robot",
        kind: "group",
        children: [],
      },
    });

    const applied = applyProjectSnapshot(snapshot);

    expect(applied.selectedId).toBe("imported-node:0");
    expect(applied.activeMaterialId).toBe("imported-node:0:material:1");
  });
});
