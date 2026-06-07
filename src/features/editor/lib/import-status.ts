import type { Locale } from "../types";
import { getCopy } from "./ui-copy";

export type ImportStatus = "idle" | "loading" | "ready" | "error";

export function describeImportStatus(
  locale: Locale,
  status: ImportStatus,
  assetName?: string | null,
  errorMessage?: string | null,
) {
  if (status === "loading") {
    return {
      label: getCopy(locale, "importStatus.loading", assetName ?? "asset"),
      tone: "loading" as const,
    };
  }

  if (status === "ready") {
    return {
      label: getCopy(locale, "importStatus.loaded", assetName ?? "asset"),
      tone: "success" as const,
    };
  }

  if (status === "error") {
    return {
      label: errorMessage ?? getCopy(locale, "importStatus.failed"),
      tone: "error" as const,
    };
  }

  return {
    label: getCopy(locale, "importStatus.ready"),
    tone: "neutral" as const,
  };
}
