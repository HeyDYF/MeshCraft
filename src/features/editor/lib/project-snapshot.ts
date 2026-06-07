import {
  DEFAULT_MATERIAL_LIBRARY,
  resolveSelectionMaterialBinding,
} from "./editor-bindings";
import { DEFAULT_PROCEDURAL_TRANSFORMS, getSelectedTransform } from "./procedural-scene";
import { DEFAULT_TRANSFORM_TOOL, coerceTransformTool } from "./transform-tool";
import type { ImportStatus } from "./import-status";
import type {
  DisplayState,
  EditorMode,
  MaterialState,
  MaterialTextureOverride,
  MaterialTextureSlot,
  SceneNode,
  TransformState,
} from "../types";
import { SCENE_TREE } from "../types";

export const PROJECT_SNAPSHOT_VERSION = 1;

export type ProjectSnapshot = {
  version: typeof PROJECT_SNAPSHOT_VERSION;
  mode: EditorMode;
  selectedId: string;
  selectedName: string;
  activeMaterialId?: string | null;
  transformTool: "translate" | "rotate" | "scale";
  materialLibrary: Record<string, MaterialState>;
  objectTransforms: Record<string, TransformState>;
  display: DisplayState;
  importedAssetName: string | null;
  importedAssetUrl: string | null;
  importedMaterialLibrary: Record<string, MaterialState>;
  importedNodeMaterialBindings: Record<string, string>;
  importedMaterialTextureSlots: Record<string, MaterialTextureSlot[]>;
  importedMaterialTextureOverrides: Record<string, Record<string, MaterialTextureOverride>>;
  importedObjectTransforms: Record<string, TransformState>;
  sceneTree: SceneNode;
};

type SnapshotInput = Omit<ProjectSnapshot, "version">;

export function createProjectSnapshot(input: SnapshotInput): ProjectSnapshot {
  return {
    version: PROJECT_SNAPSHOT_VERSION,
    ...input,
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseProjectSnapshot(json: string): ProjectSnapshot {
  const parsed = JSON.parse(json) as unknown;

  if (!isObjectRecord(parsed) || parsed.version !== PROJECT_SNAPSHOT_VERSION) {
    throw new Error("Unsupported project snapshot");
  }

  return parsed as ProjectSnapshot;
}

export function applyProjectSnapshot(snapshot: ProjectSnapshot) {
  const importedMaterialLibrary = snapshot.importedMaterialLibrary ?? {};
  const importedObjectTransforms = snapshot.importedObjectTransforms ?? {};
  const importedNodeMaterialBindings = snapshot.importedNodeMaterialBindings ?? {};
  const selectedId =
    snapshot.selectedId in snapshot.objectTransforms ||
    snapshot.selectedId in snapshot.materialLibrary ||
    snapshot.selectedId in importedObjectTransforms ||
    snapshot.selectedId in importedMaterialLibrary
      ? snapshot.selectedId
      : "mesh-core";
  const selectedName =
    selectedId === snapshot.selectedId ? snapshot.selectedName : "Core_Rotor";

  const importStatus: ImportStatus = snapshot.importedAssetUrl ? "loading" : "idle";

  return {
    mode: snapshot.mode,
    selectedId,
    selectedName,
    activeMaterialId:
      snapshot.activeMaterialId &&
      (snapshot.activeMaterialId in (snapshot.materialLibrary ?? DEFAULT_MATERIAL_LIBRARY) ||
        snapshot.activeMaterialId in importedMaterialLibrary)
        ? snapshot.activeMaterialId
        :
      resolveSelectionMaterialBinding(selectedId, importedNodeMaterialBindings) ??
      (selectedId in importedMaterialLibrary ? selectedId : null),
    materialLibrary: snapshot.materialLibrary ?? DEFAULT_MATERIAL_LIBRARY,
    objectTransforms: snapshot.objectTransforms ?? DEFAULT_PROCEDURAL_TRANSFORMS,
    importedAssetName: snapshot.importedAssetName ?? null,
    importedAssetUrl: snapshot.importedAssetUrl ?? null,
    importedMaterialLibrary,
    importedNodeMaterialBindings,
    importedMaterialTextureSlots: snapshot.importedMaterialTextureSlots ?? {},
    importedMaterialTextureOverrides: snapshot.importedMaterialTextureOverrides ?? {},
    importedObjectTransforms,
    sceneTree: snapshot.sceneTree ?? SCENE_TREE,
    transformTool: coerceTransformTool(snapshot.transformTool ?? DEFAULT_TRANSFORM_TOOL),
    transform: getSelectedTransform(
      selectedId,
      snapshot.objectTransforms ?? DEFAULT_PROCEDURAL_TRANSFORMS,
    ),
    display: snapshot.display,
    importStatus,
    importError: null,
  };
}
