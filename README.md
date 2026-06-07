<p align="center">
  <h1 align="center">🔷 MeshCraft</h1>
  <p align="center">
    <strong>High-performance, browser-based 3D mesh editor</strong>
    <br />
    Built with React 19 · Three.js · TypeScript · Zustand
  </p>
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/HeyDYF/MeshCraft/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/HeyDYF/MeshCraft?style=flat-square" alt="License" />
  </a>
  <a href="https://github.com/HeyDYF/MeshCraft/stargazers">
    <img src="https://img.shields.io/github/stars/HeyDYF/MeshCraft?style=flat-square" alt="Stars" />
  </a>
  <a href="https://github.com/HeyDYF/MeshCraft/issues">
    <img src="https://img.shields.io/github/issues/HeyDYF/MeshCraft?style=flat-square" alt="Issues" />
  </a>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <a href="https://github.com/HeyDYF/MeshCraft/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  </a>
</p>

---

MeshCraft is a lightweight, professional-grade 3D mesh editor that runs entirely in the browser. It provides a DCC-like interface for real-time model inspection, PBR material tuning, glTF/GLB import & export, custom shader effects, and high-performance viewport rendering — all powered by React Three Fiber and Zustand.

<details>
<summary>📑 <strong>Table of Contents</strong></summary>

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🎮 Controls](#-controls)
- [📦 Tech Stack](#-tech-stack)
- [🏗️ Project Structure](#️-project-structure)
- [🧠 Architecture](#-architecture)
- [📋 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📖 Documentation](#-documentation)

</details>

---

## ✨ Features

| Category | Capabilities |
|:---------|:-------------|
| **Import & Export** | Drag-and-drop `.glb` / `.gltf` import · Draco compression support · Full scene tree analysis on import · One-click GLB export |
| **Transform Editing** | Translate / Rotate / Scale gizmos · Numeric Inspector fields · Color-coded XYZ axes · Procedural + imported object support |
| **PBR Materials** | Base Color · Metalness · Roughness · Emission · Opacity · Works on both procedural and imported materials |
| **Texture System** | Per-slot texture inspection · Runtime texture replacement (`.png`, `.jpg`, `.webp`) · Override reset |
| **Scene Graph** | Hierarchical outliner with expand/collapse · Scene / Assets / Materials filtered views · Node search · Click-to-select · Triangle counts |
| **Visual Effects** | Custom GLSL hologram scanner · Instanced scatter field (1000 particles) · Bloom + Vignette post-processing · LOD switching (3 levels) |
| **Project Management** | Save/Load `meshcraft-project.json` snapshots · Imported-session persistence · Dirty-state tracking · Unsaved-changes protection |
| **Display Controls** | 4 shading modes (Shaded / Wire / Matcap / Normals) · Grid · Shadows · Post FX · Auto-rotate · LOD preview |
| **Performance** | Capped DPR · `high-performance` WebGL · Explicit resource disposal · InstancedMesh rendering · Real-time FPS / triangles / draw calls / GPU memory monitoring |
| **Editor Modes** | Object · Material · Render · Analyze |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- A modern browser with **WebGL 2.0** support (Chrome 90+, Edge 90+, Firefox 90+)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/HeyDYF/MeshCraft.git
cd MeshCraft

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

### Other Commands

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## 🎮 Controls

| Input | Action |
|:------|:-------|
| **Left drag** | Orbit camera |
| **Right drag** | Pan camera |
| **Scroll wheel / Trackpad** | Zoom in/out |
| **Click object** | Select object in viewport |
| **Click tree node** | Select object in scene outliner |
| **Toolbar buttons** | Switch transform mode (Translate / Rotate / Scale) |
| **Drag file into viewport** | Import `.glb` / `.gltf` asset |

---

## 📦 Tech Stack

| Layer | Technologies |
|:------|:-------------|
| **UI Framework** | React 19 · TypeScript · Vite 6 |
| **3D Rendering** | Three.js 0.176 · @react-three/fiber 9 · @react-three/drei 10 |
| **State Management** | Zustand 5 |
| **Styling** | TailwindCSS 3.4 |
| **Icons** | Lucide React |
| **Typography** | Space Grotesk · IBM Plex Mono (Google Fonts) |
| **Testing** | Vitest |

---

## 🏗️ Project Structure

```text
MeshCraft/
├── public/
│   └── draco/                    # Local Draco decoder assets for glTF
├── src/
│   ├── app/
│   │   └── AppShell.tsx          # Root layout — toolbar, panels, viewport, status bar
│   ├── features/
│   │   ├── editor/
│   │   │   ├── components/       # TopToolbar, ScenePanel, InspectorPanel, StatusBar
│   │   │   ├── lib/              # Import, export, snapshot, transform, material utilities
│   │   │   ├── store/            # Zustand editor store — all editor state & actions
│   │   │   └── types.ts          # TypeScript interfaces & default scene definition
│   │   └── viewport/
│   │       ├── components/       # SceneCanvas, ViewportModel, HologramShell, ScatterField
│   │       ├── lib/              # glTF loader, shader, scene analysis, instancing, LOD
│   │       └── store/            # Viewport-specific state (if any)
│   ├── styles/                   # Global Tailwind & app-level CSS
│   ├── App.tsx                   # App entry component
│   └── main.tsx                  # Vite entry point
├── docs/                         # User manuals (English & Chinese)
├── index.html                    # HTML shell
├── vite.config.ts                # Vite build configuration with chunk splitting
├── tailwind.config.ts            # Tailwind theme (panel colors, accent, fonts)
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

---

## 🧠 Architecture

### State Management

All editor state lives in a single **Zustand store** (`editor-store.ts`), organized into focused slices: selection, transforms, materials, textures, display, performance, import status, and project snapshots. High-frequency 3D interaction data stays outside React component state to minimize render pressure.

### Rendering Pipeline

The viewport is a React Three Fiber `<Canvas>` with:
- **42° FOV** PerspectiveCamera with ACES Filmic tone mapping
- **PCF soft shadow maps** and contact shadows
- **HDR environment lighting** (city preset)
- **Post-processing** via EffectComposer (Bloom + Vignette)
- **Capped DPR** (max 2.0) and `powerPreference: "high-performance"`
- **Performance bridge** sampling FPS, triangles, draw calls, and GPU memory every 400ms

### Resource Lifecycle

Imported assets go through a structured pipeline: **file read → glTF decode (with Draco) → scene analysis → tree node generation → material extraction → texture slot mapping → transform registry**. On unload, all geometry, materials, and textures are **explicitly disposed** to prevent browser-side memory leaks.

### Build Strategy

Production builds use Vite's Rollup `manualChunks` to split the bundle:
- `three-stack` — Three.js + React Three Fiber + drei
- `icons` — Lucide React icons

---

## 📋 Roadmap

- [x] Procedural scene with PBR materials and LOD
- [x] glTF / GLB import with Draco support
- [x] Full scene tree analysis and outliner
- [x] Transform editing (translate / rotate / scale)
- [x] PBR material editing for procedural and imported assets
- [x] Texture slot inspection and runtime replacement
- [x] Custom hologram scan shader
- [x] Instanced scatter field
- [x] Post-processing (Bloom + Vignette)
- [x] Project snapshot save/load
- [x] GLB export
- [ ] Improved imported sub-mesh selection and highlight feedback
- [ ] Deep texture slot editing (UV preview, texture painting)
- [ ] Multi-object selection and batch transforms
- [ ] Undo/redo system
- [ ] Plugin / extension architecture
- [ ] Asset library with preset materials and models
- [ ] Collaborative editing support
- [ ] Reduce `three-stack` production chunk size
- [ ] End-to-end export with full editor session semantics

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Development Setup

```bash
git clone https://github.com/<your-fork>/MeshCraft.git
cd MeshCraft
npm install
npm run dev      # Start dev server
npm test         # Run tests before submitting
```

Please ensure all tests pass and the production build succeeds (`npm run build`) before submitting a PR.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

MeshCraft is built on the shoulders of these outstanding open-source projects:

- [Three.js](https://threejs.org/) — The 3D rendering engine powering the viewport
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — React renderer for Three.js
- [drei](https://github.com/pmndrs/drei) — Essential helpers for React Three Fiber
- [Zustand](https://github.com/pmndrs/zustand) — Lightweight state management
- [Vite](https://vitejs.dev/) — Lightning-fast build tooling
- [Lucide](https://lucide.dev/) — Beautiful, consistent icon set
- [Google Fonts](https://fonts.google.com/) — Space Grotesk & IBM Plex Mono typography

---

## 📖 Documentation

| Document | Language | Description |
|:---------|:---------|:------------|
| [User Manual (EN)](./docs/USER_MANUAL_EN.md) | English | Complete operation guide with step-by-step instructions |
| [用户手册 (ZH)](./docs/USER_MANUAL_ZH.md) | 简体中文 | 完整操作指南，包含详细步骤说明 |

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/HeyDYF">HeyDYF</a>
</p>
