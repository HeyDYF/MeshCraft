import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { TopToolbar } from "./TopToolbar";
import { useEditorStore } from "../store/editor-store";

describe("TopToolbar", () => {
  beforeEach(() => {
    useEditorStore.setState({
      locale: "en",
      theme: "dark",
      mode: "object",
      selectedId: "mesh-core",
      selectedIds: ["mesh-core"],
      selectedName: "Core_Rotor",
      importedAssetName: null,
      importedAssetUrl: null,
      importStatus: "idle",
      importError: null,
      activeMaterialId: "mat-carbon",
      hasUnsavedChanges: false,
      canUndo: false,
      canRedo: false,
      materialLibrary: useEditorStore.getState().materialLibrary,
      objectTransforms: useEditorStore.getState().objectTransforms,
      importedMaterialLibrary: {},
      importedNodeMaterialBindings: {},
      importedMaterialTextureSlots: {},
      importedMaterialTextureOverrides: {},
      importedObjectTransforms: {},
      sceneTree: useEditorStore.getState().sceneTree,
      display: useEditorStore.getState().display,
      transformTool: "translate",
      performance: {
        fps: 60,
        triangles: 342156,
        drawCalls: 18,
        gpuMemoryMb: 284,
        decodeTimeMs: 11.8,
        instances: 1000,
      },
    });
  });

  it("keeps primary file actions visibly labeled without relying on md breakpoints", () => {
    const html = renderToStaticMarkup(<TopToolbar />);

    expect(html).toContain(">New<");
    expect(html).toContain(">Open<");
    expect(html).toContain(">Save<");
    expect(html).toContain(">Import<");
    expect(html).not.toContain("hidden md:inline");
  });
});
