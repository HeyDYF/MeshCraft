import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorStore } from "./editor-store";

describe("editor store unsaved changes workflow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useEditorStore.setState({
      mode: "object",
      selectedId: "mesh-core",
      selectedName: "Core_Rotor",
      importedAssetName: null,
      importedAssetUrl: null,
      importStatus: "idle",
      importError: null,
      activeMaterialId: "mat-carbon",
      materialLibrary: {
        "mat-steel": {
          baseColor: "#697587",
          metalness: 0.86,
          roughness: 0.34,
          emission: 0.08,
          opacity: 1,
        },
        "mat-carbon": {
          baseColor: "#8b94a3",
          metalness: 0.85,
          roughness: 0.3,
          emission: 0.02,
          opacity: 1,
        },
        "mat-glow": {
          baseColor: "#39d8ff",
          metalness: 0.8,
          roughness: 0.18,
          emission: 2.4,
          opacity: 1,
        },
      },
      importedMaterialLibrary: {},
      importedNodeMaterialBindings: {},
      importedMaterialTextureSlots: {},
      importedMaterialTextureOverrides: {},
      objectTransforms: {
        "mesh-housing": {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        "mesh-core": {
          position: { x: 0, y: 0.45, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        "mesh-vents": {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        "mesh-bolts": {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
      },
      importedObjectTransforms: {},
      sceneTree: {
        id: "root",
        name: "TurbineAssembly",
        kind: "group",
        children: [],
      },
      transformTool: "translate",
      transform: {
        position: { x: 0, y: 0.45, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
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
      performance: {
        fps: 60,
        triangles: 342156,
        drawCalls: 18,
        gpuMemoryMb: 284,
        decodeTimeMs: 11.8,
        instances: 1000,
      },
      exportRequestNonce: 0,
      hasUnsavedChanges: false,
    });
  });

  it("marks the project dirty after mutating editor state and clears it after save", () => {
    useEditorStore.getState().setDisplayField("showGrid", false);

    expect(useEditorStore.getState().hasUnsavedChanges).toBe(true);

    useEditorStore.getState().markProjectSaved();

    expect(useEditorStore.getState().hasUnsavedChanges).toBe(false);
  });

  it("marks imported asset unload as dirty and resetProject as pristine", () => {
    useEditorStore.setState({
      importedAssetName: "robot.glb",
      importedAssetUrl: "data:model/gltf-binary;base64,AAAA",
    });

    useEditorStore.getState().clearImportedAsset();

    expect(useEditorStore.getState().hasUnsavedChanges).toBe(true);

    useEditorStore.getState().resetProject();

    expect(useEditorStore.getState().hasUnsavedChanges).toBe(false);
    expect(useEditorStore.getState().selectedId).toBe("mesh-core");
    expect(useEditorStore.getState().importedAssetName).toBeNull();
  });

  it("preserves procedural edits when unloading an imported asset", () => {
    useEditorStore.setState({
      selectedId: "mesh-housing",
      selectedName: "Housing_Shell",
      activeMaterialId: "mat-steel",
      materialLibrary: {
        ...useEditorStore.getState().materialLibrary,
        "mat-steel": {
          ...useEditorStore.getState().materialLibrary["mat-steel"],
          baseColor: "#112233",
        },
      },
      objectTransforms: {
        ...useEditorStore.getState().objectTransforms,
        "mesh-core": {
          position: { x: 2, y: 3, z: 4 },
          rotation: { x: 0.4, y: 0.5, z: 0.6 },
          scale: { x: 1.5, y: 1.5, z: 1.5 },
        },
      },
      importedAssetName: "robot.glb",
      importedAssetUrl: "data:model/gltf-binary;base64,AAAA",
      importedMaterialLibrary: {
        "imported-node:0:material:0": {
          baseColor: "#abcdef",
          metalness: 0.4,
          roughness: 0.6,
          emission: 0,
          opacity: 1,
        },
      },
      importedObjectTransforms: {
        "imported-root": {
          position: { x: 0, y: -1.15, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
      },
      sceneTree: {
        id: "imported-root",
        name: "robot",
        kind: "group",
        children: [],
      },
    });

    useEditorStore.getState().clearImportedAsset();

    expect(useEditorStore.getState().materialLibrary["mat-steel"].baseColor).toBe("#112233");
    expect(useEditorStore.getState().objectTransforms["mesh-core"].position).toEqual({
      x: 2,
      y: 3,
      z: 4,
    });
    expect(useEditorStore.getState().importedAssetName).toBeNull();
    expect(useEditorStore.getState().importedMaterialLibrary).toEqual({});
    expect(useEditorStore.getState().sceneTree.id).toBe("root");
  });

  it("keeps loaded snapshots pristine", () => {
    useEditorStore.getState().applyProjectSnapshot({
      version: 1,
      mode: "object",
      selectedId: "mesh-core",
      selectedName: "Core_Rotor",
      transformTool: "translate",
      materialLibrary: useEditorStore.getState().materialLibrary,
      objectTransforms: useEditorStore.getState().objectTransforms,
      display: useEditorStore.getState().display,
      importedAssetName: null,
      importedAssetUrl: null,
      importedMaterialLibrary: {},
      importedNodeMaterialBindings: {},
      importedMaterialTextureSlots: {},
      importedMaterialTextureOverrides: {},
      importedObjectTransforms: {},
      sceneTree: useEditorStore.getState().sceneTree,
    });

    expect(useEditorStore.getState().hasUnsavedChanges).toBe(false);
  });
});
