import {
  Activity,
  Aperture,
  Box,
  Cpu,
  FolderOpen,
  LoaderCircle,
  Palette,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { isSupportedImportFile } from "../lib/import-file";
import { describeImportStatus } from "../lib/import-status";
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
  const importStatus = useEditorStore((state) => state.importStatus);
  const importError = useEditorStore((state) => state.importError);
  const setMode = useEditorStore((state) => state.setMode);
  const setImportedAsset = useEditorStore((state) => state.setImportedAsset);
  const clearImportedAsset = useEditorStore((state) => state.clearImportedAsset);
  const setImportStatus = useEditorStore((state) => state.setImportStatus);
  const inputRef = useRef<HTMLInputElement>(null);
  const importMeta = describeImportStatus(
    importStatus,
    importedAssetName,
    importError,
  );

  function handleImportClick() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isSupportedImportFile(file)) {
      setImportStatus("error", "Only .glb and .gltf files are supported");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImportedAsset(file.name, objectUrl);
    event.target.value = "";
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
          { icon: FolderOpen, label: "Open", onClick: undefined },
          { icon: Save, label: "Save", onClick: undefined },
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
        <button className="flex items-center gap-1.5 rounded-sm bg-cyan-300 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-opacity hover:opacity-90">
          <Sparkles className="size-3.5" strokeWidth={2} />
          Render
        </button>
      </div>
    </header>
  );
}
