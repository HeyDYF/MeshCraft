import type { TransformState } from "../types";

export function resolveSelectionTransform(
  selectedId: string,
  proceduralTransforms: Record<string, TransformState>,
  importedTransforms: Record<string, TransformState>,
  fallback: TransformState,
) {
  if (selectedId in proceduralTransforms) {
    return proceduralTransforms[selectedId];
  }

  if (selectedId in importedTransforms) {
    return importedTransforms[selectedId];
  }

  return fallback;
}

export function updateSelectionTransformMaps(
  selectedId: string,
  nextTransform: TransformState,
  proceduralTransforms: Record<string, TransformState>,
  importedTransforms: Record<string, TransformState>,
) {
  if (selectedId in proceduralTransforms) {
    return {
      proceduralTransforms: {
        ...proceduralTransforms,
        [selectedId]: nextTransform,
      },
      importedTransforms,
    };
  }

  if (selectedId in importedTransforms) {
    return {
      proceduralTransforms,
      importedTransforms: {
        ...importedTransforms,
        [selectedId]: nextTransform,
      },
    };
  }

  return {
    proceduralTransforms,
    importedTransforms,
  };
}
