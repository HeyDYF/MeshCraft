import type { MaterialState, SceneNode } from "../types";

export type ImportedMaterialSlotOption = {
  materialId: string;
  materialName: string | null;
  slotIndex: number;
};

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
  return getImportedMaterialSlotOptions(selectedId, importedMaterialLibrary).map(
    (option) => option.materialId,
  );
}

function findSceneNodeName(node: SceneNode, targetId: string): string | null {
  if (node.id === targetId) {
    return node.name;
  }

  for (const child of node.children ?? []) {
    const match = findSceneNodeName(child, targetId);
    if (match) {
      return match;
    }
  }

  return null;
}

export function getImportedMaterialSlotOptions(
  selectedId: string,
  importedMaterialLibrary: Record<string, MaterialState>,
  sceneTree?: SceneNode,
): ImportedMaterialSlotOption[] {
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
    })
    .map((materialId) => ({
      materialId,
      materialName: sceneTree ? findSceneNodeName(sceneTree, materialId) : null,
      slotIndex: Number(materialId.slice(materialId.lastIndexOf(":material:") + 10)),
    }));
}
