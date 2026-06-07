import type { NodeKind, SceneNode } from "../types";

type AnalyzeSceneSummary = {
  totalNodes: number;
  groups: number;
  meshes: number;
  materials: number;
  textures: number;
  lights: number;
  cameras: number;
  topLevelChildren: number;
  totalTriangles: number;
};

type AnalyzeSelectionSummary = {
  id: string;
  kind: NodeKind | null;
  name: string | null;
  triangles: number | null;
  childCount: number;
  path: string[];
  activeMaterialId: string | null;
};

export type AnalyzeSummary = {
  scene: AnalyzeSceneSummary;
  selection: AnalyzeSelectionSummary;
};

function createEmptySceneSummary(root: SceneNode): AnalyzeSceneSummary {
  return {
    totalNodes: 0,
    groups: 0,
    meshes: 0,
    materials: 0,
    textures: 0,
    lights: 0,
    cameras: 0,
    topLevelChildren: root.children?.length ?? 0,
    totalTriangles: 0,
  };
}

function visitScene(node: SceneNode, scene: AnalyzeSceneSummary) {
  scene.totalNodes += 1;

  if (node.kind === "group") {
    scene.groups += 1;
  }

  if (node.kind === "mesh") {
    scene.meshes += 1;
    scene.totalTriangles += node.tris ?? 0;
  }

  if (node.kind === "material") {
    scene.materials += 1;
  }

  if (node.kind === "texture") {
    scene.textures += 1;
  }

  if (node.kind === "light") {
    scene.lights += 1;
  }

  if (node.kind === "camera") {
    scene.cameras += 1;
  }

  node.children?.forEach((child) => visitScene(child, scene));
}

function findNodePath(node: SceneNode, targetId: string, path: SceneNode[] = []): SceneNode[] | null {
  const nextPath = [...path, node];

  if (node.id === targetId) {
    return nextPath;
  }

  for (const child of node.children ?? []) {
    const match = findNodePath(child, targetId, nextPath);

    if (match) {
      return match;
    }
  }

  return null;
}

export function deriveAnalyzeSummary(
  sceneTree: SceneNode,
  selectedId: string,
  activeMaterialId: string | null,
): AnalyzeSummary {
  const scene = createEmptySceneSummary(sceneTree);
  visitScene(sceneTree, scene);

  const selectedPath = findNodePath(sceneTree, selectedId);
  const selectedNode = selectedPath?.[selectedPath.length - 1] ?? null;

  return {
    scene,
    selection: {
      id: selectedId,
      kind: selectedNode?.kind ?? null,
      name: selectedNode?.name ?? null,
      triangles: selectedNode?.kind === "mesh" ? (selectedNode.tris ?? 0) : null,
      childCount: selectedNode?.children?.length ?? 0,
      path: selectedPath?.map((node) => node.name) ?? [],
      activeMaterialId,
    },
  };
}
