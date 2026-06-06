import {
  ChevronDown,
  Eye,
  Gauge,
  Info,
  Maximize,
  Move,
  Palette,
  RotateCw,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { getSelectionCapabilities } from "../lib/editor-bindings";
import { useEditorStore } from "../store/editor-store";
import type {
  DisplayState,
  MaterialState,
  MaterialTextureSlot,
  ShadingMode,
  TransformState,
} from "../types";

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: typeof Move;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
      >
        <Icon className="size-3.5 text-cyan-300" strokeWidth={1.8} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-100">
          {title}
        </span>
        <ChevronDown
          className={`ml-auto size-3.5 text-slate-500 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="px-3 pb-3.5 pt-0.5">{children}</div>}
    </div>
  );
}

function NumberField({
  value,
  onChange,
  label,
  accent,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  accent: string;
}) {
  return (
    <label className="flex items-center overflow-hidden rounded-sm bg-black/20 ring-1 ring-white/10 focus-within:ring-cyan-300/50">
      <span
        className="flex w-5 items-center justify-center self-stretch text-[10px] font-semibold"
        style={{ color: accent }}
      >
        {label}
      </span>
      <input
        type="number"
        step={0.01}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number.parseFloat(event.target.value) || 0)}
        className="w-full bg-transparent py-1 pr-1.5 text-right font-mono text-xs text-slate-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  );
}

function VectorRow({
  value,
  group,
}: {
  value: TransformState["position"];
  group: keyof TransformState;
}) {
  const setTransformAxis = useEditorStore((state) => state.setTransformAxis);

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <NumberField
        label="X"
        accent="#ff5d5d"
        value={value.x}
        onChange={(nextValue) => setTransformAxis(group, "x", nextValue)}
      />
      <NumberField
        label="Y"
        accent="#5dff8f"
        value={value.y}
        onChange={(nextValue) => setTransformAxis(group, "y", nextValue)}
      />
      <NumberField
        label="Z"
        accent="#5d9bff"
        value={value.z}
        onChange={(nextValue) => setTransformAxis(group, "z", nextValue)}
      />
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-slate-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number.parseFloat(event.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300"
        style={{
          background: `linear-gradient(to right, #67e8f9 ${percent}%, rgba(255,255,255,0.1) ${percent}%)`,
        }}
      />
      <span className="w-9 shrink-0 text-right font-mono text-[11px] text-slate-100">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between py-1.5 text-left">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className={`relative h-4 w-7 rounded-full transition-colors ${checked ? "bg-cyan-300" : "bg-white/10"}`}>
        <span
          className={`absolute top-0.5 size-3 rounded-full bg-slate-950 transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

const SHADING: { id: ShadingMode; label: string }[] = [
  { id: "shaded", label: "Shaded" },
  { id: "wireframe", label: "Wire" },
  { id: "matcap", label: "Matcap" },
  { id: "normals", label: "Normals" },
];

function TransformSection({ transform }: { transform: TransformState }) {
  const selectedId = useEditorStore((state) => state.selectedId);
  const importedObjectTransforms = useEditorStore((state) => state.importedObjectTransforms);
  const { canTransform } = getSelectionCapabilities(selectedId, {
    importedTransformIds: Object.keys(importedObjectTransforms),
  });

  if (!canTransform) {
    return (
      <div className="rounded-sm bg-black/20 px-3 py-3 text-[11px] text-slate-500 ring-1 ring-white/10">
        Transform editing is available for mesh objects and imported scene roots.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div>
        <div className="mb-1 flex items-center gap-1 text-[10px] text-slate-500">
          <Move className="size-3" /> Position
        </div>
        <VectorRow value={transform.position} group="position" />
      </div>
      <div>
        <div className="mb-1 flex items-center gap-1 text-[10px] text-slate-500">
          <RotateCw className="size-3" /> Rotation
        </div>
        <VectorRow value={transform.rotation} group="rotation" />
      </div>
      <div>
        <div className="mb-1 flex items-center gap-1 text-[10px] text-slate-500">
          <Maximize className="size-3" /> Scale
        </div>
        <VectorRow value={transform.scale} group="scale" />
      </div>
    </div>
  );
}

function MaterialSection({ material }: { material: MaterialState | null }) {
  const setMaterialField = useEditorStore((state) => state.setMaterialField);
  const selectedId = useEditorStore((state) => state.selectedId);
  const importedNodeMaterialBindings = useEditorStore(
    (state) => state.importedNodeMaterialBindings,
  );
  const { canEditMaterial } = getSelectionCapabilities(selectedId, {
    importedMaterialBindings: importedNodeMaterialBindings,
  });

  if (!material || !canEditMaterial) {
    return (
      <div className="rounded-sm bg-black/20 px-3 py-3 text-[11px] text-slate-500 ring-1 ring-white/10">
        Select a procedural mesh or material slot to edit bound material values.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-[11px] text-slate-500">Base Color</span>
        <label className="flex flex-1 items-center gap-2 rounded-sm bg-black/20 px-2 py-1 ring-1 ring-white/10">
          <input
            type="color"
            value={material.baseColor}
            onChange={(event) => setMaterialField("baseColor", event.target.value)}
            className="size-4 cursor-pointer rounded-sm border-0 bg-transparent p-0"
          />
          <span className="font-mono text-[11px] uppercase text-slate-100">
            {material.baseColor}
          </span>
        </label>
      </div>
      <Slider label="Metalness" value={material.metalness} onChange={(value) => setMaterialField("metalness", value)} />
      <Slider label="Roughness" value={material.roughness} onChange={(value) => setMaterialField("roughness", value)} />
      <Slider label="Emission" value={material.emission} onChange={(value) => setMaterialField("emission", value)} max={4} />
      <Slider label="Opacity" value={material.opacity} onChange={(value) => setMaterialField("opacity", value)} />
    </div>
  );
}

function TextureSlotsSection({
  slots,
  canInspect,
}: {
  slots: MaterialTextureSlot[];
  canInspect: boolean;
}) {
  if (!canInspect) {
    return (
      <div className="rounded-sm bg-black/20 px-3 py-3 text-[11px] text-slate-500 ring-1 ring-white/10">
        Select a bound material to inspect imported texture slots.
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="rounded-sm bg-black/20 px-3 py-3 text-[11px] text-slate-500 ring-1 ring-white/10">
        No texture maps are bound on the selected material.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <div
          key={`${slot.textureId}-${slot.channel}`}
          className="rounded-sm bg-black/20 px-3 py-2 ring-1 ring-white/10"
        >
          <div className="text-[10px] uppercase tracking-wide text-slate-600">
            {slot.channel}
          </div>
          <div className="mt-1 font-mono text-[11px] text-slate-100">
            {slot.textureName}
          </div>
          <div className="mt-1 font-mono text-[10px] text-slate-500">{slot.textureId}</div>
        </div>
      ))}
    </div>
  );
}

function DisplaySection({ display }: { display: DisplayState }) {
  const setDisplayField = useEditorStore((state) => state.setDisplayField);
  const setShading = useEditorStore((state) => state.setShading);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <span className="text-[11px] text-slate-500">Shading</span>
        <div className="grid grid-cols-2 gap-1.5">
          {SHADING.map((option) => {
            const active = display.shading === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setShading(option.id)}
                className={`rounded-sm px-2 py-1.5 text-[11px] transition-colors ${
                  active
                    ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/30"
                    : "bg-black/20 text-slate-500 ring-1 ring-white/10 hover:text-slate-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <Toggle label="Wireframe Overlay" checked={display.shading === "wireframe"} onChange={(checked) => setShading(checked ? "wireframe" : "shaded")} />
      <Toggle label="Shadows" checked={display.showShadows} onChange={(value) => setDisplayField("showShadows", value)} />
      <Toggle label="Grid" checked={display.showGrid} onChange={(value) => setDisplayField("showGrid", value)} />
      <Toggle label="Transform Gizmo" checked={display.showGizmo} onChange={(value) => setDisplayField("showGizmo", value)} />
      <Toggle label="Scatter Field" checked={display.showScatterField} onChange={(value) => setDisplayField("showScatterField", value)} />
      <Toggle label="Hologram Scan" checked={display.showHologramScan} onChange={(value) => setDisplayField("showHologramScan", value)} />
      <Toggle label="Post FX" checked={display.postFx} onChange={(value) => setDisplayField("postFx", value)} />
      <Toggle label="LOD Preview" checked={display.lodPreview} onChange={(value) => setDisplayField("lodPreview", value)} />
      <Toggle label="Auto Rotate" checked={display.autoRotate} onChange={(value) => setDisplayField("autoRotate", value)} />
    </div>
  );
}

function PerformanceSection() {
  const performance = useEditorStore((state) => state.performance);

  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "FPS", value: String(performance.fps) },
        { label: "Triangles", value: performance.triangles.toLocaleString() },
        { label: "Instances", value: performance.instances.toLocaleString() },
        { label: "Draw Calls", value: String(performance.drawCalls) },
        { label: "GPU Memory", value: `${performance.gpuMemoryMb} MB` },
        { label: "Decode", value: `${performance.decodeTimeMs.toFixed(1)} ms` },
        { label: "Target", value: performance.fps >= 60 ? "Stable" : "Warm" },
      ].map((item) => (
        <div key={item.label} className="rounded-sm bg-black/20 px-2 py-2 ring-1 ring-white/10">
          <div className="text-[10px] uppercase tracking-wide text-slate-600">
            {item.label}
          </div>
          <div className="mt-1 font-mono text-[11px] text-slate-100">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function SelectionSection() {
  const selectedName = useEditorStore((state) => state.selectedName);
  const selectedId = useEditorStore((state) => state.selectedId);
  const activeMaterialId = useEditorStore((state) => state.activeMaterialId);

  return (
    <div className="space-y-2 rounded-sm bg-black/20 px-3 py-3 ring-1 ring-white/10">
      <div className="text-[10px] uppercase tracking-wide text-slate-600">Selected Node</div>
      <div className="font-mono text-[11px] text-slate-100">{selectedName}</div>
      <div className="font-mono text-[10px] text-slate-500">{selectedId}</div>
      <div className="pt-1 text-[11px] text-slate-500">
        Material Slot:{" "}
        <span className="font-mono text-slate-300">
          {activeMaterialId ?? "Imported / unbound"}
        </span>
      </div>
    </div>
  );
}

export function InspectorPanel() {
  const selectedName = useEditorStore((state) => state.selectedName);
  const selectedId = useEditorStore((state) => state.selectedId);
  const transform = useEditorStore((state) => state.transform);
  const activeMaterialId = useEditorStore((state) => state.activeMaterialId);
  const material = useEditorStore((state) =>
    state.activeMaterialId
      ? state.materialLibrary[state.activeMaterialId] ??
        state.importedMaterialLibrary[state.activeMaterialId] ??
        null
      : null,
  );
  const importedNodeMaterialBindings = useEditorStore(
    (state) => state.importedNodeMaterialBindings,
  );
  const importedMaterialTextureSlots = useEditorStore(
    (state) => state.importedMaterialTextureSlots,
  );
  const display = useEditorStore((state) => state.display);
  const { canEditMaterial } = getSelectionCapabilities(selectedId, {
    importedMaterialBindings: importedNodeMaterialBindings,
  });
  const textureSlots = activeMaterialId
    ? importedMaterialTextureSlots[activeMaterialId] ?? []
    : [];

  return (
    <aside className="mc-thin-scroll flex w-72 shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-[#12171f]">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 px-3">
        <span className="size-1.5 rounded-full bg-cyan-300" />
        <span className="truncate font-mono text-xs text-slate-100">{selectedName}</span>
        <span className="ml-auto font-mono text-[10px] text-slate-500">Inspector</span>
      </div>

      <Section title="Transform" icon={Move}>
        <TransformSection transform={transform} />
      </Section>

      <Section title="Material" icon={Palette}>
        <MaterialSection material={material} />
      </Section>

      <Section title="Textures" icon={Palette}>
        <TextureSlotsSection slots={textureSlots} canInspect={canEditMaterial} />
      </Section>

      <Section title="Selection" icon={Info}>
        <SelectionSection />
      </Section>

      <Section title="Display" icon={Eye}>
        <DisplaySection display={display} />
      </Section>

      <Section title="Performance" icon={Gauge}>
        <PerformanceSection />
      </Section>
    </aside>
  );
}
