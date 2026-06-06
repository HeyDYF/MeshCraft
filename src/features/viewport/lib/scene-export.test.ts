import { describe, expect, it } from "vitest";
import {
  buildExportFileName,
  getExportOptions,
} from "./scene-export";

describe("buildExportFileName", () => {
  it("uses the imported asset stem when available", () => {
    expect(buildExportFileName("robot.glb")).toBe("robot-export.glb");
    expect(buildExportFileName("scene.gltf")).toBe("scene-export.glb");
  });

  it("falls back to a generic project name when no asset is imported", () => {
    expect(buildExportFileName(null)).toBe("meshcraft-scene.glb");
  });
});

describe("getExportOptions", () => {
  it("returns a binary glTF export configuration", () => {
    expect(getExportOptions()).toEqual({
      binary: true,
      onlyVisible: true,
    });
  });
});
