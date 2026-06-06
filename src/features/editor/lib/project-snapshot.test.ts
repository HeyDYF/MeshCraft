import { describe, expect, it } from "vitest";
import { DEFAULT_MATERIAL_LIBRARY } from "./editor-bindings";
import { DEFAULT_PROCEDURAL_TRANSFORMS } from "./procedural-scene";
import {
  createProjectSnapshot,
  parseProjectSnapshot,
  PROJECT_SNAPSHOT_VERSION,
} from "./project-snapshot";

describe("createProjectSnapshot", () => {
  it("captures the serializable editor state needed to restore a procedural project", () => {
    const snapshot = createProjectSnapshot({
      mode: "material",
      selectedId: "mesh-housing",
      selectedName: "Housing_Shell",
      transformTool: "rotate",
      materialLibrary: DEFAULT_MATERIAL_LIBRARY,
      objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
      display: {
        shading: "matcap",
        showGrid: false,
        showGizmo: true,
        showScatterField: false,
        showHologramScan: true,
        showShadows: false,
        postFx: false,
        autoRotate: false,
        lodPreview: true,
      },
      importedAssetName: "robot.glb",
    });

    expect(snapshot.version).toBe(PROJECT_SNAPSHOT_VERSION);
    expect(snapshot.selectedId).toBe("mesh-housing");
    expect(snapshot.transformTool).toBe("rotate");
    expect(snapshot.importedAssetName).toBe("robot.glb");
  });
});

describe("parseProjectSnapshot", () => {
  it("parses a valid snapshot payload", () => {
    const parsed = parseProjectSnapshot(
      JSON.stringify(
        createProjectSnapshot({
          mode: "object",
          selectedId: "mesh-core",
          selectedName: "Core_Rotor",
          transformTool: "translate",
          materialLibrary: DEFAULT_MATERIAL_LIBRARY,
          objectTransforms: DEFAULT_PROCEDURAL_TRANSFORMS,
          display: {
            shading: "shaded",
            showGrid: true,
            showGizmo: true,
            showScatterField: true,
            showHologramScan: true,
            showShadows: true,
            postFx: true,
            autoRotate: true,
            lodPreview: false,
          },
          importedAssetName: null,
        }),
      ),
    );

    expect(parsed.selectedId).toBe("mesh-core");
    expect(parsed.materialLibrary["mat-glow"].baseColor).toBe("#39d8ff");
  });

  it("rejects unknown versions and malformed payloads", () => {
    expect(() =>
      parseProjectSnapshot(
        JSON.stringify({
          version: 999,
        }),
      ),
    ).toThrow("Unsupported project snapshot");

    expect(() => parseProjectSnapshot("{")).toThrow();
  });
});
