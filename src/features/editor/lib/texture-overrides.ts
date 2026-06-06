export type TextureOverrideEntry = {
  name: string;
  objectUrl: string;
};

export type TextureOverrideMap = Record<string, Record<string, TextureOverrideEntry>>;

const SUPPORTED_TEXTURE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

export function isSupportedTextureFile(name: string) {
  const lowerName = name.toLowerCase();
  return SUPPORTED_TEXTURE_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension),
  );
}

export function setTextureOverride(
  overrides: TextureOverrideMap,
  materialId: string,
  channel: string,
  entry: TextureOverrideEntry,
) {
  return {
    ...overrides,
    [materialId]: {
      ...(overrides[materialId] ?? {}),
      [channel]: entry,
    },
  };
}

export function clearTextureOverride(
  overrides: TextureOverrideMap,
  materialId: string,
  channel: string,
) {
  const materialOverrides = overrides[materialId];

  if (!materialOverrides || !(channel in materialOverrides)) {
    return overrides;
  }

  const nextMaterialOverrides = { ...materialOverrides };
  delete nextMaterialOverrides[channel];

  if (!Object.keys(nextMaterialOverrides).length) {
    const nextOverrides = { ...overrides };
    delete nextOverrides[materialId];
    return nextOverrides;
  }

  return {
    ...overrides,
    [materialId]: nextMaterialOverrides,
  };
}
