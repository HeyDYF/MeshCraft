import type { Locale } from "../types";
import { getCopy } from "./ui-copy";

export type ExportStatus = "idle" | "exporting" | "success" | "error";

export function describeExportStatus(
  locale: Locale,
  status: ExportStatus,
  fileName?: string | null,
  errorMessage?: string | null,
) {
  if (status === "exporting") {
    return {
      label: getCopy(locale, "exportStatus.exporting", fileName ?? "scene.glb"),
      tone: "loading" as const,
    };
  }

  if (status === "success") {
    return {
      label: getCopy(locale, "exportStatus.success", fileName ?? "scene.glb"),
      tone: "success" as const,
    };
  }

  if (status === "error") {
    return {
      label: errorMessage ?? getCopy(locale, "exportStatus.failed"),
      tone: "error" as const,
    };
  }

  return {
    label: getCopy(locale, "exportStatus.ready"),
    tone: "neutral" as const,
  };
}
