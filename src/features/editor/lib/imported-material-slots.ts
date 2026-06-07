import type { MaterialState } from "../types";

export function getImportedMaterialSlotsForSelection(
  selectedId: string,
  importedMaterialLibrary: Record<string, MaterialState>,
) {
  if (!selectedId.startsWith("imported-node:") || selectedId.includes(":material:")) {
    return [];
  }

  return Object.keys(importedMaterialLibrary)
    .filter((materialId) => materialId.startsWith(`${selectedId}:material:`))
    .sort((left, right) => {
      const leftIndex = Number(left.slice(left.lastIndexOf(":material:") + 10));
      const rightIndex = Number(right.slice(right.lastIndexOf(":material:") + 10));
      return leftIndex - rightIndex;
    });
}
