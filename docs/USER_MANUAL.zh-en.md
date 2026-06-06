# MeshCraft User Manual / 使用手册

## 1. Overview / 概述

### English
MeshCraft is a browser-based 3D mesh editor focused on real-time inspection, transform editing, material tuning, imported glTF / GLB review, and high-performance viewport rendering.

### 中文
MeshCraft 是一个运行在浏览器中的 3D 网格编辑器，当前重点能力包括实时模型查看、对象变换编辑、材质调节、glTF / GLB 导入检查，以及高性能视口渲染。

## 2. Interface Layout / 界面布局

### English
- Top Toolbar: open project snapshot, save snapshot, import glTF / GLB, mode switching, runtime status.
- Left Panel: scene outliner for meshes, materials, textures, lights, and imported hierarchy.
- Center Viewport: main 3D editing area with orbit navigation, transform gizmos, LOD behavior, and viewport effects.
- Right Inspector: transform, material, texture inspection, display toggles, and performance readouts.
- Bottom Status Bar: FPS, triangle count, instances, draw calls, decode time, GPU estimate, and current selection.

### 中文
- 顶部工具栏：打开项目快照、保存快照、导入 glTF / GLB、模式切换、运行状态。
- 左侧面板：场景树，包含 mesh、材质、纹理、灯光，以及导入资产层级。
- 中央视口：主要 3D 编辑区域，支持轨道导航、变换轴、LOD 行为和视口特效。
- 右侧 Inspector：变换、材质、纹理查看、显示开关和性能信息。
- 底部状态栏：FPS、三角面数、实例数、Draw Calls、解码耗时、GPU 估算和当前选中对象。

## 3. Starting the App / 启动应用

### English
1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Open the local Vite URL shown in the terminal.

### 中文
1. 运行 `npm install` 安装依赖。
2. 运行 `npm run dev` 启动开发服务器。
3. 打开终端中显示的本地 Vite 地址。

## 4. Viewport Navigation / 视口导航

### English
- Left drag: orbit camera
- Right drag: pan
- Mouse wheel / trackpad scroll: zoom
- Select a mesh or imported node to show transform gizmo and selection highlight

### 中文
- 左键拖拽：环绕相机
- 右键拖拽：平移
- 鼠标滚轮 / 触控板滚动：缩放
- 选中 mesh 或导入节点后，会显示变换轴和选中高亮

## 5. Importing 3D Assets / 导入 3D 资产

### English
You can import `.glb` or `.gltf` files in two ways:
- Click `Import` in the top toolbar
- Drag and drop a supported file into the viewport

Imported assets are decoded through the glTF pipeline, analyzed into scene tree nodes, material bindings, transform registry entries, and texture slot metadata.

### 中文
你可以通过两种方式导入 `.glb` 或 `.gltf`：
- 点击顶部工具栏里的 `Import`
- 直接把支持的文件拖进视口

导入后的资产会经过 glTF 加载流程，并自动分析生成场景树节点、材质绑定、变换注册表和纹理槽位元数据。

## 6. Transform Editing / 变换编辑

### English
- Use the `translate / rotate / scale` buttons above the viewport to switch gizmo mode.
- Select procedural meshes or imported transformable nodes.
- Edit transform either with the gizmo or through numeric fields in the Inspector.

### 中文
- 使用视口上方的 `translate / rotate / scale` 按钮切换 gizmo 模式。
- 选中程序化 mesh 或可变换的导入节点。
- 既可以直接拖动 gizmo，也可以在 Inspector 中输入数值编辑变换。

## 7. Material Editing / 材质编辑

### English
For bound material selections, the Inspector lets you adjust:
- Base Color
- Metalness
- Roughness
- Emission
- Opacity

Procedural materials and imported materials both participate in the same editor-side material workflow.

### 中文
对于已绑定的材质选择，Inspector 中可以调节：
- Base Color
- Metalness
- Roughness
- Emission
- Opacity

程序化材质和导入材质都已经接入同一套编辑工作流。

## 8. Texture Inspection / 纹理查看

### English
When an imported material is selected, the `Textures` section in the Inspector shows:
- Texture channel name, such as `map` or `normalMap`
- Texture display name
- Internal texture id

This is currently inspection-focused and does not yet support replacing texture files directly from the UI.

### 中文
当选中导入材质时，Inspector 的 `Textures` 分组会显示：
- 纹理通道名，例如 `map`、`normalMap`
- 纹理显示名称
- 内部 texture id

当前这部分以查看为主，还不支持直接在 UI 中替换贴图文件。

## 9. Display Controls / 显示控制

### English
The `Display` section lets you toggle:
- Shading mode
- Grid
- Shadows
- Transform gizmo
- Scatter field
- Hologram scan shell
- Post FX
- LOD preview
- Auto rotate

### 中文
`Display` 分组支持切换：
- 着色模式
- Grid
- 阴影
- Transform Gizmo
- Scatter Field
- 全息扫描外壳
- Post FX
- LOD Preview
- 自动旋转

## 10. Project Snapshot Workflow / 项目快照工作流

### English
`Save` writes the current procedural editor state into a local project snapshot JSON file.

The snapshot currently stores:
- editor mode
- current selection
- transform tool mode
- procedural material values
- procedural object transforms
- display toggles
- imported asset name reference

`Open` restores the saved procedural editor state from a snapshot file.

Important limitation:
- If the snapshot references an imported external asset, the file name is remembered, but the actual external model must be re-imported manually.

### 中文
`Save` 会把当前程序化编辑状态保存为本地项目快照 JSON 文件。

当前快照会保存：
- editor mode
- 当前选中对象
- 变换工具模式
- 程序化材质参数
- 程序化对象变换
- 显示开关
- 导入资产名称引用

`Open` 可以从快照文件恢复这些程序化编辑状态。

重要限制：
- 如果快照引用了外部导入资产，只会记住文件名，不会把外部模型本体嵌入快照中，恢复后仍需手动重新导入。

## 11. Export Workflow / 导出工作流

### English
Click `Export GLB` in the top toolbar to export the currently active scene as a binary glTF file.

Current behavior:
- If an imported asset is active, the imported scene root is exported.
- If no external asset is imported, the procedural MeshCraft demo scene is exported.
- Export output uses `.glb`.

Current limitation:
- The exported file is designed for scene handoff and inspection. It is not yet a full project-save substitute.

### 中文
点击顶部工具栏里的 `Export GLB` 可以把当前活动场景导出为二进制 glTF 文件。

当前行为：
- 如果当前处于导入资产模式，会导出 imported scene root。
- 如果当前没有导入外部资产，则会导出程序化的 MeshCraft 演示场景。
- 导出文件格式为 `.glb`。

当前限制：
- 这个导出更适合场景交付和查看，还不能替代完整的项目保存机制。

## 12. Imported Asset Selection Behavior / 导入资产选择行为

### English
- Clicking an imported sub-mesh selects that node and shows a viewport highlight box.
- Clicking the imported root group selects the imported root transform.
- Imported material nodes can participate in Inspector material editing.

### 中文
- 点击导入后的子 mesh 会选中对应节点，并显示视口包围高亮。
- 点击导入资产根组会切换到 imported root 变换。
- 导入材质节点已经可以接入 Inspector 材质编辑。

## 13. Performance Notes / 性能说明

### English
- The viewport uses capped DPR and high-performance WebGL settings.
- Imported asset resources are explicitly disposed on unload.
- Instanced scatter geometry is rendered through `InstancedMesh`.
- Procedural hero geometry uses runtime LOD switching.

### 中文
- 视口使用了受限 DPR 和高性能 WebGL 设置。
- 导入资产卸载时会显式释放资源。
- 散布装饰元素通过 `InstancedMesh` 渲染。
- 程序化主模型支持运行时 LOD 切换。

## 14. Known Limitations / 已知限制

### English
- The production bundle still contains a large `three-stack` chunk.
- Imported textures are inspectable but not yet replaceable through the UI.
- Snapshot restore does not embed external imported mesh files.
- Export is scene-oriented and does not preserve full editor session semantics.

### 中文
- 生产构建里仍然存在较大的 `three-stack` chunk。
- 导入贴图目前支持查看，不支持在 UI 中替换。
- 项目快照恢复不会内嵌外部导入模型文件。
- 当前导出以场景文件输出为主，不会完整保留编辑器会话语义。

## 15. Recommended Next Checks / 建议检查项

### English
- Verify imported asset selection after each major scene import.
- Re-import referenced external assets after loading a snapshot.
- Use `npm test` and `npm run build` before publishing a new build.

### 中文
- 每次导入较大场景后，先检查 imported 选择是否正常。
- 加载项目快照后，如果引用了外部模型，请重新导入对应资产。
- 发布新版本前先运行 `npm test` 和 `npm run build`。
