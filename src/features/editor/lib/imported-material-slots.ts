import type { MaterialState } from "../types";

function resolveImportedOwnerObjectId(selectedId: string) {
  if (!selectedId.startsWith("imported-node:")) {
    return null;
  }

  const materialMarker = ":material:";
  const materialIndex = selectedId.indexOf(materialMarker);

  if (materialIndex === -1) {
    return selectedId;
  }

  return selectedId.slice(0, materialIndex);
}

export function getImportedMaterialSlotsForSelection(
  selectedId: string,
  importedMaterialLibrary: Record<string, MaterialState>,
) {
  const ownerObjectId = resolveImportedOwnerObjectId(selectedId);

  if (!ownerObjectId) {
    return [];
  }

  return Object.keys(importedMaterialLibrary)
    .filter((materialId) => materialId.startsWith(`${ownerObjectId}:material:`))
    .sort((left, right) => {
      const leftIndex = Number(left.slice(left.lastIndexOf(":material:") + 10));
      const rightIndex = Number(right.slice(right.lastIndexOf(":material:") + 10));
      return leftIndex - rightIndex;
    });
}
