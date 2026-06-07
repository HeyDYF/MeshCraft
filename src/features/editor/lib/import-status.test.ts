import { describe, expect, it } from "vitest";
import { describeImportStatus } from "./import-status";

describe("describeImportStatus", () => {
  it("formats idle, loading, ready and error states for the toolbar/status bar", () => {
    expect(describeImportStatus("en", "idle")).toEqual({
      label: "Ready",
      tone: "neutral",
    });
    expect(describeImportStatus("en", "loading", "robot.glb")).toEqual({
      label: "Loading robot.glb",
      tone: "loading",
    });
    expect(describeImportStatus("en", "ready", "robot.glb")).toEqual({
      label: "Loaded robot.glb",
      tone: "success",
    });
    expect(describeImportStatus("en", "error", "robot.glb", "Decode failed")).toEqual({
      label: "Decode failed",
      tone: "error",
    });
  });
});
