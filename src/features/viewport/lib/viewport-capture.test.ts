import { describe, expect, it } from "vitest";
import { buildViewportCaptureFileName } from "./viewport-capture";

describe("buildViewportCaptureFileName", () => {
  it("uses the imported asset stem when available", () => {
    expect(buildViewportCaptureFileName("robot.glb")).toBe("robot-render.png");
    expect(buildViewportCaptureFileName("scene.gltf")).toBe("scene-render.png");
  });

  it("falls back to a generic project name when no imported asset is active", () => {
    expect(buildViewportCaptureFileName(null)).toBe("meshcraft-render.png");
  });
});
