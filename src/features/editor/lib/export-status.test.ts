import { describe, expect, it } from "vitest";
import { describeExportStatus } from "./export-status";

describe("describeExportStatus", () => {
  it("describes an in-progress export", () => {
    expect(describeExportStatus("en", "exporting", "robot-export.glb")).toEqual({
      label: "Exporting robot-export.glb",
      tone: "loading",
    });
  });

  it("describes a successful export", () => {
    expect(describeExportStatus("en", "success", "robot-export.glb")).toEqual({
      label: "Exported robot-export.glb",
      tone: "success",
    });
  });

  it("surfaces export errors", () => {
    expect(describeExportStatus("en", "error", null, "Failed to export scene")).toEqual({
      label: "Failed to export scene",
      tone: "error",
    });
  });
});
