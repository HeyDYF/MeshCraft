import { describe, expect, it } from "vitest";
import {
  getDragOverlayMessage,
  isSupportedImportFile,
  pickImportFile,
} from "./import-file";

describe("isSupportedImportFile", () => {
  it("accepts glb and gltf assets and rejects unrelated files", () => {
    expect(isSupportedImportFile({ name: "robot.glb" })).toBe(true);
    expect(isSupportedImportFile({ name: "scene.gltf" })).toBe(true);
    expect(isSupportedImportFile({ name: "notes.txt" })).toBe(false);
    expect(isSupportedImportFile({ name: "archive.zip" })).toBe(false);
  });
});

describe("pickImportFile", () => {
  it("returns the first supported asset from a file list-like input", () => {
    const files = [
      { name: "notes.txt" },
      { name: "hero.glb" },
      { name: "scene.gltf" },
    ];

    expect(pickImportFile(files)).toEqual({ name: "hero.glb" });
  });

  it("returns null when no supported asset exists", () => {
    expect(pickImportFile([{ name: "notes.txt" }])).toBeNull();
  });
});

describe("getDragOverlayMessage", () => {
  it("describes supported and rejected drag states", () => {
    expect(getDragOverlayMessage(true)).toBe("Drop GLB / glTF to import");
    expect(getDragOverlayMessage(false)).toBe("Only .glb and .gltf files are supported");
  });
});
