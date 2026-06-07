import type { NodeKind, SceneNode } from "../types";
import { getMaterialBindingForSelection } from "./editor-bindings";
import { resolvePreviewTargetIds } from "./selection-preview";

export type ScenePanelTab = "scene" | "assets" | "materials";

const TAB_KIND_FILTERS: Record<ScenePanelTab, Set<NodeKind>> = {
  scene: new Set(["group", "mesh", "material", "texture", "light", "camera"]),
  assets: new Set(["group", "mesh", "texture"]),
  materials: new Set(["group", "material"]),
};

function cloneWithChildren(node: SceneNode, children: SceneNode[] | undefined): SceneNode {
  return {
    ...node,
    ...(children ? { children } : {}),
  };
}

function findNodePathById(node: SceneNode, targetId: string): SceneNode[] | null {
  if (node.id === targetId) {
    return [node];
  }

  for (const child of node.children ?? []) {
    const nestedPath = findNodePathById(child, targetId);

    if (nestedPath) {
      return [node, ...nestedPath];
    }
  }

  return null;
}

export function findSceneNodeById(node: SceneNode, targetId: string): SceneNode | null {
  if (node.id === targetId) {
    return node;
  }

  for (const child of node.children ?? []) {
    const nested = findSceneNodeById(child, targetId);

    if (nested) {
      return nested;
    }
  }

  return null;
}

function collectTreeIds(node: SceneNode, ids: Set<string>) {
  ids.add(node.id);
  node.children?.forEach((child) => collectTreeIds(child, ids));
}

function collectMatchingIds(
  node: SceneNode,
  predicate: (candidate: SceneNode) => boolean,
  ids: Set<string>,
): boolean {
  const childMatched =
    node.children?.some((child) => collectMatchingIds(child, predicate, ids)) ?? false;
  const selfMatched = predicate(node);

  if (selfMatched || childMatched) {
    ids.add(node.id);
    return true;
  }

  return false;
}

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

function resolveImportedMaterialId(selectedId: string) {
  if (!selectedId.startsWith("imported-node:")) {
    return null;
  }

  const textureMarker = ":texture:";
  const textureIndex = selectedId.indexOf(textureMarker);

  if (textureIndex !== -1) {
    return selectedId.slice(0, textureIndex);
  }

  if (selectedId.includes(":material:")) {
    return selectedId;
  }

  return null;
}

function filterTreeByKinds(node: SceneNode, kinds: Set<NodeKind>): SceneNode | null {
  const children = node.children
    ?.map((child) => filterTreeByKinds(child, kinds))
    .filter((child): child is SceneNode => child !== null);

  const shouldKeepNode =
    node.kind === "group"
      ? Boolean(children?.length)
      : kinds.has(node.kind);

  if (!shouldKeepNode) {
    return null;
  }

  return cloneWithChildren(node, children);
}

export function getScenePanelTreeForTab(tree: SceneNode, tab: ScenePanelTab) {
  return filterTreeByKinds(tree, TAB_KIND_FILTERS[tab]) ?? tree;
}

export function collectRelatedSceneNodeIds(
  tree: SceneNode,
  selectedId: string,
  tab: ScenePanelTab,
) {
  const ids = new Set<string>();

  if (selectedId === "imported-root") {
    collectTreeIds(tree, ids);
    return ids;
  }

  const ownerObjectId = resolveImportedOwnerObjectId(selectedId);
  const materialId = resolveImportedMaterialId(selectedId);
  const textureId = selectedId.includes(":texture:") ? selectedId : null;

  if (ownerObjectId) {
    const objectPath = findNodePathById(tree, ownerObjectId);
    objectPath?.forEach((node) => ids.add(node.id));

    if (tab !== "materials") {
      if (textureId) {
        const texturePath = findNodePathById(tree, textureId);
        texturePath?.forEach((node) => ids.add(node.id));
      } else if (materialId) {
        collectMatchingIds(
          tree,
          (node) => node.id.startsWith(`${materialId}:texture:`),
          ids,
        );
      } else {
        collectMatchingIds(
          tree,
          (node) => node.id.startsWith(`${ownerObjectId}:material:`) && node.id.includes(":texture:"),
          ids,
        );
      }
    }

    if (tab !== "assets") {
      if (materialId) {
        const materialPath = findNodePathById(tree, materialId);
        materialPath?.forEach((node) => ids.add(node.id));
      } else {
        collectMatchingIds(
          tree,
          (node) =>
            node.kind === "material" && node.id.startsWith(`${ownerObjectId}:material:`),
          ids,
        );
      }
    }

    if (materialId && tab === "assets") {
      ids.add(materialId);
    }

    return ids;
  }

  if (selectedId.startsWith("mesh-")) {
    const meshPath = findNodePathById(tree, selectedId);
    meshPath?.forEach((node) => ids.add(node.id));
    const materialIdForMesh = getMaterialBindingForSelection(selectedId);
    if (tab !== "assets" && materialIdForMesh) {
      const materialPath = findNodePathById(tree, materialIdForMesh);
      materialPath?.forEach((node) => ids.add(node.id));
    }
    return ids;
  }

  if (selectedId.startsWith("mat-")) {
    if (tab !== "assets") {
      const materialPath = findNodePathById(tree, selectedId);
      materialPath?.forEach((node) => ids.add(node.id));
    }
    if (tab !== "materials") {
      const previewIds = resolvePreviewTargetIds(selectedId);
      previewIds.forEach((previewId) => {
        findNodePathById(tree, previewId)?.forEach((node) => ids.add(node.id));
      });
    }
  }

  return ids;
}

export function filterSceneTreeByRelatedSelection(
  tree: SceneNode,
  selectedId: string,
  tab: ScenePanelTab,
): SceneNode | null {
  const relatedIds = collectRelatedSceneNodeIds(tree, selectedId, tab);

  if (!relatedIds.size) {
    return tree;
  }

  function filterNode(node: SceneNode): SceneNode | null {
    const children = node.children
      ?.map((child) => filterNode(child))
      .filter((child): child is SceneNode => child !== null);
    const selfIncluded = relatedIds.has(node.id);

    if (!selfIncluded && !children?.length) {
      return null;
    }

    return cloneWithChildren(node, children);
  }

  return filterNode(tree);
}

export function filterSceneTreeByQuery(tree: SceneNode, query: string): SceneNode | null {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return tree;
  }

  const children = tree.children
    ?.map((child) => filterSceneTreeByQuery(child, normalized))
    .filter((child): child is SceneNode => child !== null);
  const selfMatches = tree.name.toLowerCase().includes(normalized);

  if (!selfMatches && !children?.length) {
    return null;
  }

  if (selfMatches && !tree.children?.length) {
    return tree;
  }

  return cloneWithChildren(tree, children);
}
