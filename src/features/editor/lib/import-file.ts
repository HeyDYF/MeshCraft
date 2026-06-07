import type { Locale } from "../types";
import { getCopy } from "./ui-copy";

const SUPPORTED_IMPORT_EXTENSIONS = [".glb", ".gltf"] as const;

type NamedFileLike = {
  name: string;
};

export function isSupportedImportFile(file: NamedFileLike | null | undefined) {
  if (!file?.name) {
    return false;
  }

  const lowerName = file.name.toLowerCase();
  return SUPPORTED_IMPORT_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension),
  );
}

export function pickImportFile<T extends NamedFileLike>(files: Iterable<T>) {
  for (const file of files) {
    if (isSupportedImportFile(file)) {
      return file;
    }
  }

  return null;
}

export function getDragOverlayMessage(locale: Locale, isSupported: boolean) {
  return isSupported
    ? locale === "zh-CN"
      ? "释放以导入 GLB / glTF"
      : "Drop GLB / glTF to import"
    : getCopy(locale, "importStatus.invalidAsset");
}

export function readFileAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to serialize file"));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}
