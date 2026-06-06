export type ImportStatus = "idle" | "loading" | "ready" | "error";

export function describeImportStatus(
  status: ImportStatus,
  assetName?: string | null,
  errorMessage?: string | null,
) {
  if (status === "loading") {
    return {
      label: `Loading ${assetName ?? "asset"}`,
      tone: "loading" as const,
    };
  }

  if (status === "ready") {
    return {
      label: `Loaded ${assetName ?? "asset"}`,
      tone: "success" as const,
    };
  }

  if (status === "error") {
    return {
      label: errorMessage ?? "Import failed",
      tone: "error" as const,
    };
  }

  return {
    label: "Ready",
    tone: "neutral" as const,
  };
}
