import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import type * as THREE from "three";

export function buildExportFileName(importedAssetName: string | null) {
  if (!importedAssetName) {
    return "meshcraft-scene.glb";
  }

  const stem = importedAssetName.replace(/\.(glb|gltf)$/i, "");
  return `${stem}-export.glb`;
}

export function getExportOptions() {
  return {
    binary: true,
    onlyVisible: true,
  } as const;
}

export async function exportSceneToGlb(
  object: THREE.Object3D,
  importedAssetName: string | null,
) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(object, getExportOptions());

  if (!(result instanceof ArrayBuffer)) {
    throw new Error("Expected binary glTF export");
  }

  const blob = new Blob([result], { type: "model/gltf-binary" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = buildExportFileName(importedAssetName);
  link.click();
  URL.revokeObjectURL(objectUrl);
}
