import type { TransformState } from "../../editor/types";
import type * as THREE from "three";

function snapshotObjectTransform(object: THREE.Object3D): TransformState {
  return {
    position: {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
    },
    rotation: {
      x: object.rotation.x,
      y: object.rotation.y,
      z: object.rotation.z,
    },
    scale: {
      x: object.scale.x,
      y: object.scale.y,
      z: object.scale.z,
    },
  };
}

export function buildImportedTransformRegistry(
  rootTransform: TransformState,
  objectMap: Map<string, THREE.Object3D>,
) {
  const registry: Record<string, TransformState> = {
    "imported-root": rootTransform,
  };

  objectMap.forEach((object, objectId) => {
    registry[objectId] = snapshotObjectTransform(object);
  });

  return registry;
}
