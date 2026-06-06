import { describe, expect, it } from "vitest";
import { describeImportStatus } from "./import-status";

describe("describeImportStatus", () => {
  it("formats idle, loading, ready and error states for the toolbar/status bar", () => {
    expect(describeImportStatus("idle")).toEqual({
      label: "Ready",
      tone: "neutral",
    });
    expect(describeImportStatus("loading", "robot.glb")).toEqual({
      label: "Loading robot.glb",
      tone: "loading",
    });
    expect(describeImportStatus("ready", "robot.glb")).toEqual({
      label: "Loaded robot.glb",
      tone: "success",
    });
    expect(describeImportStatus("error", "robot.glb", "Decode failed")).toEqual({
      label: "Decode failed",
      tone: "error",
    });
  });
});
