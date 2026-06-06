import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildImportedTransformRegistry } from "./imported-transform-registry";
import { buildImportedObjectRegistry } from "./imported-node-ids";

describe("buildImportedTransformRegistry", () => {
  it("captures a dedicated imported-root transform alongside child object transforms", () => {
    const child = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    child.position.set(4, 5, 6);
    child.rotation.set(0.1, 0.2, 0.3);
    child.scale.set(2, 2, 2);
    const root = new THREE.Group();
    root.add(child);

    const registry = buildImportedTransformRegistry(
      {
        position: { x: 0, y: -1.15, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      buildImportedObjectRegistry(root),
    );

    expect(registry["imported-root"]).toEqual({
      position: { x: 0, y: -1.15, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    expect(registry["imported-node:0"]).toEqual({
      position: { x: 4, y: 5, z: 6 },
      rotation: { x: 0.1, y: 0.2, z: 0.3 },
      scale: { x: 2, y: 2, z: 2 },
    });
  });
});
