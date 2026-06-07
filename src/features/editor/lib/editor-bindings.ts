import type { MaterialState } from "../types";

type SelectionCapabilityOptions = {
  importedTransformIds?: Iterable<string>;
  importedMaterialBindings?: Record<string, string>;
};

export const DEFAULT_MATERIAL_LIBRARY: Record<string, MaterialState> = {
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
};

const MATERIAL_BINDINGS: Record<string, string> = {
  "mesh-housing": "mat-steel",
  "mesh-vents": "mat-steel",
  "mesh-bolts": "mat-steel",
  "mesh-core": "mat-carbon",
  "mat-steel": "mat-steel",
  "mat-carbon": "mat-carbon",
  "mat-glow": "mat-glow",
};

export function getMaterialBindingForSelection(selectedId: string) {
  return MATERIAL_BINDINGS[selectedId] ?? null;
}

export function resolveSelectionMaterialBinding(
  selectedId: string,
  importedMaterialBindings: Record<string, string> = {},
) {
  const directBinding =
    getMaterialBindingForSelection(selectedId) ?? importedMaterialBindings[selectedId] ?? null;

  if (directBinding) {
    return directBinding;
  }

  const textureMarker = ":texture:";
  const textureMarkerIndex = selectedId.lastIndexOf(textureMarker);

  if (textureMarkerIndex !== -1) {
    const materialId = selectedId.slice(0, textureMarkerIndex);
    return importedMaterialBindings[materialId] ?? materialId;
  }

  return null;
}

export function getSelectionCapabilities(
  selectedId: string,
  options: SelectionCapabilityOptions = {},
) {
  const importedTransformIds = new Set(options.importedTransformIds ?? []);
  const importedMaterialBindings = options.importedMaterialBindings ?? {};
  const canTransform =
    selectedId.startsWith("mesh-") ||
    selectedId === "imported-root" ||
    importedTransformIds.has(selectedId);
  const canEditMaterial =
    resolveSelectionMaterialBinding(selectedId, importedMaterialBindings) !== null;

  return {
    canTransform,
    canEditMaterial,
  };
}
