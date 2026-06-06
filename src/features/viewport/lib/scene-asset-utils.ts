import * as THREE from "three";
import type {
  MaterialState,
  MaterialTextureSlot,
  NodeKind,
  SceneNode,
} from "../../editor/types";
import {
  buildImportedObjectRegistry,
  getImportedMaterialId,
  getImportedTextureNodeId,
} from "./imported-node-ids";

type SceneMetrics = {
  triangles: number;
  materials: number;
  textures: number;
};

function safeName(object: THREE.Object3D, fallback: string) {
  return object.name.trim() || fallback;
}

function pushNode(groups: Map<NodeKind, SceneNode[]>, kind: NodeKind, node: SceneNode) {
  const bucket = groups.get(kind) ?? [];
  bucket.push(node);
  groups.set(kind, bucket);
}

function collectTexturesFromMaterial(
  material: THREE.Material,
  textures: Set<THREE.Texture>,
) {
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) {
      textures.add(value);
    }
  });
}

function materialArray(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material) ? material : [material];
}

function getNumericMaterialProperty(
  material: THREE.Material,
  key: string,
  fallback: number,
) {
  const value = (material as unknown as Record<string, unknown>)[key];
  return typeof value === "number" ? value : fallback;
}

export function collectSceneMetrics(root: THREE.Object3D): SceneMetrics {
  let triangles = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      const positionCount = geometry.attributes.position?.count ?? 0;
      triangles += Math.floor(positionCount / 3);

      materialArray(object.material).forEach((material) => {
        materials.add(material);
        collectTexturesFromMaterial(material, textures);
      });
    }
  });

  return {
    triangles,
    materials: materials.size,
    textures: textures.size,
  };
}

export function buildImportedSceneTree(
  root: THREE.Object3D,
  assetName: string,
): SceneNode {
  const groups = new Map<NodeKind, SceneNode[]>();
  const textureIds = new Set<string>();
  const objectRegistry = buildImportedObjectRegistry(root);

  objectRegistry.forEach((object, objectId) => {
    if (object instanceof THREE.Mesh) {
      const positionCount = object.geometry.attributes.position?.count ?? 0;
      pushNode(groups, "mesh", {
        id: objectId,
        name: safeName(object, `Mesh_${groups.get("mesh")?.length ?? 0}`),
        kind: "mesh",
        tris: Math.floor(positionCount / 3),
      });

      materialArray(object.material).forEach((material, index) => {
        const materialId = getImportedMaterialId(objectId, index);
        pushNode(groups, "material", {
          id: materialId,
          name: material.name.trim() || `${safeName(object, "Mesh")}_Material_${index + 1}`,
          kind: "material",
        });

        Object.entries(material).forEach(([channel, value]) => {
          if (value instanceof THREE.Texture) {
            const textureId = getImportedTextureNodeId(materialId, channel);
            if (textureIds.has(textureId)) {
              return;
            }

            textureIds.add(textureId);
            pushNode(groups, "texture", {
              id: textureId,
              name: value.name.trim() || `${safeName(object, "Mesh")}_Texture_${textureIds.size}`,
              kind: "texture",
            });
          }
        });
      });
      return;
    }

    if (object instanceof THREE.Light) {
      pushNode(groups, "light", {
        id: objectId,
        name: safeName(object, "Light"),
        kind: "light",
      });
      return;
    }

    if (object instanceof THREE.Camera) {
      pushNode(groups, "camera", {
        id: objectId,
        name: safeName(object, "Camera"),
        kind: "camera",
      });
    }
  });

  const children: SceneNode[] = [];
  const meshNodes = groups.get("mesh");
  const materialNodes = groups.get("material");
  const textureNodes = groups.get("texture");
  const lightingNodes = [...(groups.get("light") ?? []), ...(groups.get("camera") ?? [])];

  if (meshNodes?.length) {
    children.push({
      id: "imported-group:meshes",
      name: "Meshes",
      kind: "group",
      children: meshNodes,
    });
  }

  if (materialNodes?.length) {
    children.push({
      id: "imported-group:materials",
      name: "Materials",
      kind: "group",
      children: materialNodes,
    });
  }

  if (textureNodes?.length) {
    children.push({
      id: "imported-group:textures",
      name: "Textures",
      kind: "group",
      children: textureNodes,
    });
  }

  if (lightingNodes.length) {
    children.push({
      id: "imported-group:lighting",
      name: "Lighting",
      kind: "group",
      children: lightingNodes,
    });
  }

  return {
    id: "imported-root",
    name: assetName,
    kind: "group",
    children,
  };
}

export function disposeSceneResources(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      materialArray(object.material).forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        });
        material.dispose();
      });
    }
  });
}

export function summarizeSceneTree(root: SceneNode) {
  const summary = {
    meshes: 0,
    materials: 0,
    textures: 0,
  };

  function visit(node: SceneNode) {
    if (node.kind === "mesh") {
      summary.meshes += 1;
    }

    if (node.kind === "material") {
      summary.materials += 1;
    }

    if (node.kind === "texture") {
      summary.textures += 1;
    }

    node.children?.forEach(visit);
  }

  visit(root);

  return summary;
}

export function extractImportedMaterialBindings(root: THREE.Object3D) {
  const materialLibrary: Record<string, MaterialState> = {};
  const nodeMaterialBindings: Record<string, string> = {};
  const materialTextureSlots: Record<string, MaterialTextureSlot[]> = {};
  const objectRegistry = buildImportedObjectRegistry(root);

  objectRegistry.forEach((object, objectId) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    materialArray(object.material).forEach((material, index) => {
      const materialId = getImportedMaterialId(objectId, index);
      const color =
        "color" in material && material.color instanceof THREE.Color
          ? `#${material.color.getHexString()}`
          : "#808080";
      const emissive =
        "emissive" in material && material.emissive instanceof THREE.Color
          ? material.emissive.getHexString()
          : "000000";

      materialLibrary[materialId] = {
        baseColor: color,
        metalness: getNumericMaterialProperty(material, "metalness", 0),
        roughness: getNumericMaterialProperty(material, "roughness", 1),
        emission: parseInt(emissive, 16) === 0 ? 0 : 1,
        opacity: getNumericMaterialProperty(material, "opacity", 1),
      };
      materialTextureSlots[materialId] = Object.entries(material)
        .filter(([, value]) => value instanceof THREE.Texture)
        .map(([channel, value]) => ({
          channel,
          textureId: getImportedTextureNodeId(materialId, channel),
          textureName: value.name.trim() || `${material.name.trim() || materialId}_${channel}`,
        }));
      nodeMaterialBindings[materialId] = materialId;
      if (index === 0) {
        nodeMaterialBindings[objectId] = materialId;
      }
    });
  });

  return {
    materialLibrary,
    nodeMaterialBindings,
    materialTextureSlots,
  };
}
