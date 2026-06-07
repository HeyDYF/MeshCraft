import {
  Activity,
  Aperture,
  Box,
  Cpu,
  Languages,
  MoonStar,
  FolderOpen,
  LoaderCircle,
  FilePlus2,
  Palette,
  SunMedium,
  Save,
  Sparkles,
  Undo2,
  Upload,
  Redo2,
} from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { describeExportStatus } from "../lib/export-status";
import { isSupportedImportFile, readFileAsDataUrl } from "../lib/import-file";
import { describeImportStatus } from "../lib/import-status";
import { getCopy } from "../lib/ui-copy";
import {
  createProjectSnapshot,
  parseProjectSnapshot,
} from "../lib/project-snapshot";
import { confirmUnsavedChangesAction } from "../lib/unsaved-changes";
import { useEditorStore } from "../store/editor-store";
import type { EditorMode } from "../types";
import type { Locale, ThemeMode } from "../types";

const MODES: { id: EditorMode; label: string; icon: typeof Box }[] = [
  { id: "object", label: "Object", icon: Box },
  { id: "material", label: "Material", icon: Palette },
  { id: "render", label: "Render", icon: Aperture },
  { id: "analyze", label: "Analyze", icon: Activity },
];

function ToolbarIconButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  showInlineLabel = false,
}: {
  label: string;
  icon: typeof Box;
  onClick: () => void;
  disabled?: boolean;
  showInlineLabel?: boolean;
}) {
  return (
    <div className="group relative flex">
      <button
        title={label}
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center rounded-sm text-[color:var(--mc-text-muted)] transition-colors hover:bg-[color:var(--mc-hover)] hover:text-[color:var(--mc-text)] focus-visible:bg-[color:var(--mc-hover)] focus-visible:text-[color:var(--mc-text)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35 ${
          showInlineLabel ? "h-8 gap-1.5 px-2.5" : "size-8"
        }`}
        aria-label={label}
      >
        <Icon className="size-4" strokeWidth={1.8} />
        {showInlineLabel && (
          <span className="font-mono text-[13px] font-medium leading-none">
            {label}
          </span>
        )}
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[color:var(--mc-panel)] px-2.5 py-1.5 font-mono text-[12px] text-[color:var(--mc-text)] opacity-0 shadow-lg ring-1 ring-[color:var(--mc-border)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </div>
  );
}

export function TopToolbar() {
  const locale = useEditorStore((state) => state.locale);
  const theme = useEditorStore((state) => state.theme);
  const mode = useEditorStore((state) => state.mode);
  const fps = useEditorStore((state) => state.performance.fps);
  const importedAssetName = useEditorStore((state) => state.importedAssetName);
  const importedAssetUrl = useEditorStore((state) => state.importedAssetUrl);
  const importStatus = useEditorStore((state) => state.importStatus);
  const importError = useEditorStore((state) => state.importError);
  const setMode = useEditorStore((state) => state.setMode);
  const setLocale = useEditorStore((state) => state.setLocale);
  const setTheme = useEditorStore((state) => state.setTheme);
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
  const exportStatus = useEditorStore((state) => state.exportStatus);
  const exportError = useEditorStore((state) => state.exportError);
  const exportFileName = useEditorStore((state) => state.exportFileName);
  const activeMaterialId = useEditorStore((state) => state.activeMaterialId);
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
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const inputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const importMeta = describeImportStatus(
    locale,
    importStatus,
    importedAssetName,
    importError,
  );
  const exportMeta = describeExportStatus(
    locale,
    exportStatus,
    exportFileName,
    exportError,
  );

  function handleImportClick() {
    if (!confirmUnsavedChangesAction(hasUnsavedChanges, "import a new asset")) {
      return;
    }

    inputRef.current?.click();
  }

  function handleProjectOpenClick() {
    if (!confirmUnsavedChangesAction(hasUnsavedChanges, "open another project")) {
      return;
    }

    projectInputRef.current?.click();
  }

  function handleNewProjectClick() {
    if (!confirmUnsavedChangesAction(hasUnsavedChanges, "new project")) {
      return;
    }

    resetProject();
  }

  function handleProjectSaveClick() {
    const snapshot = createProjectSnapshot({
      mode,
      selectedId,
      selectedName,
      activeMaterialId,
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
      setImportStatus("error", getCopy(locale, "importStatus.invalidAsset"));
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImportedAsset(file.name, dataUrl);
    } catch {
      setImportStatus("error", getCopy(locale, "importStatus.readImportFailed"));
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
      setImportStatus("error", getCopy(locale, "importStatus.invalidProject"));
    } finally {
      event.target.value = "";
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[color:var(--mc-border)] bg-[color:var(--mc-toolbar)] px-3 backdrop-blur">
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
        <span className="font-mono text-lg font-semibold tracking-tight text-[color:var(--mc-text)]">
          {getCopy(locale, "brand").replace("Craft", "")}
          <span className="text-cyan-300">Craft</span>
        </span>
      </div>

      <div className="h-5 w-px bg-[color:var(--mc-border)]" />

      <div className="flex items-center gap-1">
        {[
          { icon: Undo2, label: "Undo", onClick: undo, disabled: !canUndo },
          { icon: Redo2, label: "Redo", onClick: redo, disabled: !canRedo },
        ].map(({ icon: Icon, label, onClick, disabled }) => (
          <ToolbarIconButton
            key={label}
            label={getCopy(locale, `toolbar.${label.toLowerCase()}`)}
            icon={Icon}
            onClick={onClick}
            disabled={disabled}
          />
        ))}
      </div>

      <div className="h-5 w-px bg-[color:var(--mc-border)]" />

      <div className="flex items-center gap-1">
        {[
          { icon: FilePlus2, label: "new", onClick: handleNewProjectClick },
          { icon: FolderOpen, label: "open", onClick: handleProjectOpenClick },
          { icon: Save, label: "save", onClick: handleProjectSaveClick },
          { icon: Upload, label: "import", onClick: handleImportClick },
        ].map(({ icon: Icon, label, onClick }) => (
          <ToolbarIconButton
            key={label}
            label={getCopy(locale, `toolbar.${label}`)}
            icon={Icon}
            onClick={onClick}
            showInlineLabel
          />
        ))}
      </div>

      <div className="mx-auto flex items-center gap-1 rounded-md bg-[color:var(--mc-soft)] p-1 ring-1 ring-[color:var(--mc-border)]">
        {MODES.map(({ id, icon: Icon }) => {
          const active = mode === id;

          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/25"
                  : "text-[color:var(--mc-text-muted)] hover:text-[color:var(--mc-text)]"
              }`}
            >
              <Icon className="size-3.5" strokeWidth={1.8} />
              {getCopy(locale, `mode.${id}`)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-sm bg-[color:var(--mc-soft)] px-1.5 py-1 ring-1 ring-[color:var(--mc-border)]">
          <Languages className="size-3.5 text-cyan-300" strokeWidth={1.8} />
          {[
            { id: "en" as Locale, label: "EN" },
            { id: "zh-CN" as Locale, label: "中文" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setLocale(option.id)}
              className={`rounded-sm px-2 py-1 text-[12px] font-medium transition-colors ${
                locale === option.id
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-[color:var(--mc-text-muted)] hover:text-[color:var(--mc-text)]"
              }`}
              title={getCopy(locale, "toolbar.language")}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-sm bg-[color:var(--mc-soft)] px-1.5 py-1 ring-1 ring-[color:var(--mc-border)]">
          {[{ id: "dark" as ThemeMode, icon: MoonStar }, { id: "light" as ThemeMode, icon: SunMedium }].map(
            ({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex items-center gap-1 rounded-sm px-2 py-1 text-[12px] font-medium transition-colors ${
                  theme === id
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-[color:var(--mc-text-muted)] hover:text-[color:var(--mc-text)]"
                }`}
                title={getCopy(locale, `toolbar.${id}`)}
              >
                <Icon className="size-3.5" strokeWidth={1.8} />
              </button>
            ),
          )}
        </div>
        <div
          className={`rounded-sm px-2.5 py-1.5 font-mono text-[13px] ring-1 ${
            importMeta.tone === "error"
              ? "bg-red-500/10 text-red-300 ring-red-400/20"
              : importMeta.tone === "success"
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                : importMeta.tone === "loading"
                  ? "bg-cyan-400/10 text-cyan-300 ring-cyan-300/20"
                  : "bg-[color:var(--mc-soft)] text-[color:var(--mc-text-muted)] ring-[color:var(--mc-border)]"
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
          className={`rounded-sm px-2.5 py-1.5 font-mono text-[13px] ring-1 ${
            hasUnsavedChanges
              ? "bg-amber-500/10 text-amber-200 ring-amber-400/20"
              : "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
          }`}
        >
          {hasUnsavedChanges
            ? getCopy(locale, "toolbar.unsaved")
            : getCopy(locale, "toolbar.saved")}
        </div>
        <div
          className={`rounded-sm px-2.5 py-1.5 font-mono text-[13px] ring-1 ${
            exportMeta.tone === "loading"
              ? "bg-cyan-400/10 text-cyan-300 ring-cyan-300/20"
              : exportMeta.tone === "success"
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                : exportMeta.tone === "error"
                  ? "bg-rose-500/10 text-rose-200 ring-rose-400/20"
                  : "bg-[color:var(--mc-soft)] text-[color:var(--mc-text-muted)] ring-[color:var(--mc-border)]"
          }`}
        >
          {exportMeta.label}
        </div>
        {importedAssetName && (
          <button
            onClick={() => {
              if (
                !confirmUnsavedChangesAction(
                  hasUnsavedChanges,
                  "unload the imported asset",
                )
              ) {
                return;
              }

              clearImportedAsset();
            }}
            className="max-w-[180px] truncate rounded-sm bg-[color:var(--mc-soft)] px-2.5 py-1.5 font-mono text-[13px] text-cyan-300 ring-1 ring-[color:var(--mc-border)]"
            title={getCopy(locale, "toolbar.unloadImportedAsset")}
          >
            {importedAssetName}
          </button>
        )}
        <div className="flex items-center gap-1.5 rounded-sm bg-[color:var(--mc-soft)] px-2.5 py-1.5 font-mono text-[13px] ring-1 ring-[color:var(--mc-border)]">
          <Cpu className="size-3.5 text-cyan-300" strokeWidth={2} />
          <span className="text-[color:var(--mc-text-muted)]">GPU</span>
          <span className="text-[color:var(--mc-text)]">{fps}</span>
          <span className="text-[color:var(--mc-text-muted)]">fps</span>
        </div>
        <button
          onClick={requestSceneExport}
          disabled={exportStatus === "exporting"}
          className="flex items-center gap-1.5 rounded-sm bg-cyan-300 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
        >
          <Sparkles className="size-3.5" strokeWidth={2} />
          {getCopy(locale, "toolbar.exportGlb")}
        </button>
      </div>
    </header>
  );
}
