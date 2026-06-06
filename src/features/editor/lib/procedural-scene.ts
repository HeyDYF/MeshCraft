import { getSelectionCapabilities } from "./editor-bindings";
import type { TransformState } from "../types";

export const DEFAULT_PROCEDURAL_TRANSFORMS: Record<string, TransformState> = {
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
    position: { x: 0, y: 0.2, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
};

export function getSelectedTransform(
  selectedId: string,
  transforms: Record<string, TransformState>,
  fallback: TransformState = DEFAULT_PROCEDURAL_TRANSFORMS["mesh-core"],
) {
  return getSelectionCapabilities(selectedId).canTransform
    ? (transforms[selectedId] ?? fallback)
    : fallback;
}

export function updateSelectedTransform(
  transforms: Record<string, TransformState>,
  selectedId: string,
  nextTransform: TransformState,
) {
  if (!getSelectionCapabilities(selectedId).canTransform) {
    return transforms;
  }

  return {
    ...transforms,
    [selectedId]: nextTransform,
  };
}
