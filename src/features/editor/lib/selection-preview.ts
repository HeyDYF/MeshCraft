const PROCEDURAL_MATERIAL_PREVIEW_TARGETS: Record<string, string[]> = {
  "mat-steel": ["mesh-housing", "mesh-vents", "mesh-bolts"],
  "mat-carbon": ["mesh-core"],
  "mat-glow": ["mesh-housing"],
};

type ResolvePreviewTargetOptions = {
  importedNodeMaterialBindings?: Record<string, string>;
};

function findImportedObjectsForMaterial(
  materialId: string,
  importedNodeMaterialBindings: Record<string, string>,
) {
  return Object.entries(importedNodeMaterialBindings)
    .filter(
      ([nodeId, bindingId]) =>
        nodeId.startsWith("imported-node:") &&
        !nodeId.includes(":material:") &&
        bindingId === materialId,
    )
    .map(([nodeId]) => nodeId);
}

export function resolvePreviewTargetIds(
  selectedId: string,
  options: ResolvePreviewTargetOptions = {},
) {
  if (
    selectedId === "imported-root" ||
    selectedId.startsWith("mesh-") ||
    (selectedId.startsWith("imported-node:") && !selectedId.includes(":material:"))
  ) {
    return [selectedId];
  }

  if (selectedId in PROCEDURAL_MATERIAL_PREVIEW_TARGETS) {
    return PROCEDURAL_MATERIAL_PREVIEW_TARGETS[selectedId];
  }

  const importedNodeMaterialBindings = options.importedNodeMaterialBindings ?? {};

  if (selectedId.includes(":texture:")) {
    const materialId = selectedId.slice(0, selectedId.lastIndexOf(":texture:"));
    return findImportedObjectsForMaterial(materialId, importedNodeMaterialBindings);
  }

  if (selectedId.includes(":material:")) {
    return findImportedObjectsForMaterial(selectedId, importedNodeMaterialBindings);
  }

  return [];
}
