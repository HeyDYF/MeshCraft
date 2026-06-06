import type { MaterialState } from "../types";

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

export function getSelectionCapabilities(selectedId: string) {
  return {
    canTransform: selectedId.startsWith("mesh-") || selectedId === "imported-root",
    canEditMaterial: getMaterialBindingForSelection(selectedId) !== null,
  };
}
