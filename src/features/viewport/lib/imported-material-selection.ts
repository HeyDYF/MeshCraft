import type { MaterialState } from "../../editor/types";

export function resolveImportedMaterialSelection(
  objectId: string,
  materialIndex: number,
  importedMaterialLibrary: Record<string, MaterialState>,
) {
  const directMaterialId = `${objectId}:material:${materialIndex}`;

  if (directMaterialId in importedMaterialLibrary) {
    return directMaterialId;
  }

  const fallbackMaterialId = Object.keys(importedMaterialLibrary)
    .filter((materialId) => materialId.startsWith(`${objectId}:material:`))
    .sort()[0];

  return fallbackMaterialId ?? null;
}
