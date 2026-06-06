import { DEFAULT_MATERIAL_LIBRARY, getMaterialBindingForSelection } from "./editor-bindings";
import { DEFAULT_PROCEDURAL_TRANSFORMS, getSelectedTransform } from "./procedural-scene";
import { DEFAULT_TRANSFORM_TOOL, coerceTransformTool } from "./transform-tool";
import type { ImportStatus } from "./import-status";
import type {
  DisplayState,
  EditorMode,
  MaterialState,
  TransformState,
} from "../types";

export const PROJECT_SNAPSHOT_VERSION = 1;

export type ProjectSnapshot = {
  version: typeof PROJECT_SNAPSHOT_VERSION;
  mode: EditorMode;
  selectedId: string;
  selectedName: string;
  transformTool: "translate" | "rotate" | "scale";
  materialLibrary: Record<string, MaterialState>;
  objectTransforms: Record<string, TransformState>;
  display: DisplayState;
  importedAssetName: string | null;
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
  const selectedId =
    snapshot.selectedId in snapshot.objectTransforms ||
    snapshot.selectedId in snapshot.materialLibrary
      ? snapshot.selectedId
      : "mesh-core";
  const selectedName =
    selectedId === snapshot.selectedId ? snapshot.selectedName : "Core_Rotor";

  const importStatus: ImportStatus = snapshot.importedAssetName ? "error" : "idle";

  return {
    mode: snapshot.mode,
    selectedId,
    selectedName,
    activeMaterialId: getMaterialBindingForSelection(selectedId),
    materialLibrary: snapshot.materialLibrary ?? DEFAULT_MATERIAL_LIBRARY,
    objectTransforms: snapshot.objectTransforms ?? DEFAULT_PROCEDURAL_TRANSFORMS,
    importedAssetName: null,
    importedAssetUrl: null,
    importedMaterialLibrary: {},
    importedNodeMaterialBindings: {},
    importedMaterialTextureSlots: {},
    importedObjectTransforms: {},
    sceneTree: undefined,
    transformTool: coerceTransformTool(snapshot.transformTool ?? DEFAULT_TRANSFORM_TOOL),
    transform: getSelectedTransform(
      selectedId,
      snapshot.objectTransforms ?? DEFAULT_PROCEDURAL_TRANSFORMS,
    ),
    display: snapshot.display,
    importStatus,
    importError: snapshot.importedAssetName
      ? `Re-import ${snapshot.importedAssetName} to restore external asset content`
      : null,
  };
}
