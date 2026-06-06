import { create } from "zustand";
import {
  DEFAULT_MATERIAL_LIBRARY,
  getMaterialBindingForSelection,
} from "../lib/editor-bindings";
import type { ImportStatus } from "../lib/import-status";
import { DEFAULT_TRANSFORM_TOOL } from "../lib/transform-tool";
import {
  DEFAULT_PROCEDURAL_TRANSFORMS,
  getSelectedTransform,
} from "../lib/procedural-scene";
import { applyProjectSnapshot, type ProjectSnapshot } from "../lib/project-snapshot";
import { SCATTER_FIELD_INSTANCE_COUNT } from "../../viewport/lib/instanced-field";
import {
  resolveSelectionTransform,
  updateSelectionTransformMaps,
} from "../lib/selection-transform-state";
import type {
  DisplayState,
  EditorMode,
  MaterialState,
  MaterialTextureSlot,
  PerformanceStats,
  SceneNode,
  ShadingMode,
  TransformTool,
  TransformState,
} from "../types";
import { SCENE_TREE } from "../types";

type Axis = keyof TransformState["position"];
type TransformGroup = keyof TransformState;

type EditorState = {
  mode: EditorMode;
  selectedId: string;
  selectedName: string;
  importedAssetName: string | null;
  importedAssetUrl: string | null;
  importStatus: ImportStatus;
  importError: string | null;
  activeMaterialId: string | null;
  materialLibrary: Record<string, MaterialState>;
  importedMaterialLibrary: Record<string, MaterialState>;
  importedNodeMaterialBindings: Record<string, string>;
  importedMaterialTextureSlots: Record<string, MaterialTextureSlot[]>;
  objectTransforms: Record<string, TransformState>;
  importedObjectTransforms: Record<string, TransformState>;
  sceneTree: SceneNode;
  transformTool: TransformTool;
  transform: TransformState;
  display: DisplayState;
  performance: PerformanceStats;
  exportRequestNonce: number;
  setMode: (mode: EditorMode) => void;
  setSelected: (id: string, name: string) => void;
  setImportedAsset: (name: string, url: string) => void;
  setImportStatus: (status: ImportStatus, errorMessage?: string | null) => void;
  clearImportedAsset: () => void;
  setImportedMaterialBindings: (payload: {
    materialLibrary: Record<string, MaterialState>;
    nodeMaterialBindings: Record<string, string>;
    materialTextureSlots: Record<string, MaterialTextureSlot[]>;
  }) => void;
  setSceneTree: (sceneTree: SceneNode) => void;
  setImportedObjectTransforms: (
    importedObjectTransforms: Record<string, TransformState>,
  ) => void;
  setTransformTool: (transformTool: TransformTool) => void;
  setTransform: (transform: TransformState) => void;
  setTransformAxis: (group: TransformGroup, axis: Axis, value: number) => void;
  setMaterialField: <K extends keyof MaterialState>(key: K, value: MaterialState[K]) => void;
  setDisplayField: <K extends keyof DisplayState>(key: K, value: DisplayState[K]) => void;
  setShading: (shading: ShadingMode) => void;
  updatePerformance: (performance: Partial<PerformanceStats>) => void;
  applyProjectSnapshot: (snapshot: ProjectSnapshot) => void;
  requestSceneExport: () => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  mode: "object",
  selectedId: "mesh-core",
  selectedName: "Core_Rotor",
  importedAssetName: null,
  importedAssetUrl: null,
  importStatus: "idle",
  importError: null,
  activeMaterialId: getMaterialBindingForSelection("mesh-core"),
  materialLibrary: DEFAULT_MATERIAL_LIBRARY,
  importedMaterialLibrary: {},
  importedNodeMaterialBindings: {},
  importedMaterialTextureSlots: {},
  objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
  importedObjectTransforms: {},
  sceneTree: SCENE_TREE,
  transformTool: DEFAULT_TRANSFORM_TOOL,
  transform: getSelectedTransform("mesh-core", DEFAULT_PROCEDURAL_TRANSFORMS),
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
    instances: SCATTER_FIELD_INSTANCE_COUNT,
  },
  exportRequestNonce: 0,
  setMode: (mode) => set({ mode }),
  setSelected: (id, name) =>
    set((state) => ({
      selectedId: id,
      selectedName: name,
      activeMaterialId:
        getMaterialBindingForSelection(id) ?? state.importedNodeMaterialBindings[id] ?? null,
      transform: resolveSelectionTransform(
        id,
        state.objectTransforms,
        state.importedObjectTransforms,
        state.transform,
      ),
    })),
  setImportedAsset: (name, url) =>
    set((state) => {
      if (state.importedAssetUrl) {
        URL.revokeObjectURL(state.importedAssetUrl);
      }

      return {
        importedAssetName: name,
        importedAssetUrl: url,
        importStatus: "loading",
        importError: null,
        activeMaterialId: null,
        importedMaterialLibrary: {},
        importedNodeMaterialBindings: {},
        importedMaterialTextureSlots: {},
        selectedId: "imported-root",
        selectedName: name.replace(/\.[^.]+$/, ""),
        importedObjectTransforms: {},
        performance: {
          ...state.performance,
          decodeTimeMs: 0,
        },
      };
    }),
  clearImportedAsset: () =>
    set((state) => {
      if (state.importedAssetUrl) {
        URL.revokeObjectURL(state.importedAssetUrl);
      }

      return {
        importedAssetName: null,
        importedAssetUrl: null,
        importStatus: "idle",
        importError: null,
        activeMaterialId: getMaterialBindingForSelection("mesh-core"),
        materialLibrary: DEFAULT_MATERIAL_LIBRARY,
        importedMaterialLibrary: {},
        importedNodeMaterialBindings: {},
        importedMaterialTextureSlots: {},
        objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
        importedObjectTransforms: {},
        sceneTree: SCENE_TREE,
        transformTool: DEFAULT_TRANSFORM_TOOL,
        selectedId: "mesh-core",
        selectedName: "Core_Rotor",
        transform: getSelectedTransform("mesh-core", DEFAULT_PROCEDURAL_TRANSFORMS),
      };
    }),
  setImportStatus: (status, errorMessage = null) =>
    set({
      importStatus: status,
      importError: errorMessage,
    }),
  setImportedMaterialBindings: ({
    materialLibrary,
    nodeMaterialBindings,
    materialTextureSlots,
  }) =>
    set({
      importedMaterialLibrary: materialLibrary,
      importedNodeMaterialBindings: nodeMaterialBindings,
      importedMaterialTextureSlots: materialTextureSlots,
    }),
  setSceneTree: (sceneTree) => set({ sceneTree }),
  setImportedObjectTransforms: (importedObjectTransforms) =>
    set({ importedObjectTransforms }),
  setTransformTool: (transformTool) => set({ transformTool }),
  setTransform: (transform) =>
    set((state) => {
      const updated = updateSelectionTransformMaps(
        state.selectedId,
        transform,
        state.objectTransforms,
        state.importedObjectTransforms,
      );

      return {
        transform,
        objectTransforms: updated.proceduralTransforms,
        importedObjectTransforms: updated.importedTransforms,
      };
    }),
  setTransformAxis: (group, axis, value) =>
    set((state) => {
      const nextTransform = {
        ...state.transform,
        [group]: {
          ...state.transform[group],
          [axis]: value,
        },
      };
      const updated = updateSelectionTransformMaps(
        state.selectedId,
        nextTransform,
        state.objectTransforms,
        state.importedObjectTransforms,
      );

      return {
        transform: nextTransform,
        objectTransforms: updated.proceduralTransforms,
        importedObjectTransforms: updated.importedTransforms,
      };
    }),
  setMaterialField: (key, value) =>
    set((state) => ({
      materialLibrary:
        state.activeMaterialId && state.activeMaterialId in state.materialLibrary
          ? {
              ...state.materialLibrary,
              [state.activeMaterialId]: {
                ...state.materialLibrary[state.activeMaterialId],
                [key]: value,
              },
            }
          : state.materialLibrary,
      importedMaterialLibrary:
        state.activeMaterialId && state.activeMaterialId in state.importedMaterialLibrary
          ? {
              ...state.importedMaterialLibrary,
              [state.activeMaterialId]: {
                ...state.importedMaterialLibrary[state.activeMaterialId],
                [key]: value,
              },
            }
          : state.importedMaterialLibrary,
    })),
  setDisplayField: (key, value) =>
    set((state) => ({
      display: {
        ...state.display,
        [key]: value,
      },
    })),
  setShading: (shading) =>
    set((state) => ({
      display: {
        ...state.display,
        shading,
      },
    })),
  updatePerformance: (performance) =>
    set((state) => ({
      performance: {
        ...state.performance,
        ...performance,
      },
    })),
  applyProjectSnapshot: (snapshot) =>
    set((state) => {
      if (state.importedAssetUrl) {
        URL.revokeObjectURL(state.importedAssetUrl);
      }

      const applied = applyProjectSnapshot(snapshot);

      return {
        ...applied,
        sceneTree: SCENE_TREE,
      };
    }),
  requestSceneExport: () =>
    set((state) => ({
      exportRequestNonce: state.exportRequestNonce + 1,
    })),
}));
