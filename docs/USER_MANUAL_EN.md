[English](./USER_MANUAL_EN.md) | [简体中文](./USER_MANUAL_ZH.md)

---

# MeshCraft User Manual

**Version 0.1.0** · A high-performance, browser-based 3D mesh editor

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Getting Started](#3-getting-started)
4. [Interface Overview](#4-interface-overview)
5. [Viewport Navigation](#5-viewport-navigation)
6. [Working with the Procedural Scene](#6-working-with-the-procedural-scene)
7. [Importing 3D Assets](#7-importing-3d-assets)
8. [Transform Editing](#8-transform-editing)
9. [Material Editing](#9-material-editing)
10. [Texture Management](#10-texture-management)
11. [Display Controls](#11-display-controls)
12. [Exporting Scenes](#12-exporting-scenes)
13. [Project Snapshots](#13-project-snapshots)
14. [Editor Modes](#14-editor-modes)
15. [Visual Effects Guide](#15-visual-effects-guide)
16. [Performance Monitoring](#16-performance-monitoring)
17. [Keyboard & Mouse Reference](#17-keyboard--mouse-reference)
18. [Troubleshooting](#18-troubleshooting)
19. [Technical Notes](#19-technical-notes)
20. [FAQ](#20-faq)

---

## 1. Introduction

**MeshCraft** is a lightweight, browser-based 3D mesh editor built with modern web technologies including React 19, TypeScript, Three.js, React Three Fiber, TailwindCSS, and Zustand. It runs entirely in your browser — no plugins, no installs, no cloud dependency.

MeshCraft is designed for:

- **3D Artists** who need a quick viewport to inspect, tweak, and export glTF assets.
- **Game & Web Developers** prototyping 3D scenes and verifying model quality.
- **Designers** exploring PBR materials, lighting, and visual effects in real time.
- **Students** learning 3D graphics concepts with a hands-on, approachable tool.

### Key Capabilities

| Capability | Description |
|---|---|
| Procedural Scene | A built-in turbine assembly with LOD switching and animated components |
| glTF Import | Drag-and-drop `.glb` / `.gltf` import with Draco decompression |
| Transform Editing | Translate, rotate, and scale objects via gizmos or numeric fields |
| PBR Materials | Edit base color, metalness, roughness, emission, and opacity |
| Visual Effects | Hologram scan shader, instanced scatter field, bloom, and vignette |
| Scene Export | One-click export to binary glTF (`.glb`) |
| Project Snapshots | Save and restore full editor state as JSON |

---

## 2. System Requirements

### Browser

| Browser | Minimum Version |
|---|---|
| Google Chrome | 90+ |
| Microsoft Edge | 90+ |
| Mozilla Firefox | 90+ |

> [!IMPORTANT]
> **WebGL 2.0 is required.** MeshCraft uses advanced GPU rendering features that depend on WebGL 2.0. If your browser does not support it, the viewport will not render.

### Hardware

- **GPU**: A dedicated or integrated GPU with WebGL 2.0 support is recommended.
- **RAM**: 4 GB minimum; 8 GB or more recommended for larger imported models.
- **Screen**: 1280 × 720 minimum resolution; **1920 × 1080 recommended** for comfortable use of all panels.

### Development

- **Node.js**: Version 18 or later.
- **npm**: Bundled with Node.js.

---

## 3. Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/HeyDYF/MeshCraft.git
cd MeshCraft
npm install
```

### Starting the Development Server

```bash
npm run dev
```

Vite will start a local server (typically at `http://localhost:5173`). Open the URL in a supported browser to launch MeshCraft.

### First Launch Walkthrough

1. The editor opens with the default **TurbineAssembly** procedural scene.
2. The **Core_Rotor** object is pre-selected and slowly spinning.
3. Drag in the center viewport to orbit the camera around the scene.
4. Explore the left **Scene Outliner** to see the full hierarchy.
5. Use the right **Inspector** panel to modify transforms and materials.

### Building for Production

```bash
npm run build
```

The optimized output is written to the `dist/` directory. You can preview it with:

```bash
npm run preview
```

### Running Tests

```bash
npm test
```

Tests are executed via **Vitest** and cover the editor store, import pipeline, bindings, snapshot serialization, and viewport utilities.

---

## 4. Interface Overview

MeshCraft follows a familiar DCC (Digital Content Creation) layout with five primary regions.

### Top Toolbar

The toolbar spans the full width of the window and contains:

| Element | Description |
|---|---|
| **MeshCraft Logo** | Application branding (top-left) |
| **New** | Reset the project to its default state |
| **Open** | Load a previously saved `meshcraft-project.json` project snapshot |
| **Save** | Download the current editor state as a `meshcraft-project.json` file |
| **Import** | Open a file picker to import `.glb` or `.gltf` assets |
| **Mode Switcher** | Toggle between **Object**, **Material**, **Render**, and **Analyze** modes |
| **Import Status** | Shows the current import state: idle, decoding, ready, or error |
| **Unsaved Indicator** | Displays **Unsaved** (amber) or **Saved** (green) |
| **Asset Chip** | When an asset is imported, shows its name; click to unload |
| **FPS Counter** | Real-time GPU frames-per-second readout |
| **Export GLB** | Primary action button to export the scene as binary glTF |

### Left Panel — Scene Outliner

A hierarchical tree view of all objects in the scene:

- **Tabs**: Scene · Assets · Materials. Each tab filters the outliner to the most relevant node groups.
- **Search**: A search field filters visible nodes by name while preserving the matching parent chain.
- **Node Types**: Each node displays an icon indicating its kind — mesh (cube), group (boxes), material (palette), texture (image), light (bulb), or camera.
- **Expand / Collapse**: Click the chevron arrow to expand or collapse group nodes.
- **Click to Select**: Click any node to select it; the Inspector panel updates immediately.
- **Triangle Count**: Mesh nodes display their triangle count (e.g., `184K`) in a muted label.
- **Footer Summary**: A summary line at the bottom shows total meshes, materials, and textures.

### Center Viewport

The 3D rendering canvas occupies the largest area of the screen:

- **3D Canvas**: Powered by React Three Fiber and Three.js with ACES Filmic tone mapping.
- **Orbit Navigation**: Drag, right-drag, and scroll to navigate (see §5).
- **Transform Gizmos**: When an object is selected in Object mode, interactive translate/rotate/scale gizmos appear.
- **Selection Highlight**: The selected object is highlighted with a cyan selection ring (procedural) or bounding-box wireframe (imported).
- **Viewport Info Overlay**: Top-left shows the selected object name, current mode, and navigation hints. Bottom-right shows the XYZ axis indicator (<span style="color:#ff5d5d">X</span> <span style="color:#5dff8f">Y</span> <span style="color:#5d9bff">Z</span>).
- **Drag-and-Drop Zone**: Drag a file over the viewport to trigger the import overlay.
- **Sub-toolbar**: A bar above the viewport shows the perspective label, current selection, transform tool buttons (Translate / Rotate / Scale), and the active mode/shading/tool combination.

### Right Panel — Inspector

A scrollable panel with collapsible sections:

| Section | Contents |
|---|---|
| **Transform** | Position (X/Y/Z), Rotation (X/Y/Z), Scale (X/Y/Z) numeric fields |
| **Material** | Base Color picker + hex code, Metalness, Roughness, Emission, Opacity sliders |
| **Textures** | List of texture slots on the active material, with Replace and Reset actions |
| **Selection** | Selected node name, internal ID, and bound material slot |
| **Display** | Shading mode selector and toggles for visual features (see §11) |
| **Performance** | Grid of real-time stats: FPS, triangles, instances, draw calls, GPU memory, decode time |

### Bottom Status Bar

A compact bar at the very bottom displays runtime diagnostics at a glance:

- Import status indicator with a pulsing cyan dot
- FPS, Triangles, Instances, Draw Calls, GPU Memory, Decode Time, and current Selection

---

## 5. Viewport Navigation

All viewport navigation is mouse-driven using the **OrbitControls** system:

| Action | Input |
|---|---|
| **Orbit** | Left-click + drag |
| **Pan** | Right-click + drag |
| **Zoom** | Scroll wheel or trackpad pinch |

### Camera Constraints

| Parameter | Value |
|---|---|
| Minimum distance | 3 units |
| Maximum distance | 18 units |
| Maximum polar angle | ~100° (`π / 1.8` radians) — prevents flipping below the ground plane |
| Orbit target | Center of scene `(0, 0.6, 0)` |
| Damping | Enabled with factor `0.08` for smooth deceleration |

> [!TIP]
> Enable **Auto Rotate** in the Display section of the Inspector to let the camera orbit the scene automatically. This is great for presentation or hands-free viewing.

---

## 6. Working with the Procedural Scene

### Default Scene — TurbineAssembly

On first launch, MeshCraft loads a procedural turbine assembly with the following hierarchy:

**Meshes**

| Object | Triangle Count | Description |
|---|---|---|
| Housing_Shell | ~184K | Open cylindrical housing with edge highlights |
| Core_Rotor | ~96K | Central spinning rotor with radial blades |
| Intake_Vents | ~42K | Two torus-shaped intake rings |
| Fastener_Array | ~18K | Ring of spherical fastener bolts |

**Materials**

| Material | Base Color | Metalness | Roughness | Emission |
|---|---|---|---|---|
| Brushed_Steel | `#697587` | 0.86 | 0.34 | 0.08 |
| Carbon_Weave | `#8b94a3` | 0.85 | 0.30 | 0.02 |
| Emissive_Trim | `#39d8ff` | 0.80 | 0.18 | 2.40 |

### Selecting Objects

- **Click in Viewport**: Click directly on a mesh in the 3D viewport to select it.
- **Click in Outliner**: Click a node in the left Scene panel to select it.

The selection updates the Inspector panel, activates the bound material, and shows a selection ring around the object.

### Rotor Animation

The Core_Rotor continuously rotates around the Z-axis at a speed of `0.6 rad/s`. When **Auto Rotate** is enabled, the entire assembly also rotates around the Y-axis at `0.2 rad/s`.

### LOD System

The procedural scene uses a three-level Level of Detail system that adjusts geometry complexity based on camera distance:

| LOD Level | Distance Threshold | Blade Count | Housing Segments |
|---|---|---|---|
| **High** | < 7 units | 10 | 48 |
| **Medium** | 7–14 units | 6 | 24 |
| **Low** | > 14 units | 3 | 12 |

> [!NOTE]
> Toggle **LOD Preview** in the Display controls to force the scene to Low LOD regardless of camera distance. The emissive trim turns amber to indicate preview mode.

---

## 7. Importing 3D Assets

### Supported Formats

| Format | Extension | Notes |
|---|---|---|
| Binary glTF | `.glb` | Recommended — single-file, compact |
| Embedded glTF | `.gltf` | JSON-based with embedded data URIs |

### Import Methods

1. **File Picker**: Click the **Import** button (upload icon) in the top toolbar and select a file.
2. **Drag and Drop**: Drag a `.glb` or `.gltf` file from your file manager onto the viewport. A cyan overlay confirms acceptance; a red overlay indicates an unsupported file type.

### Draco Compression Support

MeshCraft ships with local Draco decoder assets in `public/draco/`. Draco-compressed glTF files are decoded automatically — no external CDN required.

### Import Pipeline

When a file is imported, MeshCraft processes it through the following stages:

1. **File Read** — The browser reads the file as a data URL.
2. **glTF Decode** — The `GLTFLoader` (with Draco extension) parses the binary data.
3. **Scene Analysis** — Triangle counts, bounding boxes, and hierarchy are computed via `collectSceneMetrics`.
4. **Tree Generation** — A `SceneNode` tree is built from the imported scene graph via `buildImportedSceneTree`.
5. **Material Extraction** — PBR properties are read from each mesh material via `extractImportedMaterialBindings`.
6. **Texture Slot Mapping** — Each texture channel (map, normalMap, emissiveMap, etc.) is catalogued.
7. **Transform Registry** — Position, rotation, and scale are recorded for every imported object.

### Import Status Indicators

| Status | Indicator Color | Meaning |
|---|---|---|
| Idle | Gray | No asset loaded |
| Loading / Decoding | Cyan (animated) | File is being decoded |
| Ready | Green | Asset loaded successfully |
| Error | Red | Import failed — check the error message |

### Clearing an Imported Asset

Click the **asset name chip** in the toolbar to unload the imported asset and return to the procedural scene. All imported materials, textures, and transforms are cleaned up, and GPU resources are explicitly disposed.

---

## 8. Transform Editing

### Switching Gizmo Modes

Use the transform tool buttons in the viewport sub-toolbar to switch between:

| Mode | Icon | Description |
|---|---|---|
| **Translate** | Move3D | Drag arrows to move the object along X, Y, or Z |
| **Rotate** | RotateCw | Drag rings to rotate the object around an axis |
| **Scale** | Scaling | Drag handles to resize the object along an axis |

### Using Viewport Gizmos

When in **Object** mode with a transformable object selected and the **Transform Gizmo** display toggle enabled, interactive gizmo handles appear on the selected object. Drag a handle to apply the transformation. The Inspector fields update in real time.

### Using Numeric Inspector Fields

In the **Transform** section of the Inspector panel, directly type numeric values into the X, Y, Z fields for Position, Rotation, and Scale. Each axis is color-coded:

| Axis | Color |
|---|---|
| X | Red `#ff5d5d` |
| Y | Green `#5dff8f` |
| Z | Blue `#5d9bff` |

> [!TIP]
> Transform editing works for **both** procedural scene objects (Housing_Shell, Core_Rotor, etc.) and imported glTF objects. Select any mesh in the outliner or viewport to begin editing.

---

## 9. Material Editing

### Selecting a Material

Materials are activated automatically when you select an object:

- **Via Scene Tree**: Click a mesh node — the bound material is loaded into the Inspector.
- **Via Material Node**: Click a material node directly (e.g., `Brushed_Steel`) in the outliner.
- **Via Viewport Click**: Click a mesh in the 3D viewport.

### PBR Properties

| Property | Control | Range | Description |
|---|---|---|---|
| **Base Color** | Color picker + hex input | Any color | The diffuse albedo color of the surface |
| **Metalness** | Slider | 0.00 – 1.00 | 0 = dielectric, 1 = fully metallic |
| **Roughness** | Slider | 0.00 – 1.00 | 0 = mirror-smooth, 1 = fully rough |
| **Emission** | Slider | 0.00 – 4.00 | Emissive intensity; values > 1.0 bloom when Post FX is on |
| **Opacity** | Slider | 0.00 – 1.00 | 0 = fully transparent, 1 = fully opaque |

### Procedural vs. Imported Material Editing

- **Procedural materials** (Brushed_Steel, Carbon_Weave, Emissive_Trim) are editable whenever a procedural mesh or material node is selected.
- **Imported materials** are extracted from the glTF file during import. They become editable when an imported mesh with a recognized material binding is selected.

> [!NOTE]
> Changes to imported materials are applied live to the Three.js material objects in the scene. The material `needsUpdate` flag is set automatically.

---

## 10. Texture Management

### Viewing Texture Slots

When a material with texture maps is selected, the **Textures** section of the Inspector lists all bound texture channels. Each slot shows:

- **Channel name** — e.g., `map`, `normalMap`, `emissiveMap`
- **Texture name** — The original filename or generated ID
- **Texture ID** — The internal identifier or data URL reference

### Supported Texture Channels

MeshCraft recognizes all Three.js `MeshStandardMaterial` texture channels, including:

`map` · `normalMap` · `emissiveMap` · `roughnessMap` · `metalnessMap` · `aoMap` · `displacementMap` · `alphaMap` · `envMap` · `bumpMap`

### Replacing Textures

1. Click the **Replace** button on a texture slot.
2. Select an image file in the supported format.
3. The texture is loaded and applied immediately to the material.

**Supported image formats**: `.png`, `.jpg`, `.jpeg`, `.webp`

An **Override** badge appears on slots with replaced textures.

### Resetting Texture Overrides

Click the **Reset** button on a texture slot to revert it back to the original texture from the imported glTF file. The replacement image is disposed.

> [!WARNING]
> Texture replacement is currently only available for **imported** materials. Procedural materials do not have texture slots.

---

## 11. Display Controls

The **Display** section of the Inspector panel provides toggles to control rendering features.

### Shading Modes

| Mode | Description |
|---|---|
| **Shaded** | Standard PBR rendering with lighting and shadows |
| **Wireframe** | Geometry displayed as a wireframe mesh |
| **Matcap** | Reduced metalness for a stylized material-capture look |
| **Normals** | Blue-tinted rendering to visualize surface normals |

### Feature Toggles

| Toggle | Default | Description |
|---|---|---|
| **Wireframe Overlay** | Off | Activates wireframe shading mode |
| **Shadows** | On | Contact shadows and shadow maps beneath objects |
| **Grid** | On | Infinite grid with cell (`0.65`) and section (`3.25`) layers; fades over distance |
| **Transform Gizmo** | On | Show XYZ axis arrows and interactive transform handles |
| **Scatter Field** | On | 1,000 instanced particles in an annular distribution around the scene |
| **Hologram Scan** | On | Custom GLSL hologram shell with animated scanlines |
| **Post FX** | On | Bloom + Vignette post-processing effects |
| **LOD Preview** | Off | Forces low-detail LOD; trim turns amber as a visual indicator |
| **Auto Rotate** | On | Slowly rotates the scene assembly around the Y-axis |

---

## 12. Exporting Scenes

### How to Export

Click the **Export GLB** button (with sparkle icon) in the top-right of the toolbar.

### Export Behavior

| Scenario | What is Exported |
|---|---|
| Imported asset is loaded | The imported scene root (with current transforms) |
| No imported asset | The procedural TurbineAssembly scene |

### Output Format

All exports produce a **Binary glTF (`.glb`)** file using the Three.js `GLTFExporter` with `binary: true` and `onlyVisible: true`.

### File Naming

| Scenario | Output Filename |
|---|---|
| No imported asset | `meshcraft-scene.glb` |
| Imported asset (e.g., `robot.glb`) | `robot-export.glb` |

> [!NOTE]
> The export creates a browser download. The file is generated entirely client-side — no data is sent to any server.

---

## 13. Project Snapshots

### Saving a Project

1. Click the **Save** button (floppy disk icon) in the toolbar.
2. The editor serializes the complete state into a `meshcraft-project.json` file.
3. The file downloads to your browser's default download location.

**What's saved in a snapshot:**

| Data | Included |
|---|---|
| Editor mode | ✅ |
| Current selection (ID + name) | ✅ |
| Active transform tool | ✅ |
| Material library (procedural + imported) | ✅ |
| Object transforms (procedural + imported) | ✅ |
| Display settings (all toggles) | ✅ |
| Imported asset name & URL | ✅ |
| Imported material bindings & texture slots | ✅ |
| Texture overrides | ✅ |
| Scene tree structure | ✅ |

### Opening a Project

1. Click the **Open** button (folder icon) in the toolbar.
2. Select a `.json` or `.meshcraft` file.
3. The editor clears the current state and applies the snapshot.

The snapshot parser validates the `version` field (currently `1`) and rejects unsupported formats.

### New Project

Click the **New** button (file-plus icon) to reset the editor to its default state. If you have unsaved changes, a confirmation dialog will appear.

### Unsaved Changes Warning

MeshCraft registers a `beforeunload` event handler. If you have unsaved changes and attempt to close or reload the browser tab, a browser-native confirmation dialog will appear.

> [!WARNING]
> **Limitation**: Project snapshots store the imported asset's data URL, but external model files are **not embedded** in the snapshot. If you save a project with an imported `.glb` and open it later, MeshCraft will attempt to re-decode the stored data URL. For best reliability, keep original model files accessible.

---

## 14. Editor Modes

The mode switcher in the top toolbar controls the editor's operational context:

| Mode | Icon | Purpose |
|---|---|---|
| **Object** | Box | Scene-level object manipulation — transforms, gizmos, selection |
| **Material** | Palette | Material editing focus — best used with the material Inspector section |
| **Render** | Aperture | Rendering preview — evaluate final visual quality |
| **Analyze** | Activity | Performance analysis — focus on metrics and optimization |

> [!TIP]
> Transform gizmos are only active in **Object** mode. Switch to Object mode before attempting to drag gizmo handles.

---

## 15. Visual Effects Guide

### Hologram Scan Shell

A custom GLSL shader rendered as a translucent shell slightly larger than the Housing_Shell:

- **Animated Scanlines**: A `sin`-based wave driven by `uTime` scrolls vertically.
- **Fresnel Glow**: Edges facing away from the camera glow brighter, controlled by `uFresnelPower` (default `2.8`).
- **Grid Pulse**: A high-frequency sinusoidal pattern creates a subtle horizontal grid flicker.
- **Color**: Cyan glow (`#39d8ff`) with additive blending and partial transparency (`uOpacity: 0.32`).

### Instanced Scatter Field

- **1,000 instanced particles** rendered via a single `InstancedMesh` draw call.
- **Annular distribution**: Particles are arranged in a ring-shaped volume around the scene center.
- **Deterministic randomness**: A seeded PRNG ensures consistent particle placement across sessions.
- **Per-instance transforms**: Each particle has randomized position, rotation, and scale.

### Post-Processing

| Effect | Description |
|---|---|
| **Bloom** | Bright emissive surfaces (emission > 1.0) produce a soft glow halo |
| **Vignette** | Subtle darkening at the edges of the viewport |

### LOD Switching

Three detail levels are computed per frame based on camera distance:

- **High** (< 7 units): Maximum geometry detail — 48 housing segments, 10 rotor blades
- **Medium** (7–14 units): Reduced detail — 24 segments, 6 blades
- **Low** (> 14 units): Minimum detail — 12 segments, 3 blades

### HDR Environment Lighting

MeshCraft uses the drei `Environment` component with the `city` preset, providing realistic image-based lighting with specular reflections on metallic surfaces.

---

## 16. Performance Monitoring

### Metrics

Real-time metrics are displayed in both the Inspector's **Performance** section and the bottom **Status Bar**:

| Metric | Description | Typical Value |
|---|---|---|
| **FPS** | Frames per second | 60 (stable) |
| **Triangles** | Total triangles rendered per frame | ~342K (procedural) |
| **Draw Calls** | Number of GPU draw calls per frame | ~18 |
| **Instances** | Number of instanced objects | 1,000 (scatter field on) |
| **GPU Memory** | Estimated GPU memory usage | ~284 MB |
| **Decode Time** | Time to decode the most recent import | Varies (ms) |
| **Target** | Stability assessment | "Stable" (≥60 fps) or "Warm" |

### How to Interpret These Metrics

- **FPS below 30**: Consider disabling **Post FX**, **Scatter Field**, or **Shadows** to recover performance.
- **High triangle count**: Zoom out to trigger LOD or enable **LOD Preview**.
- **High draw calls**: Each visible material on each mesh creates a draw call. Instanced scatter field uses only 1 draw call.

### Performance Optimization Tips

1. Disable **Scatter Field** to remove 1,000 instanced particles.
2. Disable **Post FX** to skip bloom and vignette passes.
3. Disable **Hologram Scan** to remove the GLSL shell.
4. Disable **Shadows** to skip shadow map computation.
5. Enable **LOD Preview** to force low-detail geometry.
6. Use **Wireframe** shading to reduce fragment shader workload.

---

## 17. Keyboard & Mouse Reference

| Input | Action |
|---|---|
| Left-click + drag (viewport) | Orbit camera around the scene |
| Right-click + drag (viewport) | Pan camera laterally |
| Scroll wheel / trackpad | Zoom in or out |
| Left-click on object (viewport) | Select the object |
| Left-click on tree node (outliner) | Select the node and update Inspector |
| Left-click chevron (outliner) | Expand or collapse a group node |
| Click **Translate** button | Switch to translate gizmo mode |
| Click **Rotate** button | Switch to rotate gizmo mode |
| Click **Scale** button | Switch to scale gizmo mode |
| Drag gizmo handle (viewport) | Apply transform to the selected object |
| Type in numeric field (Inspector) | Set exact transform values |
| Click color swatch (Inspector) | Open the browser color picker |
| Drag slider (Inspector) | Adjust material property |
| Drag file onto viewport | Import a `.glb` / `.gltf` file |

---

## 18. Troubleshooting

### WebGL Not Supported

**Symptom**: The viewport is blank or shows a WebGL error.

**Solution**:
1. Verify your browser version meets the minimum requirements (Chrome/Edge/Firefox 90+).
2. Check that hardware acceleration is enabled in browser settings.
3. Update your GPU drivers.
4. Try a different browser.

### Import Fails

**Symptom**: The import status shows a red "Error" indicator.

**Solution**:
1. Verify the file is a valid `.glb` or `.gltf` file.
2. Check the browser console for detailed error messages.
3. If the file uses Draco compression, ensure the `public/draco/` directory is present and contains decoder assets (`draco_decoder.js`, `draco_decoder.wasm`, `draco_wasm_wrapper.js`).
4. Try a different glTF file to rule out file corruption.

### Low FPS

**Symptom**: Framerate drops below 30 fps.

**Solution**:
1. Disable **Scatter Field**, **Post FX**, **Hologram Scan**, and **Shadows** in the Display section.
2. Zoom out to trigger lower LOD levels.
3. Close other GPU-intensive browser tabs.
4. Verify your GPU supports WebGL 2.0 properly.

### Black Viewport

**Symptom**: The viewport renders a solid black screen.

**Solution**:
1. This may indicate a WebGL context loss. Refresh the page.
2. Check that no browser extension is blocking WebGL.
3. Ensure your system is not running in a low-power GPU mode.

### Model Not Visible After Import

**Symptom**: Import succeeds (green status) but nothing appears in the viewport.

**Solution**:
1. The model may be very small or very large. Check the **Transform** section in the Inspector for the imported root's scale.
2. The model may be positioned far from the origin. Reset the Y position to approximately `-1.15`.
3. Try zooming out to maximum distance (scroll down).

---

## 19. Technical Notes

### WebGL Configuration

MeshCraft configures the rendering context for optimal quality and performance:

- **Device Pixel Ratio**: Capped at `2.0` to prevent excessive GPU load on high-DPI screens.
- **Power Preference**: Set to `"high-performance"` to request the discrete GPU on dual-GPU systems.
- **Tone Mapping**: ACES Filmic tone mapping for cinematic color response.
- **Color Space**: sRGB output color space for accurate color display.
- **Shadow Maps**: PCF Soft shadow maps when shadows are enabled.

### Resource Management

MeshCraft explicitly disposes GPU resources to prevent memory leaks:

- Imported scenes are traversed and all geometries, materials, and textures are disposed via `disposeSceneResources`.
- Object URLs created for import and texture overrides are revoked via `URL.revokeObjectURL`.
- Override texture caches are cleaned up on component unmount.

### State Management

The editor uses **Zustand** for global state management:

- A single `useEditorStore` store holds all editor state.
- Individual selectors (e.g., `state.mode`, `state.display.shading`) are subscribed independently to minimize React re-renders.
- High-frequency 3D interaction state (camera position, frame deltas) is kept out of React state entirely.

### Build Output

The Vite production build generates:

- A **three-stack** chunk containing Three.js, React Three Fiber, and drei.
- An **icons** chunk for Lucide React icons.
- The main application bundle with editor and viewport code.

> [!NOTE]
> The three-stack chunk is the largest production asset. Future optimizations may further tree-shake unused Three.js modules.

---

## 20. FAQ

**Q: Can I import OBJ, FBX, or STL files?**
A: Not currently. MeshCraft only supports `.glb` and `.gltf` formats. Convert your models to glTF using tools like Blender or the [glTF Pipeline](https://github.com/CesiumGS/gltf-pipeline).

**Q: Does MeshCraft require an internet connection?**
A: No. Once the development server is running or the production build is deployed, MeshCraft operates entirely offline. Draco decoders are bundled locally.

**Q: Can I edit individual sub-meshes of an imported model?**
A: Yes. After import, click on individual meshes in the viewport or outliner to select them. You can edit their transforms and materials independently.

**Q: How do I undo a change?**
A: MeshCraft does not currently have an undo/redo system. Use **Save** frequently to create project snapshots you can reload.

**Q: Can I use MeshCraft on a tablet or mobile device?**
A: MeshCraft is designed for desktop browsers. Touch interactions may partially work, but the interface is optimized for mouse and keyboard input on screens ≥ 1280 × 720.

**Q: What happens to my data?**
A: All processing happens locally in your browser. No data is uploaded to any server. Project snapshots and exports are saved as browser downloads.

**Q: Can I add custom lights to the scene?**
A: The lighting setup (key light, rim light, HDR environment) is fixed in the current version. Material emission can be increased to simulate additional light sources.

**Q: The scatter field particles look different between sessions — why?**
A: They shouldn't. The scatter field uses a deterministic seeded PRNG (seed `17`) to ensure identical particle placement on every session.

**Q: How do I report a bug or request a feature?**
A: Open an issue on the [GitHub repository](https://github.com/HeyDYF/MeshCraft).

---

<div align="center">

**MeshCraft** · Built with React, Three.js & TypeScript · [GitHub](https://github.com/HeyDYF/MeshCraft)

</div>
