import type * as THREE from "three";

export function getImportedObjectId(path: number[]) {
  return `imported-node:${path.join("/")}`;
}

export function getImportedMaterialId(objectId: string, materialIndex: number) {
  return `${objectId}:material:${materialIndex}`;
}

export function getImportedTextureNodeId(materialId: string, channel: string) {
  return `${materialId}:texture:${channel}`;
}

export function buildImportedObjectRegistry(root: THREE.Object3D) {
  const registry = new Map<string, THREE.Object3D>();

  function visit(parent: THREE.Object3D, parentPath: number[] = []) {
    parent.children.forEach((child, index) => {
      const path = [...parentPath, index];
      const objectId = getImportedObjectId(path);
      registry.set(objectId, child);
      visit(child, path);
    });
  }

  visit(root);

  return registry;
}

export function findImportedObjectId(
  registry: Map<string, THREE.Object3D>,
  target: THREE.Object3D | null | undefined,
) {
  let current = target ?? null;

  while (current) {
    for (const [id, object] of registry.entries()) {
      if (object === current) {
        return id;
      }
    }

    current = current.parent;
  }

  return null;
}
