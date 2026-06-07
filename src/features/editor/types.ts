export type Vec3 = { x: number; y: number; z: number };

export type EditorMode = "object" | "material" | "render" | "analyze";

export type TransformTool = "translate" | "rotate" | "scale";

export type Locale = "en" | "zh-CN";

export type ThemeMode = "dark" | "light";

export type ShadingMode = "shaded" | "wireframe" | "matcap" | "normals";

export type NodeKind =
  | "group"
  | "mesh"
  | "material"
  | "texture"
  | "light"
  | "camera";

export type SceneNode = {
  id: string;
  name: string;
  kind: NodeKind;
  tris?: number;
  children?: SceneNode[];
};

export type TransformState = {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
};

export type MaterialState = {
  baseColor: string;
  metalness: number;
  roughness: number;
  emission: number;
  opacity: number;
};

export type MaterialTextureSlot = {
  channel: string;
  textureId: string;
  textureName: string;
};

export type MaterialTextureOverride = {
  name: string;
  objectUrl: string;
};

export type DisplayState = {
  shading: ShadingMode;
  showGrid: boolean;
  showGizmo: boolean;
  showScatterField: boolean;
  showHologramScan: boolean;
  showShadows: boolean;
  postFx: boolean;
  autoRotate: boolean;
  lodPreview: boolean;
};

export type PerformanceStats = {
  fps: number;
  triangles: number;
  drawCalls: number;
  gpuMemoryMb: number;
  decodeTimeMs: number;
  instances: number;
};

export const SCENE_TREE: SceneNode = {
  id: "root",
  name: "TurbineAssembly",
  kind: "group",
  children: [
    {
      id: "meshes",
      name: "Meshes",
      kind: "group",
      children: [
        { id: "mesh-housing", name: "Housing_Shell", kind: "mesh", tris: 184320 },
        { id: "mesh-core", name: "Core_Rotor", kind: "mesh", tris: 96204 },
        { id: "mesh-vents", name: "Intake_Vents", kind: "mesh", tris: 42880 },
        { id: "mesh-bolts", name: "Fastener_Array", kind: "mesh", tris: 18752 },
      ],
    },
    {
      id: "materials",
      name: "Materials",
      kind: "group",
      children: [
        { id: "mat-steel", name: "Brushed_Steel", kind: "material" },
        { id: "mat-carbon", name: "Carbon_Weave", kind: "material" },
        { id: "mat-glow", name: "Emissive_Trim", kind: "material" },
      ],
    },
    {
      id: "textures",
      name: "Textures",
      kind: "group",
      children: [
        { id: "tex-albedo", name: "albedo_4k.ktx2", kind: "texture" },
        { id: "tex-normal", name: "normal_4k.ktx2", kind: "texture" },
        { id: "tex-orm", name: "orm_2k.ktx2", kind: "texture" },
      ],
    },
    {
      id: "lighting",
      name: "Lighting",
      kind: "group",
      children: [
        { id: "light-key", name: "Key_Light", kind: "light" },
        { id: "light-rim", name: "Rim_Light", kind: "light" },
        { id: "cam-main", name: "Persp_Camera", kind: "camera" },
      ],
    },
  ],
};
