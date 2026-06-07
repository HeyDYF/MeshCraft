import { describeImportStatus } from "../lib/import-status";
import { getCopy } from "../lib/ui-copy";
import { useEditorStore } from "../store/editor-store";

export function StatusBar() {
  const locale = useEditorStore((state) => state.locale);
  const performance = useEditorStore((state) => state.performance);
  const selectedName = useEditorStore((state) => state.selectedName);
  const importedAssetName = useEditorStore((state) => state.importedAssetName);
  const importStatus = useEditorStore((state) => state.importStatus);
  const importError = useEditorStore((state) => state.importError);
  const importMeta = describeImportStatus(
    locale,
    importStatus,
    importedAssetName,
    importError,
  );

  const items = [
    { label: getCopy(locale, "status.fps"), value: String(performance.fps), accent: true },
    { label: getCopy(locale, "status.tris"), value: performance.triangles.toLocaleString() },
    {
      label: getCopy(locale, "status.instances"),
      value: performance.instances.toLocaleString(),
    },
    { label: getCopy(locale, "status.drawCalls"), value: String(performance.drawCalls) },
    { label: getCopy(locale, "status.gpuMem"), value: `${performance.gpuMemoryMb} MB` },
    { label: getCopy(locale, "status.decode"), value: `${performance.decodeTimeMs.toFixed(1)} ms` },
    { label: getCopy(locale, "status.selection"), value: selectedName },
  ];

  return (
    <footer className="flex h-9 shrink-0 items-center gap-4 border-t border-[color:var(--mc-border)] bg-[color:var(--mc-panel)] px-3 font-mono text-[13px]">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 animate-pulse rounded-full bg-cyan-300" />
        <span className="text-[color:var(--mc-text-muted)]">{importMeta.label}</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-[color:var(--mc-text-muted)]">{item.label}</span>
            <span className={item.accent ? "text-cyan-300" : "text-[color:var(--mc-text)]"}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
