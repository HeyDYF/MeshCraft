# MeshCraft

MeshCraft is a high-performance web-based 3D mesh editor built with React, TypeScript, React Three Fiber, Three.js, TailwindCSS, and Zustand.

The app is structured like a lightweight DCC tool:

- Top toolbar for import, mode switching, and runtime status
- Left outliner for scene, materials, and asset hierarchy
- Center 3D viewport with transform gizmos and rendering diagnostics
- Right inspector for transform, material, display, and performance controls
- Bottom status bar for FPS, triangles, draw calls, instances, decode time, and selection

## Current Capabilities

- Optimized R3F viewport with `powerPreference: "high-performance"` and capped DPR
- Procedural editor scene with object-level selection and transform controls
- Local `glb` / `gltf` import from file picker or drag and drop
- Draco-ready GLTF loading pipeline using local decoder assets in `public/draco`
- Imported asset scene tree generation, material extraction, transform registry, and explicit resource disposal
- Instanced scatter field for large-scene decoration with a single `InstancedMesh`
- Runtime LOD switching for the procedural hero model
- Custom hologram scan shader with time-based scanlines and Fresnel glow
- Zustand-driven editor state with minimal React render pressure

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- Zustand
- Three.js
- @react-three/fiber
- @react-three/drei
- Vitest

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## Project Structure

```text
src/
  app/                     App shell and top-level layout
  features/editor/         Editor UI, Zustand store, and editor-side utilities
  features/viewport/       Three.js / R3F viewport components and rendering helpers
  styles/                  Global Tailwind and app-level styling
public/draco/              Local Draco decoder assets
```

## Architecture Notes

- High-frequency 3D interaction state is kept out of React component state where possible.
- Imported assets go through explicit scene analysis so the outliner, material inspector, and transform system can share one state model.
- Geometry, materials, and textures are explicitly disposed on unload to reduce browser-side memory leaks.
- The viewport is already split from the app shell, but the `three-stack` bundle is still the main production chunk and should be reduced further.

## Known Gaps

- Imported glTF sub-mesh selection and highlight feedback can still be improved further.
- The material system supports bound slot editing, but texture slot editing is still shallow.
- The current build still emits a large `three-stack` production chunk.
- More complete end-to-end workflows for export, persistence, and advanced material authoring are still pending.

## Repository

Suggested remote:

```bash
git remote add origin https://github.com/HeyDYF/MeshCraft.git
```
