import { create } from "zustand";
import {
  DEFAULT_MATERIAL_LIBRARY,
  getMaterialBindingForSelection,
  resolveSelectionMaterialBinding,
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
  clearTextureOverride,
  setTextureOverride,
  type TextureOverrideMap,
} from "../lib/texture-overrides";
import {
  resolveSelectionTransform,
  updateSelectionTransformMaps,
} from "../lib/selection-transform-state";
import type {
  DisplayState,
  EditorMode,
  Locale,
  MaterialState,
  MaterialTextureOverride,
  MaterialTextureSlot,
  PerformanceStats,
  SceneNode,
  ShadingMode,
  ThemeMode,
  TransformTool,
  TransformState,
} from "../types";
import { SCENE_TREE } from "../types";
import { getInitialLocale, getInitialTheme } from "../lib/ui-preferences";

type Axis = keyof TransformState["position"];
type TransformGroup = keyof TransformState;
type EditorHistoryEntry = {
  mode: EditorMode;
  locale: Locale;
  theme: ThemeMode;
  selectedId: string;
  selectedName: string;
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
  hasUnsavedChanges: boolean;
};

const HISTORY_LIMIT = 64;

const DEFAULT_DISPLAY: DisplayState = {
  shading: "shaded",
  showGrid: true,
  showGizmo: true,
  showScatterField: true,
  showHologramScan: true,
  showShadows: true,
  postFx: true,
  autoRotate: true,
  lodPreview: false,
};

const DEFAULT_PERFORMANCE: PerformanceStats = {
  fps: 60,
  triangles: 342156,
  drawCalls: 18,
  gpuMemoryMb: 284,
  decodeTimeMs: 11.8,
  instances: SCATTER_FIELD_INSTANCE_COUNT,
};

function revokeTextureOverrides(
  overrides: Record<string, Record<string, MaterialTextureOverride>>,
) {
  Object.values(overrides).forEach((materialOverrides) => {
    Object.values(materialOverrides).forEach((override) => {
      URL.revokeObjectURL(override.objectUrl);
    });
  });
}

function captureHistoryEntry(state: EditorState): EditorHistoryEntry {
  return {
    mode: state.mode,
    locale: state.locale,
    theme: state.theme,
    selectedId: state.selectedId,
    selectedName: state.selectedName,
    activeMaterialId: state.activeMaterialId,
    materialLibrary: state.materialLibrary,
    importedMaterialLibrary: state.importedMaterialLibrary,
    importedNodeMaterialBindings: state.importedNodeMaterialBindings,
    importedMaterialTextureSlots: state.importedMaterialTextureSlots,
    objectTransforms: state.objectTransforms,
    importedObjectTransforms: state.importedObjectTransforms,
    sceneTree: state.sceneTree,
    transformTool: state.transformTool,
    transform: state.transform,
    display: state.display,
    hasUnsavedChanges: state.hasUnsavedChanges,
  };
}

function pushHistoryEntry(
  state: EditorState,
  nextState: Partial<EditorState>,
): Partial<EditorState> {
  const historyPast = [...state.historyPast, captureHistoryEntry(state)].slice(-HISTORY_LIMIT);

  return {
    ...nextState,
    historyPast,
    historyFuture: [],
    canUndo: historyPast.length > 0,
    canRedo: false,
  };
}

type EditorState = {
  mode: EditorMode;
  locale: Locale;
  theme: ThemeMode;
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
  importedMaterialTextureOverrides: Record<string, Record<string, MaterialTextureOverride>>;
  objectTransforms: Record<string, TransformState>;
  importedObjectTransforms: Record<string, TransformState>;
  sceneTree: SceneNode;
  transformTool: TransformTool;
  transform: TransformState;
  display: DisplayState;
  performance: PerformanceStats;
  exportRequestNonce: number;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  historyPast: EditorHistoryEntry[];
  historyFuture: EditorHistoryEntry[];
  setMode: (mode: EditorMode) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setSelected: (id: string, name: string) => void;
  setImportedAsset: (name: string, url: string) => void;
  setImportStatus: (status: ImportStatus, errorMessage?: string | null) => void;
  clearImportedAsset: () => void;
  setImportedMaterialBindings: (payload: {
    materialLibrary: Record<string, MaterialState>;
    nodeMaterialBindings: Record<string, string>;
    materialTextureSlots: Record<string, MaterialTextureSlot[]>;
  }) => void;
  setImportedTextureOverride: (
    materialId: string,
    channel: string,
    override: MaterialTextureOverride,
  ) => void;
  clearImportedTextureOverride: (materialId: string, channel: string) => void;
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
  markProjectSaved: () => void;
  resetProject: () => void;
  undo: () => void;
  redo: () => void;
  requestSceneExport: () => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  mode: "object",
  locale: getInitialLocale(),
  theme: getInitialTheme(),
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
  importedMaterialTextureOverrides: {},
  objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
  importedObjectTransforms: {},
  sceneTree: SCENE_TREE,
  transformTool: DEFAULT_TRANSFORM_TOOL,
  transform: getSelectedTransform("mesh-core", DEFAULT_PROCEDURAL_TRANSFORMS),
  display: DEFAULT_DISPLAY,
  performance: DEFAULT_PERFORMANCE,
  exportRequestNonce: 0,
  hasUnsavedChanges: false,
  canUndo: false,
  canRedo: false,
  historyPast: [],
  historyFuture: [],
  setMode: (mode) =>
    set((state) => pushHistoryEntry(state, { mode, hasUnsavedChanges: true })),
  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
  setSelected: (id, name) =>
    set((state) => ({
      selectedId: id,
      selectedName: name,
      activeMaterialId: resolveSelectionMaterialBinding(
        id,
        state.importedNodeMaterialBindings,
      ),
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
      revokeTextureOverrides(state.importedMaterialTextureOverrides);

      return {
        importedAssetName: name,
        importedAssetUrl: url,
        importStatus: "loading",
        importError: null,
        activeMaterialId: null,
        importedMaterialLibrary: {},
        importedNodeMaterialBindings: {},
        importedMaterialTextureSlots: {},
        importedMaterialTextureOverrides: {},
        selectedId: "imported-root",
        selectedName: name.replace(/\.[^.]+$/, ""),
        importedObjectTransforms: {},
        performance: {
          ...state.performance,
          decodeTimeMs: 0,
        },
        hasUnsavedChanges: true,
      };
    }),
  clearImportedAsset: () =>
    set((state) => {
      if (state.importedAssetUrl) {
        URL.revokeObjectURL(state.importedAssetUrl);
      }
      revokeTextureOverrides(state.importedMaterialTextureOverrides);

      const fallbackSelectedId =
        state.selectedId in state.objectTransforms ? state.selectedId : "mesh-core";
      const fallbackSelectedName =
        fallbackSelectedId === state.selectedId
          ? state.selectedName
          : fallbackSelectedId === "mesh-core"
            ? "Core_Rotor"
            : state.selectedName;

      return {
        importedAssetName: null,
        importedAssetUrl: null,
        importStatus: "idle",
        importError: null,
        activeMaterialId: getMaterialBindingForSelection(fallbackSelectedId),
        materialLibrary: state.materialLibrary,
        importedMaterialLibrary: {},
        importedNodeMaterialBindings: {},
        importedMaterialTextureSlots: {},
        importedMaterialTextureOverrides: {},
        objectTransforms: state.objectTransforms,
        importedObjectTransforms: {},
        sceneTree: SCENE_TREE,
        transformTool: state.transformTool,
        selectedId: fallbackSelectedId,
        selectedName: fallbackSelectedName,
        transform: getSelectedTransform(fallbackSelectedId, state.objectTransforms),
        hasUnsavedChanges: true,
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
  setImportedTextureOverride: (materialId, channel, override) =>
    set((state) => {
      const existing = state.importedMaterialTextureOverrides[materialId]?.[channel];
      if (existing?.objectUrl && existing.objectUrl !== override.objectUrl) {
        URL.revokeObjectURL(existing.objectUrl);
      }

      return {
        importedMaterialTextureOverrides: setTextureOverride(
          state.importedMaterialTextureOverrides as TextureOverrideMap,
          materialId,
          channel,
          override,
        ),
        hasUnsavedChanges: true,
      };
    }),
  clearImportedTextureOverride: (materialId, channel) =>
    set((state) => {
      const existing = state.importedMaterialTextureOverrides[materialId]?.[channel];
      if (existing?.objectUrl) {
        URL.revokeObjectURL(existing.objectUrl);
      }

      return {
        importedMaterialTextureOverrides: clearTextureOverride(
          state.importedMaterialTextureOverrides as TextureOverrideMap,
          materialId,
          channel,
        ),
        hasUnsavedChanges: true,
      };
    }),
  setSceneTree: (sceneTree) => set({ sceneTree }),
  setImportedObjectTransforms: (importedObjectTransforms) =>
    set({ importedObjectTransforms }),
  setTransformTool: (transformTool) =>
    set((state) => pushHistoryEntry(state, { transformTool, hasUnsavedChanges: true })),
  setTransform: (transform) =>
    set((state) => {
      const updated = updateSelectionTransformMaps(
        state.selectedId,
        transform,
        state.objectTransforms,
        state.importedObjectTransforms,
      );

      return pushHistoryEntry(state, {
        transform,
        objectTransforms: updated.proceduralTransforms,
        importedObjectTransforms: updated.importedTransforms,
        hasUnsavedChanges: true,
      });
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

      return pushHistoryEntry(state, {
        transform: nextTransform,
        objectTransforms: updated.proceduralTransforms,
        importedObjectTransforms: updated.importedTransforms,
        hasUnsavedChanges: true,
      });
    }),
  setMaterialField: (key, value) =>
    set((state) =>
      pushHistoryEntry(state, {
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
        hasUnsavedChanges: true,
      }),
    ),
  setDisplayField: (key, value) =>
    set((state) =>
      pushHistoryEntry(state, {
        display: {
          ...state.display,
          [key]: value,
        },
        hasUnsavedChanges: true,
      }),
    ),
  setShading: (shading) =>
    set((state) =>
      pushHistoryEntry(state, {
        display: {
          ...state.display,
          shading,
        },
        hasUnsavedChanges: true,
      }),
    ),
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
      revokeTextureOverrides(state.importedMaterialTextureOverrides);

      const applied = applyProjectSnapshot(snapshot);

      return {
        locale: state.locale,
        theme: state.theme,
        ...applied,
        hasUnsavedChanges: false,
        canUndo: false,
        canRedo: false,
        historyPast: [],
        historyFuture: [],
      };
    }),
  markProjectSaved: () => set({ hasUnsavedChanges: false }),
  resetProject: () =>
    set((state) => {
      if (state.importedAssetUrl) {
        URL.revokeObjectURL(state.importedAssetUrl);
      }
      revokeTextureOverrides(state.importedMaterialTextureOverrides);

      return {
        mode: "object",
        locale: state.locale,
        theme: state.theme,
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
        importedMaterialTextureOverrides: {},
        objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
        importedObjectTransforms: {},
        sceneTree: SCENE_TREE,
        transformTool: DEFAULT_TRANSFORM_TOOL,
        transform: getSelectedTransform("mesh-core", DEFAULT_PROCEDURAL_TRANSFORMS),
        display: DEFAULT_DISPLAY,
        performance: DEFAULT_PERFORMANCE,
        hasUnsavedChanges: false,
        canUndo: false,
        canRedo: false,
        historyPast: [],
        historyFuture: [],
      };
    }),
  undo: () =>
    set((state) => {
      const previous = state.historyPast.at(-1);

      if (!previous) {
        return {};
      }

      const historyPast = state.historyPast.slice(0, -1);
      const historyFuture = [captureHistoryEntry(state), ...state.historyFuture];

      return {
        ...previous,
        historyPast,
        historyFuture,
        canUndo: historyPast.length > 0,
        canRedo: historyFuture.length > 0,
      };
    }),
  redo: () =>
    set((state) => {
      const [next, ...historyFuture] = state.historyFuture;

      if (!next) {
        return {};
      }

      const historyPast = [...state.historyPast, captureHistoryEntry(state)].slice(-HISTORY_LIMIT);

      return {
        ...next,
        historyPast,
        historyFuture,
        canUndo: historyPast.length > 0,
        canRedo: historyFuture.length > 0,
      };
    }),
  requestSceneExport: () =>
    set((state) => ({
      exportRequestNonce: state.exportRequestNonce + 1,
    })),
}));
