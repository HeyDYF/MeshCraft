import {
  Box,
  Boxes,
  Camera,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../store/editor-store";
import type { NodeKind, SceneNode } from "../types";
import { summarizeSceneTree } from "../../viewport/lib/scene-asset-utils";

const KIND_ICON: Record<NodeKind, typeof Box> = {
  group: Boxes,
  mesh: Box,
  material: Palette,
  texture: ImageIcon,
  light: Lightbulb,
  camera: Camera,
};

const TABS = [
  { id: "scene", label: "Scene" },
  { id: "assets", label: "Assets" },
  { id: "materials", label: "Materials" },
] as const;

function TreeRow({
  node,
  depth,
}: {
  node: SceneNode;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelected = useEditorStore((state) => state.setSelected);
  const Icon = KIND_ICON[node.kind];
  const hasChildren = Boolean(node.children?.length);
  const selected = selectedId === node.id;

  return (
    <div>
      <div
        onClick={() => setSelected(node.id, node.name)}
        className={`group relative flex cursor-pointer items-center gap-1.5 py-[5px] pr-2 text-xs transition-colors ${
          selected
            ? "bg-cyan-400/12 text-slate-100"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-100"
        }`}
        style={{ paddingLeft: depth * 14 + 8 }}
      >
        {selected && <span className="absolute left-0 top-0 h-full w-0.5 bg-cyan-300" />}
        {hasChildren ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setOpen((value) => !value);
            }}
            className="flex size-3.5 items-center justify-center text-slate-600"
          >
            {open ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </button>
        ) : (
          <span className="size-3.5" />
        )}
        <Icon
          className={`size-3.5 shrink-0 ${
            selected ? "text-cyan-300" : node.kind === "mesh" ? "text-slate-300/75" : ""
          }`}
          strokeWidth={1.8}
        />
        <span className="truncate font-mono">{node.name}</span>
        {node.tris != null && (
          <span className="ml-auto shrink-0 font-mono text-[10px] text-slate-600">
            {(node.tris / 1000).toFixed(0)}K
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {node.children?.map((child) => (
            <TreeRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ScenePanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("scene");
  const sceneTree = useEditorStore((state) => state.sceneTree);
  const summary = summarizeSceneTree(sceneTree);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#12171f]">
      <div className="flex h-9 items-center border-b border-white/10 px-1">
        {TABS.map((tabOption) => (
          <button
            key={tabOption.id}
            onClick={() => setTab(tabOption.id)}
            className={`flex h-full items-center px-3 text-xs font-medium transition-colors ${
              tab === tabOption.id
                ? "border-b border-cyan-300 text-slate-100"
                : "text-slate-500 hover:text-slate-100"
            }`}
          >
            {tabOption.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <Layers className="size-3.5 text-slate-500" strokeWidth={1.8} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
          Outliner
        </span>
      </div>

      <div className="mc-thin-scroll flex-1 overflow-y-auto py-1">
        <TreeRow node={sceneTree} depth={0} />
      </div>

      <div className="border-t border-white/10 px-3 py-2 font-mono text-[10px] text-slate-500">
        {summary.meshes} meshes · {summary.materials} materials · {summary.textures} textures
      </div>
    </aside>
  );
}
