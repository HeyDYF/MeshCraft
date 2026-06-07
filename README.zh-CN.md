<p align="center">
  <h1 align="center">🔷 MeshCraft</h1>
  <p align="center">
    <strong>基于浏览器的高性能 3D 网格编辑器</strong>
    <br />
    基于 React 19 · Three.js · TypeScript · Zustand 构建
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

MeshCraft 是一款完全运行在浏览器中的轻量级、专业级 3D 网格编辑器。它提供类似经典 DCC 软件的界面，可进行实时的模型审查、PBR 材质调节、glTF/GLB 资产导入与导出、自定义着色器特效以及高性能视口渲染——这一切都由 React Three Fiber 和 Zustand 强力驱动。

<details>
<summary>📑 <strong>目录</strong></summary>

- [✨ 核心特性](#-核心特性)
- [🚀 快速开始](#-快速开始)
- [🎮 操作指南](#-操作指南)
- [📦 技术栈](#-技术栈)
- [🏗️ 项目结构](#️-项目结构)
- [🧠 架构设计](#-架构设计)
- [📋 路线图](#-路线图)
- [🤝 参与贡献](#-参与贡献)
- [📄 开源协议](#-开源协议)
- [🙏 致谢](#-致谢)
- [📖 项目文档](#-项目文档)

</details>

---

## ✨ 核心特性

| 功能模块 | 特性介绍 |
|:---------|:-------------|
| **导入与导出** | 支持文件选择器及拖放导入 `.glb` / `.gltf` 格式 · 集成 Draco 压缩解码 · 导入时自动分析场景树层级 · 支持一键导出当前场景为二进制 GLB 文件 |
| **变换编辑** | 平移、旋转、缩放轴（Gizmos）· 支持检查器数值精确输入 · XYZ 轴红绿蓝颜色编码 · 完美支持程序化对象及导入的外部模型 |
| **PBR 材质编辑** | 基础颜色（Base Color）、金属度（Metalness）、粗糙度（Roughness）、自发光（Emission）、不透明度（Opacity）调节 · 支持程序化与导入材质的独立重写 |
| **纹理系统** | 纹理槽通道检查 · 运行时纹理图片在线替换（支持 `.png`, `.jpg`, `.webp`）· 独立的覆盖重置功能 |
| **场景大纲** | 层级树形图展示（可展开/折叠）· Scene / Assets / Materials 视图筛选 · 节点搜索 · 视口与大纲双向选择反馈 · 网格节点显示三角面数 |
| **视觉特效** | 自定义 GLSL 全息扫描线着色器 · 实例化散布场景装饰（1000 个粒子单次 Draw Call）· Bloom 泛光与 Vignette 暗角后处理效果 · 3级动态 LOD（细节级别）自动切换 |
| **项目管理** | 支持保存与读取 `meshcraft-project.json` 项目快照 · 包含 imported 会话持久化 · 脏标记（Dirty-state）检测及未保存保护 |
| **显示控制** | 4 种着色模式（标准着色 / 线框 / Matcap 材质球 / 法线可视化）· 无限网格地板 · 接触面阴影 · 后处理开关 · 自动旋转 · LOD 强制预览 |
| **性能优化** | 设备像素比（DPR）上限控制 · WebGL `high-performance` 性能偏好 · 资源显式卸载与销毁 · 实时性能诊断看板（FPS / 三角面数 / Draw Calls / 估算 GPU 显存）|
| **编辑器模式** | 拥有 Object（对象）、Material（材质）、Render（渲染）、Analyze（分析）四大模式 |

---

## 🚀 快速开始

### 开发环境要求

- **Node.js** 18+（推荐 LTS 版本）
- **npm** 9+
- 支持 **WebGL 2.0** 的现代化浏览器（Chrome 90+、Edge 90+、Firefox 90+）

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/HeyDYF/MeshCraft.git
cd MeshCraft

# 安装依赖
npm install

# 启动本地开发服务器
npm run dev
```

在浏览器中打开终端中显示的本地地址（通常为 `http://localhost:5173`）。

### 常用命令

```bash
# 运行单元测试
npm test

# 生产环境打包构建
npm run build

# 本地预览构建产物
npm run preview
```

---

## 🎮 操作指南

| 输入方式 | 对应操作 |
|:------|:-------|
| **鼠标左键拖拽（视口空白区）** | 围绕中心点旋转相机 |
| **鼠标右键拖拽** | 平移相机 |
| **鼠标滚轮 / 触控板双指往复** | 缩放视口（Zoom）|
| **鼠标左键点击 3D 对象** | 选中视口中的模型 |
| **左键点击左侧场景树节点** | 选中大纲中的对象 |
| **视口上方变换轴按钮** | 切换当前 Gizmo 模式（平移 / 旋转 / 缩放）|
| **将本地 3D 模型文件拖入视口** | 快速导入 `.glb` / `.gltf` 资产 |

---

## 📦 技术栈

| 模块分层 | 采用技术 |
|:------|:-------------|
| **UI 与工程化** | React 19 · TypeScript · Vite 6 |
| **3D 引擎与渲染** | Three.js 0.176 · @react-three/fiber 9 · @react-three/drei 10 |
| **状态管理** | Zustand 5 |
| **样式体系** | TailwindCSS 3.4 |
| **图标** | Lucide React |
| **字体** | Space Grotesk · IBM Plex Mono (Google Fonts) |
| **测试框架** | Vitest |

---

## 🏗️ Project Structure

```text
MeshCraft/
├── public/
│   └── draco/                    # Draco 压缩 glTF 本地解码器
├── src/
│   ├── app/
│   │   └── AppShell.tsx          # 主界面布局组件——组装工具栏、面板、视口与状态栏
│   ├── features/
│   │   ├── editor/
│   │   │   ├── components/       # 顶部工具栏、左侧大纲、右侧检查器、底部状态栏
│   │   │   ├── lib/              # 导入、导出、项目快照反序列化、材质变换等逻辑
│   │   │   ├── store/            # Zustand 全局状态管理——包含编辑器所有 State 与 Action
│   │   │   └── types.ts          # 领域模型定义及默认场景配置
│   │   └── viewport/
│   │       ├── components/       # R3F 画布、视口模型渲染器、全息外壳、散布粒子场
│   │       ├── lib/              # 模型加载分析、GLSL 着色器、场景导出、实例化配置
│   │       └── store/            # 视口状态
│   ├── styles/                   # 全局样式及 Tailwind 引入
│   ├── App.tsx                   # 根渲染组件
│   └── main.tsx                  # 渲染入口文件
├── docs/                         # 中英文详细用户操作手册
├── index.html                    # HTML 壳模板
├── vite.config.ts                # Vite 配置文件（内含 Rollup 打包分块配置）
├── tailwind.config.ts            # Tailwind 主题配置
├── tsconfig.json                 # TypeScript 编译配置
└── package.json
```

---

## 🧠 架构设计

### 状态管理 (State Management)

MeshCraft 核心的状态均放置在全局的 **Zustand store** (`editor-store.ts`) 中，其结构划分为：选择、变换、材质、纹理覆盖、显示模式、性能参数、导入状态及项目快照。高频 3D 渲染数据（如变换更新、FPS 采样等）直接在 R3F 帧循环中处理，避免触发无意义的 React 组件重渲染。

### 渲染管线 (Rendering Pipeline)

视口基于 React Three Fiber `<Canvas>` 构建，具备以下要素：
- **42° 视场角 (FOV)** 透视摄像机，结合 ACES Filmic 色调映射与 sRGB 输出
- **PCF 柔和阴影贴图** 及地面接触面阴影
- **基于图像的光照 (IBL)** —— 使用 `city` 预设的高动态 HDR 环境光
- **后处理 (Post-processing)** 架构，包含 Bloom 泛光与 Vignette 暗角特效
- **DPR 上限自适应**（最大不超过 2.0），并设定 `powerPreference: "high-performance"` 以优先调用独立 GPU

### 资源生命周期管理 (Resource Lifecycle)

导入的模型经过 **文件转换 -> glTF Draco 解码 -> 场景副本克隆 -> 深度树分析 -> 材质元信息提取 -> 纹理槽检测 -> 变换注册** 等流程。为彻底根除浏览器垃圾回收机制在 3D 渲染下的滞后问题，在用户卸载模型或重置项目时，编辑器会**显式递归销毁**所有的几何体、材质以及对应的贴图纹理资源。

### 构建与打包策略 (Build Strategy)

采用 Vite 配合 Rollup 对打包体积进行针对性分块（Chunk Splitting）：
- `three-stack` —— 容纳 Three.js、React Three Fiber、drei 核心 3D 包
- `icons` —— 独立打包 Lucide React 图标，避免污染主包

---

## 📋 路线图

- [x] 基于 PBR 材质与 LOD 技术的程序化初始场景
- [x] 支持 Draco 解码的 glTF / GLB 本地快速导入
- [x] 深度场景树层级分析与大纲树状图
- [x] 实时 Gizmo 变换轴操作（移动 / 旋转 / 缩放）
- [x] 程序化及外部材质的实时 PBR 参数编辑
- [x] 纹理通道元信息读取与本地图片动态覆盖
- [x] 自定义全息扫描线 GLSL 着色器效果
- [x] 实例化对象散布粒子特效（单 Draw Call）
- [x] Bloom 泛光与暗角后处理
- [x] 项目完整状态快照保存与载入（本地 JSON）
- [x] 一键导出当前场景为 GLB 格式
- [ ] 优化导入模型子节点的选择范围与高亮描边效果
- [ ] 深度纹理功能（如 UV 坐标预览、纹理在线绘制）
- [ ] 多选模型及合并变换支持
- [ ] 撤销与重做系统（Undo / Redo）
- [ ] 插件 / 拓展程序架构
- [ ] 本地资产库（预置材质球与基础 3D 几何体）
- [ ] 网页端多人协同编辑支持
- [ ] 深度缩减 `three-stack` 生产包体积
- [ ] 导出时包含完整的编辑器会话自定义元数据

---

## 🤝 参与贡献

我们非常欢迎社区开发者的加入！以下是推荐的贡献流程：

1. **Fork** 本仓库
2. **创建** 你的特性分支：`git checkout -b feature/my-feature`
3. **提交** 你的更改：`git commit -m 'feat: add my feature'`
4. **推向** 你的分支：`git push origin feature/my-feature`
5. **提交** Pull Request

### 开发环境配置

```bash
git clone https://github.com/<your-username>/MeshCraft.git
cd MeshCraft
npm install
npm run dev      # 启动本地开发环境
npm test         # 提交代码前确保单元测试全部通过
```

在发起 PR 之前，请务必保证本地打包命令 `npm run build` 无任何报错，且测试用例完全通过。

---

## 📄 开源协议

本项目基于 **MIT License** 开源协议，详情参见 [LICENSE](./LICENSE) 文件。

---

## 🙏 致谢

MeshCraft 站在了许多伟大的开源项目的肩膀上：

- [Three.js](https://threejs.org/) — 强大的 Web 3D 基础底层
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — 将 React 声明式写法带入 Three.js
- [drei](https://github.com/pmndrs/drei) — 丰富实用的 R3F 开源组件库
- [Zustand](https://github.com/pmndrs/zustand) — 极简高性能的状态管理器
- [Vite](https://vitejs.dev/) — 极速的工程化构建工具
- [Lucide](https://lucide.dev/) — 精美优雅的图标库
- [Google Fonts](https://fonts.google.com/) — 提供了 Space Grotesk 和 IBM Plex Mono 字体

---

## 📖 项目文档

| 文档名称 | 编写语言 | 主要内容 |
|:---------|:---------|:------------|
| [User Manual (EN)](./docs/USER_MANUAL_EN.md) | 英文 | 详细的操作流程、功能设定以及技术规范说明 |
| [用户手册 (ZH)](./docs/USER_MANUAL_ZH.md) | 简体中文 | 完整的中文使用指南，包含详细的操作步骤与问题解答 |

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/HeyDYF">HeyDYF</a>
</p>
