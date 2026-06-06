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

export function getDragOverlayMessage(isSupported: boolean) {
  return isSupported
    ? "Drop GLB / glTF to import"
    : "Only .glb and .gltf files are supported";
}
