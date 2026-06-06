import {
  Activity,
  Aperture,
  Box,
  Cpu,
  FolderOpen,
  LoaderCircle,
  FilePlus2,
  Palette,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { isSupportedImportFile, readFileAsDataUrl } from "../lib/import-file";
import { describeImportStatus } from "../lib/import-status";
import {
  createProjectSnapshot,
  parseProjectSnapshot,
} from "../lib/project-snapshot";
import { useEditorStore } from "../store/editor-store";
import type { EditorMode } from "../types";

const MODES: { id: EditorMode; label: string; icon: typeof Box }[] = [
  { id: "object", label: "Object", icon: Box },
  { id: "material", label: "Material", icon: Palette },
  { id: "render", label: "Render", icon: Aperture },
  { id: "analyze", label: "Analyze", icon: Activity },
];

export function TopToolbar() {
  const mode = useEditorStore((state) => state.mode);
  const fps = useEditorStore((state) => state.performance.fps);
  const importedAssetName = useEditorStore((state) => state.importedAssetName);
  const importedAssetUrl = useEditorStore((state) => state.importedAssetUrl);
  const importStatus = useEditorStore((state) => state.importStatus);
  const importError = useEditorStore((state) => state.importError);
  const setMode = useEditorStore((state) => state.setMode);
  const setImportedAsset = useEditorStore((state) => state.setImportedAsset);
  const clearImportedAsset = useEditorStore((state) => state.clearImportedAsset);
  const setImportStatus = useEditorStore((state) => state.setImportStatus);
  const applyProjectSnapshot = useEditorStore((state) => state.applyProjectSnapshot);
  const markProjectSaved = useEditorStore((state) => state.markProjectSaved);
  const resetProject = useEditorStore((state) => state.resetProject);
  const requestSceneExport = useEditorStore((state) => state.requestSceneExport);
  const selectedId = useEditorStore((state) => state.selectedId);
  const selectedName = useEditorStore((state) => state.selectedName);
  const transformTool = useEditorStore((state) => state.transformTool);
  const materialLibrary = useEditorStore((state) => state.materialLibrary);
  const objectTransforms = useEditorStore((state) => state.objectTransforms);
  const importedMaterialLibrary = useEditorStore((state) => state.importedMaterialLibrary);
  const importedNodeMaterialBindings = useEditorStore(
    (state) => state.importedNodeMaterialBindings,
  );
  const importedMaterialTextureSlots = useEditorStore(
    (state) => state.importedMaterialTextureSlots,
  );
  const importedMaterialTextureOverrides = useEditorStore(
    (state) => state.importedMaterialTextureOverrides,
  );
  const importedObjectTransforms = useEditorStore(
    (state) => state.importedObjectTransforms,
  );
  const sceneTree = useEditorStore((state) => state.sceneTree);
  const display = useEditorStore((state) => state.display);
  const hasUnsavedChanges = useEditorStore((state) => state.hasUnsavedChanges);
  const inputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const importMeta = describeImportStatus(
    importStatus,
    importedAssetName,
    importError,
  );

  function handleImportClick() {
    inputRef.current?.click();
  }

  function handleProjectOpenClick() {
    projectInputRef.current?.click();
  }

  function handleNewProjectClick() {
    if (
      hasUnsavedChanges &&
      !window.confirm("Discard unsaved changes and start a new MeshCraft project?")
    ) {
      return;
    }

    resetProject();
  }

  function handleProjectSaveClick() {
    const snapshot = createProjectSnapshot({
      mode,
      selectedId,
      selectedName,
      transformTool,
      materialLibrary,
      objectTransforms,
      display,
      importedAssetName,
      importedAssetUrl,
      importedMaterialLibrary,
      importedNodeMaterialBindings,
      importedMaterialTextureSlots,
      importedMaterialTextureOverrides,
      importedObjectTransforms,
      sceneTree,
    });
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "meshcraft-project.json";
    link.click();
    URL.revokeObjectURL(objectUrl);
    markProjectSaved();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isSupportedImportFile(file)) {
      setImportStatus("error", "Only .glb and .gltf files are supported");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImportedAsset(file.name, dataUrl);
    } catch {
      setImportStatus("error", "Failed to read import file");
    } finally {
      event.target.value = "";
    }
  }

  async function handleProjectFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const snapshot = parseProjectSnapshot(text);
      clearImportedAsset();
      applyProjectSnapshot(snapshot);
    } catch {
      setImportStatus("error", "Invalid MeshCraft project file");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-white/10 bg-[#11161d]/95 px-3 backdrop-blur">
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={projectInputRef}
        type="file"
        accept=".json,.meshcraft"
        className="hidden"
        onChange={handleProjectFileChange}
      />
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-sm bg-cyan-400/10 ring-1 ring-cyan-300/20">
          <Box className="size-4 text-cyan-300" strokeWidth={2.2} />
        </div>
        <span className="font-mono text-sm font-semibold tracking-tight text-slate-100">
          Mesh<span className="text-cyan-300">Craft</span>
        </span>
      </div>

      <div className="h-5 w-px bg-white/10" />

      <div className="flex items-center gap-0.5">
        {[
          { icon: FilePlus2, label: "New", onClick: handleNewProjectClick },
          { icon: FolderOpen, label: "Open", onClick: handleProjectOpenClick },
          { icon: Save, label: "Save", onClick: handleProjectSaveClick },
          { icon: Upload, label: "Import", onClick: handleImportClick },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            title={label}
            onClick={onClick}
            className="flex size-8 items-center justify-center rounded-sm text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <Icon className="size-4" strokeWidth={1.8} />
          </button>
        ))}
      </div>

      <div className="mx-auto flex items-center gap-1 rounded-md bg-black/20 p-0.5 ring-1 ring-white/10">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active = mode === id;

          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/25"
                  : "text-slate-500 hover:text-slate-100"
              }`}
            >
              <Icon className="size-3.5" strokeWidth={1.8} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`rounded-sm px-2 py-1 font-mono text-[11px] ring-1 ${
            importMeta.tone === "error"
              ? "bg-red-500/10 text-red-300 ring-red-400/20"
              : importMeta.tone === "success"
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                : importMeta.tone === "loading"
                  ? "bg-cyan-400/10 text-cyan-300 ring-cyan-300/20"
                  : "bg-black/20 text-slate-400 ring-white/10"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            {importMeta.tone === "loading" && (
              <LoaderCircle className="size-3 animate-spin" strokeWidth={2} />
            )}
            {importMeta.label}
          </span>
        </div>
        <div
          className={`rounded-sm px-2 py-1 font-mono text-[11px] ring-1 ${
            hasUnsavedChanges
              ? "bg-amber-500/10 text-amber-200 ring-amber-400/20"
              : "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
          }`}
        >
          {hasUnsavedChanges ? "Unsaved" : "Saved"}
        </div>
        {importedAssetName && (
          <button
            onClick={clearImportedAsset}
            className="max-w-[180px] truncate rounded-sm bg-black/20 px-2 py-1 font-mono text-[11px] text-cyan-300 ring-1 ring-white/10"
            title="Unload imported asset"
          >
            {importedAssetName}
          </button>
        )}
        <div className="flex items-center gap-1.5 rounded-sm bg-black/20 px-2 py-1 font-mono text-[11px] ring-1 ring-white/10">
          <Cpu className="size-3 text-cyan-300" strokeWidth={2} />
          <span className="text-slate-500">GPU</span>
          <span className="text-slate-100">{fps}</span>
          <span className="text-slate-500">fps</span>
        </div>
        <button
          onClick={requestSceneExport}
          className="flex items-center gap-1.5 rounded-sm bg-cyan-300 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-opacity hover:opacity-90"
        >
          <Sparkles className="size-3.5" strokeWidth={2} />
          Export GLB
        </button>
      </div>
    </header>
  );
}
