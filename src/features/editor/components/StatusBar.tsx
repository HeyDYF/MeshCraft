import { describeImportStatus } from "../lib/import-status";
import { useEditorStore } from "../store/editor-store";

export function StatusBar() {
  const performance = useEditorStore((state) => state.performance);
  const selectedName = useEditorStore((state) => state.selectedName);
  const importedAssetName = useEditorStore((state) => state.importedAssetName);
  const importStatus = useEditorStore((state) => state.importStatus);
  const importError = useEditorStore((state) => state.importError);
  const importMeta = describeImportStatus(
    importStatus,
    importedAssetName,
    importError,
  );

  const items = [
    { label: "FPS", value: String(performance.fps), accent: true },
    { label: "Tris", value: performance.triangles.toLocaleString() },
    { label: "Instances", value: performance.instances.toLocaleString() },
    { label: "Draw Calls", value: String(performance.drawCalls) },
    { label: "GPU Mem", value: `${performance.gpuMemoryMb} MB` },
    { label: "Decode", value: `${performance.decodeTimeMs.toFixed(1)} ms` },
    { label: "Sel", value: selectedName },
  ];

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-white/10 bg-[#12171f] px-3 font-mono text-[11px]">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-cyan-300" />
        <span className="text-slate-500">{importMeta.label}</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-slate-500">{item.label}</span>
            <span className={item.accent ? "text-cyan-300" : "text-slate-100"}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
