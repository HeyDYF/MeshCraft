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
  Search,
} from "lucide-react";
import { useState } from "react";
import { getCopy } from "../lib/ui-copy";
import { useEditorStore } from "../store/editor-store";
import type { NodeKind, SceneNode } from "../types";
import { summarizeSceneTree } from "../../viewport/lib/scene-asset-utils";
import {
  filterSceneTreeByQuery,
  getScenePanelTreeForTab,
  type ScenePanelTab,
} from "../lib/scene-panel-view";

const KIND_ICON: Record<NodeKind, typeof Box> = {
  group: Boxes,
  mesh: Box,
  material: Palette,
  texture: ImageIcon,
  light: Lightbulb,
  camera: Camera,
};

const TABS = ["scene", "assets", "materials"] as const;

function TreeRow({
  node,
  depth,
}: {
  node: SceneNode;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const selectedId = useEditorStore((state) => state.selectedId);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const setSelected = useEditorStore((state) => state.setSelected);
  const toggleSelected = useEditorStore((state) => state.toggleSelected);
  const Icon = KIND_ICON[node.kind];
  const hasChildren = Boolean(node.children?.length);
  const selected = selectedIds.includes(node.id);
  const primarySelected = selectedId === node.id;

  return (
    <div>
      <div
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey) {
            toggleSelected(node.id, node.name);
            return;
          }

          setSelected(node.id, node.name);
        }}
        className={`group relative flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 text-[13px] transition-colors ${
          selected
            ? "bg-cyan-400/12 text-[color:var(--mc-text)]"
            : "text-[color:var(--mc-text-muted)] hover:bg-[color:var(--mc-hover)] hover:text-[color:var(--mc-text)]"
        }`}
        style={{ paddingLeft: depth * 14 + 8 }}
      >
        {primarySelected && (
          <span className="absolute left-0 top-0 h-full w-0.5 bg-cyan-300" />
        )}
        {hasChildren ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setOpen((value) => !value);
            }}
            className="flex size-3.5 items-center justify-center text-[color:var(--mc-text-subtle)]"
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
            selected
              ? "text-cyan-300"
              : node.kind === "mesh"
                ? "text-[color:var(--mc-text)]"
                : ""
          }`}
          strokeWidth={1.8}
        />
        <span className="truncate font-mono">{node.name}</span>
        {node.tris != null && (
          <span className="ml-auto shrink-0 font-mono text-[11px] text-[color:var(--mc-text-subtle)]">
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
  const locale = useEditorStore((state) => state.locale);
  const [tab, setTab] = useState<ScenePanelTab>("scene");
  const [query, setQuery] = useState("");
  const sceneTree = useEditorStore((state) => state.sceneTree);
  const filteredTree = filterSceneTreeByQuery(
    getScenePanelTreeForTab(sceneTree, tab),
    query,
  );
  const summary = summarizeSceneTree(filteredTree ?? getScenePanelTreeForTab(sceneTree, tab));

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[color:var(--mc-border)] bg-[color:var(--mc-panel)]">
      <div className="flex h-9 items-center border-b border-[color:var(--mc-border)] px-1">
        {TABS.map((tabOption) => (
          <button
            key={tabOption}
            onClick={() => setTab(tabOption)}
            className={`flex h-full items-center px-3 text-sm font-medium transition-colors ${
              tab === tabOption
                ? "border-b border-cyan-300 text-[color:var(--mc-text)]"
                : "text-[color:var(--mc-text-muted)] hover:text-[color:var(--mc-text)]"
            }`}
          >
            {getCopy(locale, `scenePanel.${tabOption}`)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-b border-[color:var(--mc-border)] px-3 py-2">
        <Layers className="size-3.5 text-[color:var(--mc-text-muted)]" strokeWidth={1.8} />
        <span className="font-mono text-[12px] uppercase tracking-wider text-[color:var(--mc-text-muted)]">
          {getCopy(locale, "scenePanel.outliner")}
        </span>
      </div>

      <div className="border-b border-[color:var(--mc-border)] px-3 py-2">
        <label className="flex items-center gap-2 rounded-sm bg-[color:var(--mc-soft)] px-2 py-1.5 ring-1 ring-[color:var(--mc-border)] focus-within:ring-cyan-300/40">
          <Search className="size-3.5 text-[color:var(--mc-text-muted)]" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={getCopy(locale, "scenePanel.searchNodes")}
            className="w-full bg-transparent font-mono text-[12px] text-[color:var(--mc-text)] outline-none placeholder:text-[color:var(--mc-text-subtle)]"
          />
        </label>
      </div>

      <div className="mc-thin-scroll flex-1 overflow-y-auto py-1">
        {filteredTree ? (
          <TreeRow node={filteredTree} depth={0} />
        ) : (
          <div className="px-3 py-4 font-mono text-[12px] text-[color:var(--mc-text-muted)]">
            {getCopy(locale, "scenePanel.noNodesMatch", query)}
          </div>
        )}
      </div>

      <div className="border-t border-[color:var(--mc-border)] px-3 py-2 font-mono text-[11px] text-[color:var(--mc-text-muted)]">
        {summary.meshes} {getCopy(locale, "scenePanel.meshes")} · {summary.materials}{" "}
        {getCopy(locale, "scenePanel.materialsSummary")} · {summary.textures}{" "}
        {getCopy(locale, "scenePanel.textures")}
      </div>
    </aside>
  );
}
