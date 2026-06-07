import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import {
  buildImportedSceneTree,
  extractImportedMaterialBindings,
  collectSceneMetrics,
  disposeSceneResources,
  summarizeSceneTree,
} from "./scene-asset-utils";
import {
  getImportedMaterialId,
  getImportedObjectId,
  getImportedTextureNodeId,
} from "./imported-node-ids";

function makeTexture() {
  const texture = new THREE.Texture();
  texture.dispose = vi.fn();
  return texture;
}

describe("buildImportedSceneTree", () => {
  it("preserves imported object hierarchy while still exposing materials, textures, and lighting groups", () => {
    const scene = new THREE.Group();
    scene.name = "ImportedAsset";

    const hullGroup = new THREE.Group();
    hullGroup.name = "HullGroup";

    const meshGeometry = new THREE.BufferGeometry();
    meshGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          0, 0, 0,
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
          1, 0, 1,
          0, 1, 1,
        ],
        3,
      ),
    );
    const colorMap = makeTexture();
    colorMap.name = "shell_albedo";
    const meshMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: colorMap,
    });
    meshMaterial.name = "ShellMaterial";
    const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
    mesh.name = "HousingShell";
    hullGroup.add(mesh);

    const light = new THREE.DirectionalLight("#ffffff", 1);
    light.name = "KeyLight";

    const camera = new THREE.PerspectiveCamera();
    camera.name = "ReviewCamera";

    scene.add(hullGroup, light, camera);

    const tree = buildImportedSceneTree(scene, "ImportedAsset");

    expect(tree.name).toBe("ImportedAsset");
    expect(tree.children?.map((node) => node.name)).toEqual([
      "Scene",
      "Materials",
      "Textures",
      "Lighting",
    ]);
    expect(tree.children?.[0]?.children?.[0]).toMatchObject({
      id: getImportedObjectId([0]),
      name: "HullGroup",
      kind: "group",
    });
    expect(tree.children?.[0]?.children?.[0]?.children?.[0]).toMatchObject({
      id: getImportedObjectId([0, 0]),
      name: "HousingShell",
      kind: "mesh",
      tris: 2,
    });
    expect(tree.children?.[1]?.children?.[0]).toMatchObject({
      id: getImportedMaterialId(getImportedObjectId([0, 0]), 0),
      name: "ShellMaterial",
      kind: "material",
    });
    expect(tree.children?.[2]?.children?.[0]).toMatchObject({
      id: getImportedTextureNodeId(
        getImportedMaterialId(getImportedObjectId([0, 0]), 0),
        "map",
      ),
      name: "shell_albedo",
      kind: "texture",
    });
    expect(tree.children?.[3]?.children?.map((node) => node.name)).toEqual([
      "KeyLight",
      "ReviewCamera",
    ]);
  });
});

describe("collectSceneMetrics", () => {
  it("counts triangles, materials and textures from an imported scene", () => {
    const colorMap = makeTexture();
    const normalMap = makeTexture();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          0, 0, 0,
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
          1, 0, 1,
          0, 1, 1,
          1, 1, 1,
          1, 1, 0,
          0, 1, 1,
        ],
        3,
      ),
    );
    const material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: colorMap,
      normalMap,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const scene = new THREE.Group();
    scene.add(mesh);

    const metrics = collectSceneMetrics(scene);

    expect(metrics.triangles).toBe(3);
    expect(metrics.materials).toBe(1);
    expect(metrics.textures).toBe(2);
  });
});

describe("disposeSceneResources", () => {
  it("disposes nested geometry, material arrays and textures", () => {
    const colorMap = makeTexture();
    const emissiveMap = makeTexture();
    const geometry = new THREE.BoxGeometry();
    geometry.dispose = vi.fn();
    const materialA = new THREE.MeshStandardMaterial({ map: colorMap });
    const materialB = new THREE.MeshStandardMaterial({ emissiveMap });
    materialA.dispose = vi.fn();
    materialB.dispose = vi.fn();
    const mesh = new THREE.Mesh(geometry, [materialA, materialB]);
    const scene = new THREE.Group();
    scene.add(mesh);

    disposeSceneResources(scene);

    expect(geometry.dispose).toHaveBeenCalledTimes(1);
    expect(materialA.dispose).toHaveBeenCalledTimes(1);
    expect(materialB.dispose).toHaveBeenCalledTimes(1);
    expect(colorMap.dispose).toHaveBeenCalledTimes(1);
    expect(emissiveMap.dispose).toHaveBeenCalledTimes(1);
  });
});

describe("extractImportedMaterialBindings", () => {
  it("extracts imported material library entries, mesh-to-material bindings, and texture slots", () => {
    const colorMap = makeTexture();
    colorMap.uuid = "albedo-uuid";
    colorMap.name = "paint_albedo";
    (colorMap.source as { data: { src: string } }).data = {
      src: "blob:paint-albedo-preview",
    };
    const normalMap = makeTexture();
    normalMap.uuid = "normal-uuid";
    normalMap.name = "paint_normal";
    (normalMap.source as { data: { currentSrc: string } }).data = {
      currentSrc: "blob:paint-normal-preview",
    };
    const material = new THREE.MeshStandardMaterial({
      color: "#336699",
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      emissive: new THREE.Color("#112233"),
      map: colorMap,
      normalMap,
    });
    material.name = "ImportedPaint";

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
    const root = new THREE.Group();
    root.add(mesh);

    const bindings = extractImportedMaterialBindings(root);
    const objectId = getImportedObjectId([0]);
    const materialId = getImportedMaterialId(objectId, 0);

    expect(bindings.materialLibrary).toEqual({
      [materialId]: {
        baseColor: "#336699",
        metalness: 0.7,
        roughness: 0.2,
        emission: expect.any(Number),
        opacity: 0.8,
      },
    });
    expect(bindings.nodeMaterialBindings).toEqual({
      [objectId]: materialId,
      [materialId]: materialId,
    });
    expect(bindings.materialTextureSlots).toEqual({
      [materialId]: [
        {
          channel: "map",
          textureId: getImportedTextureNodeId(materialId, "map"),
          textureName: "paint_albedo",
          previewUrl: "blob:paint-albedo-preview",
        },
        {
          channel: "normalMap",
          textureId: getImportedTextureNodeId(materialId, "normalMap"),
          textureName: "paint_normal",
          previewUrl: "blob:paint-normal-preview",
        },
      ],
    });
  });
});

describe("summarizeSceneTree", () => {
  it("counts meshes, materials and textures recursively", () => {
    const summary = summarizeSceneTree({
      id: "root",
      name: "ImportedAsset",
      kind: "group",
      children: [
        {
          id: "meshes",
          name: "Meshes",
          kind: "group",
          children: [
            { id: "mesh-a", name: "A", kind: "mesh", tris: 12 },
            { id: "mesh-b", name: "B", kind: "mesh", tris: 24 },
          ],
        },
        {
          id: "materials",
          name: "Materials",
          kind: "group",
          children: [{ id: "mat-a", name: "Mat", kind: "material" }],
        },
        {
          id: "textures",
          name: "Textures",
          kind: "group",
          children: [{ id: "tex-a", name: "Tex", kind: "texture" }],
        },
      ],
    });

    expect(summary).toEqual({
      meshes: 2,
      materials: 1,
      textures: 1,
    });
  });
});
