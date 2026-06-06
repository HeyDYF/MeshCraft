import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  TransformControls,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../editor/store/editor-store";
import {
  buildImportedSceneTree,
  collectSceneMetrics,
  disposeSceneResources,
  extractImportedMaterialBindings,
} from "../lib/scene-asset-utils";
import {
  createConfiguredGltfLoader,
  loadGltfWithLoader,
} from "../lib/gltf-loader";
import { buildImportedTransformRegistry } from "../lib/imported-transform-registry";
import { SCATTER_FIELD_INSTANCE_COUNT } from "../lib/instanced-field";
import { InstancedScatterField } from "./InstancedScatterField";
import { SceneLights } from "./SceneLights";
import { ViewportModel } from "./ViewportModel";

function useDevicePixelRatio() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    return Math.min(window.devicePixelRatio || 1, 2);
  }, []);
}

export function SceneCanvas() {
  const dpr = useDevicePixelRatio();
  const mode = useEditorStore((state) => state.mode);
  const display = useEditorStore((state) => state.display);
  const importedAssetUrl = useEditorStore((state) => state.importedAssetUrl);
  const selectedId = useEditorStore((state) => state.selectedId);
  const transformTool = useEditorStore((state) => state.transformTool);
  const importedMaterialLibrary = useEditorStore((state) => state.importedMaterialLibrary);
  const setImportStatus = useEditorStore((state) => state.setImportStatus);
  const setSceneTree = useEditorStore((state) => state.setSceneTree);
  const setImportedMaterialBindings = useEditorStore((state) => state.setImportedMaterialBindings);
  const setImportedObjectTransforms = useEditorStore((state) => state.setImportedObjectTransforms);
  const setSelected = useEditorStore((state) => state.setSelected);
  const setTransform = useEditorStore((state) => state.setTransform);

  function PerformanceBridge() {
    const updatePerformance = useEditorStore((state) => state.updatePerformance);
    const lastSample = useRef(0);
    const frames = useRef(0);
    const { gl, scene } = useThree();

    useFrame((_, delta) => {
      frames.current += 1;
      lastSample.current += delta;

      if (lastSample.current >= 0.4) {
        const fps = Math.round(frames.current / lastSample.current);
        const triangles = gl.info.render.triangles;
        const drawCalls = gl.info.render.calls;
        const gpuMemoryMb = 240 + Math.round(scene.children.length * 7.5);

        updatePerformance({
          fps,
          triangles,
          drawCalls,
          gpuMemoryMb,
          instances: display.showScatterField ? SCATTER_FIELD_INSTANCE_COUNT : 0,
        });

        frames.current = 0;
        lastSample.current = 0;
      }
    });

    return null;
  }

  function ResetGlInfo() {
    const { gl } = useThree();

    useEffect(() => {
      gl.info.autoReset = true;
    }, [gl]);

    return null;
  }

  function ImportedModel({ url }: { url: string }) {
    const [scene, setScene] = useState<THREE.Group | null>(null);
    const updatePerformance = useEditorStore((state) => state.updatePerformance);
    const importedAssetName = useEditorStore((state) => state.importedAssetName);
    const importedObjectTransforms = useEditorStore((state) => state.importedObjectTransforms);
    const rootRef = useRef<THREE.Group>(null);
    const objectMapRef = useRef(new Map<string, THREE.Object3D>());

    useEffect(() => {
      let disposed = false;
      const { gltfLoader, dracoLoader } = createConfiguredGltfLoader();
      const startedAt = performance.now();
      let nextScene: THREE.Group | null = null;

      loadGltfWithLoader(gltfLoader, url)
        .then((gltf) => {
          if (disposed) {
            return;
          }

          nextScene = gltf.scene.clone(true);
          nextScene.traverse((object) => {
            object.castShadow = true;
            object.receiveShadow = true;
            objectMapRef.current.set(object.uuid, object);
          });
          const metrics = collectSceneMetrics(nextScene);
          const importedTransforms = buildImportedTransformRegistry(
            {
              position: { x: 0, y: -1.15, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
            },
            objectMapRef.current,
          );

          updatePerformance({
            triangles: metrics.triangles,
            decodeTimeMs: performance.now() - startedAt,
          });
          setImportStatus("ready");
          setImportedMaterialBindings(extractImportedMaterialBindings(nextScene));
          setImportedObjectTransforms(importedTransforms);
          setSceneTree(
            buildImportedSceneTree(
              nextScene,
              importedAssetName?.replace(/\.[^.]+$/, "") || "ImportedAsset",
            ),
          );
          setScene(nextScene);
        })
        .catch(() => {
          if (!disposed) {
            setImportStatus("error", "Import failed");
            setScene(null);
          }
        });

      return () => {
        disposed = true;
        dracoLoader.dispose();
        if (nextScene) {
          disposeSceneResources(nextScene);
        }
      };
    }, [
      importedAssetName,
      setImportStatus,
      setImportedMaterialBindings,
      setImportedObjectTransforms,
      setSceneTree,
      updatePerformance,
      url,
    ]);

    useEffect(() => {
      if (!scene) {
        return;
      }

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
          return;
        }

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material, index) => {
          const materialId = `${object.uuid}-material-${index}`;
          const nextState = importedMaterialLibrary[materialId];
          if (!nextState) {
            return;
          }

          if ("color" in material && material.color instanceof THREE.Color) {
            material.color.set(nextState.baseColor);
          }
          if ("emissive" in material && material.emissive instanceof THREE.Color) {
            material.emissive.set(nextState.baseColor);
          }
          if ("metalness" in material) {
            material.metalness = nextState.metalness;
          }
          if ("roughness" in material) {
            material.roughness = nextState.roughness;
          }
          if ("opacity" in material) {
            material.opacity = nextState.opacity;
            material.transparent = nextState.opacity < 1;
          }
          material.needsUpdate = true;
        });
      });
    }, [importedMaterialLibrary, scene]);

    if (!scene) {
      return null;
    }

    const activeObject =
      selectedId === "imported-root"
        ? rootRef.current
        : (objectMapRef.current.get(selectedId) ?? rootRef.current);

    return (
      <>
        <group
          ref={rootRef}
          position={[
            importedObjectTransforms["imported-root"]?.position.x ?? 0,
            importedObjectTransforms["imported-root"]?.position.y ?? -1.15,
            importedObjectTransforms["imported-root"]?.position.z ?? 0,
          ]}
          rotation={[
            importedObjectTransforms["imported-root"]?.rotation.x ?? 0,
            importedObjectTransforms["imported-root"]?.rotation.y ?? 0,
            importedObjectTransforms["imported-root"]?.rotation.z ?? 0,
          ]}
          scale={[
            (importedObjectTransforms["imported-root"]?.scale.x ?? 1) *
              (display.lodPreview ? 0.92 : 1),
            (importedObjectTransforms["imported-root"]?.scale.y ?? 1) *
              (display.lodPreview ? 0.92 : 1),
            (importedObjectTransforms["imported-root"]?.scale.z ?? 1) *
              (display.lodPreview ? 0.92 : 1),
          ]}
        >
          <primitive
            object={scene}
            onClick={(event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              const object = event.object;

              if (object && object.uuid !== rootRef.current?.uuid) {
                setSelected(object.uuid, object.name || "ImportedNode");
                setTransform({
                  position: {
                    x: object.position.x,
                  y: object.position.y,
                  z: object.position.z,
                },
                  rotation: {
                    x: object.rotation.x,
                    y: object.rotation.y,
                    z: object.rotation.z,
                  },
                  scale: {
                    x: object.scale.x,
                    y: object.scale.y,
                    z: object.scale.z,
                  },
                });
              }
            }}
          />
        </group>
        {mode === "object" && display.showGizmo && activeObject && (
          <TransformControls
            object={activeObject}
            mode={transformTool}
            onObjectChange={() => {
              if (!activeObject) {
                return;
              }

              setTransform({
                position: {
                  x: activeObject.position.x,
                  y:
                    activeObject === rootRef.current
                      ? activeObject.position.y
                      : activeObject.position.y,
                  z: activeObject.position.z,
                },
                rotation: {
                  x: activeObject.rotation.x,
                  y: activeObject.rotation.y,
                  z: activeObject.rotation.z,
                },
                scale: {
                  x: activeObject.scale.x,
                  y: activeObject.scale.y,
                  z: activeObject.scale.z,
                },
              });
            }}
          />
        )}
      </>
    );
  }

  return (
    <Canvas
      className="h-full w-full"
      dpr={dpr}
      shadows
      camera={{ fov: 42, near: 0.1, far: 250, position: [6.5, 4.8, 7.5] }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = display.showShadows;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.setClearColor("#040816");
        scene.fog = new THREE.Fog("#040816", 18, 36);
      }}
    >
      <color attach="background" args={["#040816"]} />
      <Suspense fallback={null}>
        <ResetGlInfo />
        <PerformanceBridge />
        <SceneLights />
        <Environment preset="city" />
        <group position={[0, 0.4, 0]}>
          {importedAssetUrl ? <ImportedModel url={importedAssetUrl} /> : <ViewportModel />}
          <InstancedScatterField />
        </group>
        <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -1.2, 0]}>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial transparent opacity={display.showShadows ? 0.18 : 0} />
        </mesh>
        <ContactShadows
          position={[0, -1.19, 0]}
          opacity={display.showShadows ? 0.35 : 0}
          scale={12}
          blur={2.4}
          far={10}
          resolution={512}
          color="#0b1220"
        />
        {display.showGrid && (
          <Grid
            position={[0, -1.18, 0]}
            args={[24, 24]}
            cellSize={0.65}
            cellThickness={0.55}
            cellColor="#1b2430"
            sectionSize={3.25}
            sectionThickness={1}
            sectionColor="#294257"
            fadeDistance={30}
            fadeStrength={1.3}
            infiniteGrid
          />
        )}
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={18}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0.6, 0]}
      />
    </Canvas>
  );
}
