import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  buildImportedObjectRegistry,
  getImportedMaterialId,
  getImportedObjectId,
  getImportedTextureNodeId,
} from "./imported-node-ids";

function createSceneVariant() {
  const root = new THREE.Group();

  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial(),
  );
  shell.name = "Shell";

  const subGroup = new THREE.Group();
  subGroup.name = "Nested";

  const bolt = new THREE.Mesh(
    new THREE.SphereGeometry(),
    new THREE.MeshStandardMaterial(),
  );
  bolt.name = "Bolt";

  subGroup.add(bolt);
  root.add(shell, subGroup);

  return { root, shell, subGroup, bolt };
}

describe("imported node id helpers", () => {
  it("builds stable path-based object and material ids", () => {
    expect(getImportedObjectId([0])).toBe("imported-node:0");
    expect(getImportedObjectId([1, 0])).toBe("imported-node:1/0");
    expect(getImportedMaterialId("imported-node:1/0", 2)).toBe(
      "imported-node:1/0:material:2",
    );
    expect(
      getImportedTextureNodeId("imported-node:1/0:material:2", "normalMap"),
    ).toBe("imported-node:1/0:material:2:texture:normalMap");
  });

  it("produces the same registry ids for equivalent scene hierarchies", () => {
    const a = createSceneVariant();
    const b = createSceneVariant();

    a.shell.uuid = "runtime-a-shell";
    a.subGroup.uuid = "runtime-a-group";
    a.bolt.uuid = "runtime-a-bolt";
    b.shell.uuid = "runtime-b-shell";
    b.subGroup.uuid = "runtime-b-group";
    b.bolt.uuid = "runtime-b-bolt";

    const registryA = buildImportedObjectRegistry(a.root);
    const registryB = buildImportedObjectRegistry(b.root);

    expect([...registryA.keys()]).toEqual([
      "imported-node:0",
      "imported-node:1",
      "imported-node:1/0",
    ]);
    expect([...registryB.keys()]).toEqual([...registryA.keys()]);
  });
});
