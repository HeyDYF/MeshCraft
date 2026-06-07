import { Move3D, RotateCw, Scaling, Upload } from "lucide-react";
import { useEffect, useState, type DragEvent } from "react";
import {
  getDragOverlayMessage,
  isSupportedImportFile,
  pickImportFile,
  readFileAsDataUrl,
} from "../features/editor/lib/import-file";
import { TRANSFORM_TOOLS } from "../features/editor/lib/transform-tool";
import { InspectorPanel } from "../features/editor/components/InspectorPanel";
import { ScenePanel } from "../features/editor/components/ScenePanel";
import { StatusBar } from "../features/editor/components/StatusBar";
import { TopToolbar } from "../features/editor/components/TopToolbar";
import { getCopy } from "../features/editor/lib/ui-copy";
import { confirmUnsavedChangesAction } from "../features/editor/lib/unsaved-changes";
import { persistLocale, persistTheme } from "../features/editor/lib/ui-preferences";
import { useEditorStore } from "../features/editor/store/editor-store";
import { SceneCanvas } from "../features/viewport/components/SceneCanvas";

const TRANSFORM_TOOL_ICONS = {
  translate: Move3D,
  rotate: RotateCw,
  scale: Scaling,
} as const;

function shouldIgnoreHistoryShortcut(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export function AppShell() {
  const locale = useEditorStore((state) => state.locale);
  const theme = useEditorStore((state) => state.theme);
  const mode = useEditorStore((state) => state.mode);
  const selectedName = useEditorStore((state) => state.selectedName);
  const shading = useEditorStore((state) => state.display.shading);
  const transformTool = useEditorStore((state) => state.transformTool);
  const hasUnsavedChanges = useEditorStore((state) => state.hasUnsavedChanges);
  const setImportedAsset = useEditorStore((state) => state.setImportedAsset);
  const setImportStatus = useEditorStore((state) => state.setImportStatus);
  const setTransformTool = useEditorStore((state) => state.setTransformTool);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const [dragActive, setDragActive] = useState(false);
  const [dragAcceptsFile, setDragAcceptsFile] = useState(true);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    persistLocale(locale);
    persistTheme(theme);
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreHistoryShortcut(event.target) || !(event.metaKey || event.ctrlKey)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "z" && event.shiftKey && canRedo) {
        event.preventDefault();
        redo();
        return;
      }

      if (key === "y" && canRedo) {
        event.preventDefault();
        redo();
        return;
      }

      if (key === "z" && canUndo) {
        event.preventDefault();
        undo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canRedo, canUndo, redo, undo]);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.items)
      .filter((item) => item.kind === "file")
      .map((item) => ({ name: item.getAsFile()?.name ?? "" }));
    const nextFile = pickImportFile(files);
    setDragAcceptsFile(Boolean(nextFile));
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setDragActive(false);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    if (!confirmUnsavedChangesAction(hasUnsavedChanges, "import a new asset")) {
      return;
    }

    const files = Array.from(event.dataTransfer.files);
    const nextFile = pickImportFile(files);

    if (!nextFile) {
      setImportStatus("error", getCopy(locale, "importStatus.invalidAsset"));
      return;
    }

    if (!isSupportedImportFile(nextFile)) {
      setImportStatus("error", getCopy(locale, "importStatus.invalidAsset"));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(nextFile);
      setImportedAsset(nextFile.name, dataUrl);
    } catch {
      setImportStatus("error", getCopy(locale, "importStatus.readImportFailed"));
    }
  }

  return (
    <div
      className={`theme-${theme} flex h-screen w-full flex-col overflow-hidden bg-[var(--mc-app-bg)] text-[color:var(--mc-text)]`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <TopToolbar />

      <div className="flex min-h-0 flex-1">
        <ScenePanel />

        <main className="relative flex min-w-0 flex-1 flex-col bg-[var(--mc-app-bg)]">
          <div className="flex h-10 shrink-0 items-center gap-3 border-b border-[color:var(--mc-border)] bg-[color:var(--mc-panel)] px-3">
            <span className="font-mono text-[12px] text-[color:var(--mc-text-muted)]">
              {getCopy(locale, "app.perspective")}
            </span>
            <div className="h-4 w-px bg-[color:var(--mc-border)]" />
            <span className="font-mono text-[12px] text-[color:var(--mc-text-muted)]">
              {getCopy(locale, "app.selection")}: {selectedName}
            </span>
            <div className="ml-3 flex items-center gap-1 rounded-sm bg-[color:var(--mc-soft)] p-0.5 ring-1 ring-[color:var(--mc-border)]">
              {TRANSFORM_TOOLS.map((tool) => {
                const Icon = TRANSFORM_TOOL_ICONS[tool];
                const active = tool === transformTool;

                return (
                  <button
                    key={tool}
                    onClick={() => setTransformTool(tool)}
                    className={`flex items-center gap-1 rounded-sm px-2 py-1 text-[12px] transition-colors ${
                      active
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-[color:var(--mc-text-muted)] hover:text-[color:var(--mc-text)]"
                    }`}
                    title={tool}
                  >
                    <Icon className="size-3.5" strokeWidth={1.8} />
                    <span className="hidden md:inline">{tool}</span>
                  </button>
                );
              })}
            </div>
            <span className="ml-auto font-mono text-[12px] uppercase text-cyan-300">
              {mode} / {shading} / {transformTool}
            </span>
          </div>

          <div className="relative min-h-0 flex-1">
            <SceneCanvas />

            {dragActive && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[color:var(--mc-overlay)] backdrop-blur-sm">
                <div
                  className={`flex w-[360px] flex-col items-center gap-4 rounded-2xl border px-6 py-8 text-center shadow-2xl ${
                    dragAcceptsFile
                      ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
                      : "border-red-400/40 bg-red-500/10 text-red-200"
                  }`}
                >
                  <div
                    className={`rounded-full p-4 ${
                      dragAcceptsFile ? "bg-cyan-300/10" : "bg-red-400/10"
                    }`}
                  >
                    <Upload className="size-7" strokeWidth={1.8} />
                  </div>
                  <div className="font-mono text-sm uppercase tracking-[0.22em]">
                    {getCopy(locale, "app.importAsset")}
                  </div>
                  <div className="text-sm text-current/90">
                    {getDragOverlayMessage(locale, dragAcceptsFile)}
                  </div>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute left-3 top-3 font-mono text-[11px] leading-relaxed text-[color:var(--mc-text-muted)]">
              <div className="text-[13px] text-[color:var(--mc-text)]">{selectedName}</div>
              <div>mode: {mode}</div>
              <div>{getCopy(locale, "app.dragHint")}</div>
            </div>

            <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-sm bg-[color:var(--mc-panel)] px-2 py-1 font-mono text-[11px] ring-1 ring-[color:var(--mc-border)]">
              <span className="text-[#ff5d5d]">X</span>
              <span className="text-[#5dff8f]">Y</span>
              <span className="text-[#5d9bff]">Z</span>
            </div>
          </div>
        </main>

        <InspectorPanel />
      </div>

      <StatusBar />
    </div>
  );
}
