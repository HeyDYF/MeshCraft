import * as THREE from "three";
import type {
  MaterialState,
  MaterialTextureSlot,
  NodeKind,
  SceneNode,
} from "../../editor/types";
import {
  buildImportedObjectRegistry,
  getImportedObjectId,
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

function formatImportedMaterialNodeName(
  object: THREE.Object3D,
  objectId: string,
  material: THREE.Material,
  materialIndex: number,
) {
  const objectName = safeName(object, `Mesh_${objectId}`);
  const materialName = material.name.trim() || "Material";
  return `${objectName} · Slot ${materialIndex + 1} · ${materialName}`;
}

function formatImportedTextureNodeName(
  object: THREE.Object3D,
  objectId: string,
  texture: THREE.Texture,
  channel: string,
  materialIndex: number,
) {
  const objectName = safeName(object, `Mesh_${objectId}`);
  const textureName = texture.name.trim() || `Texture_${channel}`;
  return `${objectName} · Slot ${materialIndex + 1} · ${channel} · ${textureName}`;
}

function pushNode(groups: Map<NodeKind, SceneNode[]>, kind: NodeKind, node: SceneNode) {
  const bucket = groups.get(kind) ?? [];
  bucket.push(node);
  groups.set(kind, bucket);
}

function createImportedHierarchyNode(
  object: THREE.Object3D,
  objectId: string,
): SceneNode | null {
  const childNodes = object.children
    .map((child, index) => createImportedHierarchyNode(child, `${objectId}/${index}`))
    .filter((child): child is SceneNode => child !== null);

  if (object instanceof THREE.Mesh) {
    const positionCount = object.geometry.attributes.position?.count ?? 0;

    return {
      id: objectId,
      name: safeName(object, `Mesh_${objectId}`),
      kind: "mesh",
      tris: Math.floor(positionCount / 3),
      ...(childNodes.length ? { children: childNodes } : {}),
    };
  }

  if (object instanceof THREE.Light) {
    return null;
  }

  if (object instanceof THREE.Camera) {
    return null;
  }

  if (!childNodes.length) {
    return null;
  }

  return {
    id: objectId,
    name: safeName(object, `Group_${objectId}`),
    kind: "group",
    children: childNodes,
  };
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

function getTexturePreviewUrl(texture: THREE.Texture) {
  const candidate = texture.source.data ?? texture.image;

  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  const maybeCurrentSrc = "currentSrc" in candidate ? candidate.currentSrc : undefined;
  if (typeof maybeCurrentSrc === "string" && maybeCurrentSrc.length > 0) {
    return maybeCurrentSrc;
  }

  const maybeSrc = "src" in candidate ? candidate.src : undefined;
  if (typeof maybeSrc === "string" && maybeSrc.length > 0) {
    return maybeSrc;
  }

  return undefined;
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
  const sceneNodes = root.children
    .map((child, index) => createImportedHierarchyNode(child, getImportedObjectId([index])))
    .filter((child): child is SceneNode => child !== null);

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
          name: formatImportedMaterialNodeName(object, objectId, material, index),
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
              name: formatImportedTextureNodeName(
                object,
                objectId,
                value,
                channel,
                index,
              ),
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
  const materialNodes = groups.get("material");
  const textureNodes = groups.get("texture");
  const lightingNodes = [...(groups.get("light") ?? []), ...(groups.get("camera") ?? [])];

  if (sceneNodes.length) {
    children.push({
      id: "imported-group:scene",
      name: "Scene",
      kind: "group",
      children: sceneNodes,
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
          previewUrl: getTexturePreviewUrl(value),
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
