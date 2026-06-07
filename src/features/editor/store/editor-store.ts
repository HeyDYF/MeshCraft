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
  selectedIds: string[];
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
    selectedIds: state.selectedIds,
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
  selectedIds: string[];
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
  viewportCaptureRequestNonce: number;
  frameSelectionRequestNonce: number;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  historyPast: EditorHistoryEntry[];
  historyFuture: EditorHistoryEntry[];
  setMode: (mode: EditorMode) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setSelected: (id: string, name: string) => void;
  toggleSelected: (id: string, name: string) => void;
  setActiveMaterialId: (materialId: string | null) => void;
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
  requestViewportCapture: () => void;
  requestFrameSelection: () => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  mode: "object",
  locale: getInitialLocale(),
  theme: getInitialTheme(),
  selectedId: "mesh-core",
  selectedIds: ["mesh-core"],
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
  viewportCaptureRequestNonce: 0,
  frameSelectionRequestNonce: 0,
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
      selectedIds: [id],
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
  setActiveMaterialId: (materialId) => set({ activeMaterialId: materialId }),
  toggleSelected: (id, _name) =>
    set((state) => {
      if (state.selectedIds.includes(id)) {
        const remaining = state.selectedIds.filter((selectedId) => selectedId !== id);

        if (!remaining.length) {
          return {};
        }

        const nextSelectedId = remaining[0];
        return {
          selectedId: nextSelectedId,
          selectedIds: remaining,
          selectedName: nextSelectedId === state.selectedId ? state.selectedName : nextSelectedId,
          activeMaterialId: resolveSelectionMaterialBinding(
            nextSelectedId,
            state.importedNodeMaterialBindings,
          ),
          transform: resolveSelectionTransform(
            nextSelectedId,
            state.objectTransforms,
            state.importedObjectTransforms,
            state.transform,
          ),
        };
      }

      return {
        selectedIds: [...state.selectedIds, id],
      };
    }),
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
        selectedIds: ["imported-root"],
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
        selectedIds: [fallbackSelectedId],
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
      const targetIds = state.selectedIds.filter(
        (selectedId) =>
          selectedId in state.objectTransforms || selectedId in state.importedObjectTransforms,
      );
      let proceduralTransforms = state.objectTransforms;
      let importedTransforms = state.importedObjectTransforms;
      const delta = {
        position: {
          x: transform.position.x - state.transform.position.x,
          y: transform.position.y - state.transform.position.y,
          z: transform.position.z - state.transform.position.z,
        },
        rotation: {
          x: transform.rotation.x - state.transform.rotation.x,
          y: transform.rotation.y - state.transform.rotation.y,
          z: transform.rotation.z - state.transform.rotation.z,
        },
        scale: {
          x: transform.scale.x - state.transform.scale.x,
          y: transform.scale.y - state.transform.scale.y,
          z: transform.scale.z - state.transform.scale.z,
        },
      };

      targetIds.forEach((selectedId) => {
        const currentTransform =
          proceduralTransforms[selectedId] ?? importedTransforms[selectedId] ?? state.transform;
        const updated = updateSelectionTransformMaps(
          selectedId,
          {
            position: {
              x: currentTransform.position.x + delta.position.x,
              y: currentTransform.position.y + delta.position.y,
              z: currentTransform.position.z + delta.position.z,
            },
            rotation: {
              x: currentTransform.rotation.x + delta.rotation.x,
              y: currentTransform.rotation.y + delta.rotation.y,
              z: currentTransform.rotation.z + delta.rotation.z,
            },
            scale: {
              x: currentTransform.scale.x + delta.scale.x,
              y: currentTransform.scale.y + delta.scale.y,
              z: currentTransform.scale.z + delta.scale.z,
            },
          },
          proceduralTransforms,
          importedTransforms,
        );
        proceduralTransforms = updated.proceduralTransforms;
        importedTransforms = updated.importedTransforms;
      });

      return pushHistoryEntry(state, {
        transform,
        objectTransforms: proceduralTransforms,
        importedObjectTransforms: importedTransforms,
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
      const delta = nextTransform[group][axis] - state.transform[group][axis];
      const targetIds = state.selectedIds.filter(
        (selectedId) =>
          selectedId in state.objectTransforms || selectedId in state.importedObjectTransforms,
      );
      let proceduralTransforms = state.objectTransforms;
      let importedTransforms = state.importedObjectTransforms;

      targetIds.forEach((selectedId) => {
        const currentTransform =
          proceduralTransforms[selectedId] ?? importedTransforms[selectedId] ?? state.transform;
        const updated = updateSelectionTransformMaps(
          selectedId,
          {
            ...currentTransform,
            [group]: {
              ...currentTransform[group],
              [axis]: currentTransform[group][axis] + delta,
            },
          },
          proceduralTransforms,
          importedTransforms,
        );
        proceduralTransforms = updated.proceduralTransforms;
        importedTransforms = updated.importedTransforms;
      });

      return pushHistoryEntry(state, {
        transform: nextTransform,
        objectTransforms: proceduralTransforms,
        importedObjectTransforms: importedTransforms,
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
        selectedIds: [applied.selectedId],
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
        selectedIds: ["mesh-core"],
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
  requestViewportCapture: () =>
    set((state) => ({
      viewportCaptureRequestNonce: state.viewportCaptureRequestNonce + 1,
    })),
  requestFrameSelection: () =>
    set((state) => ({
      frameSelectionRequestNonce: state.frameSelectionRequestNonce + 1,
    })),
}));
