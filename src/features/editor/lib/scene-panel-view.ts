import type { NodeKind, SceneNode } from "../types";

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
