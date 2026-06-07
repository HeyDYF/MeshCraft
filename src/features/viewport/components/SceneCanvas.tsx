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
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { resolvePreviewTargetIds } from "../../editor/lib/selection-preview";
import { useEditorStore } from "../../editor/store/editor-store";
import {
  buildImportedSceneTree,
  collectSceneMetrics,
  disposeSceneResources,
  extractImportedMaterialBindings,
} from "../lib/scene-asset-utils";
import {
  buildImportedObjectRegistry,
  findImportedObjectId,
  getImportedMaterialId,
} from "../lib/imported-node-ids";
import {
  createConfiguredGltfLoader,
  loadGltfWithLoader,
} from "../lib/gltf-loader";
import { buildImportedTransformRegistry } from "../lib/imported-transform-registry";
import { resolveImportedMaterialSelection } from "../lib/imported-material-selection";
import { SCATTER_FIELD_INSTANCE_COUNT } from "../lib/instanced-field";
import { computeFrameSelectionPose } from "../lib/frame-selection";
import { exportSceneToGlb } from "../lib/scene-export";
import { captureCanvasToPng } from "../lib/viewport-capture";
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
  const importedAssetName = useEditorStore((state) => state.importedAssetName);
  const selectedId = useEditorStore((state) => state.selectedId);
  const transformTool = useEditorStore((state) => state.transformTool);
  const exportRequestNonce = useEditorStore((state) => state.exportRequestNonce);
  const viewportCaptureRequestNonce = useEditorStore(
    (state) => state.viewportCaptureRequestNonce,
  );
  const frameSelectionRequestNonce = useEditorStore(
    (state) => state.frameSelectionRequestNonce,
  );
  const importedMaterialLibrary = useEditorStore((state) => state.importedMaterialLibrary);
  const importedNodeMaterialBindings = useEditorStore(
    (state) => state.importedNodeMaterialBindings,
  );
  const importedMaterialTextureOverrides = useEditorStore(
    (state) => state.importedMaterialTextureOverrides,
  );
  const setImportStatus = useEditorStore((state) => state.setImportStatus);
  const setSceneTree = useEditorStore((state) => state.setSceneTree);
  const setImportedMaterialBindings = useEditorStore((state) => state.setImportedMaterialBindings);
  const setImportedObjectTransforms = useEditorStore((state) => state.setImportedObjectTransforms);
  const setSelected = useEditorStore((state) => state.setSelected);
  const setActiveMaterialId = useEditorStore((state) => state.setActiveMaterialId);
  const setTransform = useEditorStore((state) => state.setTransform);
  const proceduralExportRootRef = useRef<THREE.Group>(null);
  const importedExportRootRef = useRef<THREE.Group>(null);
  const importedObjectMapRef = useRef(new Map<string, THREE.Object3D>());
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function FrameSelectionBridge() {
    const { camera } = useThree();

    useEffect(() => {
      if (!frameSelectionRequestNonce || !orbitControlsRef.current) {
        return;
      }

      const previewTargetIds = resolvePreviewTargetIds(selectedId, {
        importedNodeMaterialBindings,
      });

      const previewObjectCandidates: Array<THREE.Object3D | null> = importedAssetUrl
        ? previewTargetIds
            .map((targetId) =>
              targetId === "imported-root"
                ? importedExportRootRef.current
                : importedObjectMapRef.current.get(targetId) ?? null,
            )
        : previewTargetIds
            .map((targetId) => {
              if (!proceduralExportRootRef.current) {
                return null;
              }

              let match: THREE.Object3D | null = null;
              proceduralExportRootRef.current.traverse((object) => {
                if (object.userData.selectionId === targetId) {
                  match = object;
                }
              });

              return match;
            });
      const previewObjects = previewObjectCandidates.filter(
        (object): object is THREE.Object3D => object instanceof THREE.Object3D,
      );

      if (!previewObjects.length) {
        return;
      }

      const bounds = previewObjects.reduce((box, object) => box.union(new THREE.Box3().setFromObject(object)), new THREE.Box3());

      if (bounds.isEmpty()) {
        return;
      }

      if (!(camera instanceof THREE.PerspectiveCamera)) {
        return;
      }

      const nextPose = computeFrameSelectionPose({
        bounds,
        cameraPosition: camera.position.clone(),
        controlsTarget: orbitControlsRef.current.target.clone(),
        fovDegrees: camera.fov,
      });

      camera.position.copy(nextPose.position);
      orbitControlsRef.current.target.copy(nextPose.target);
      camera.updateProjectionMatrix();
      orbitControlsRef.current.update();
    }, [
      camera,
      frameSelectionRequestNonce,
      importedAssetUrl,
      importedNodeMaterialBindings,
      selectedId,
    ]);

    return null;
  }

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
    const rootRef = importedExportRootRef;
    const originalTextureSlotsRef = useRef(
      new Map<string, Record<string, THREE.Texture | null>>(),
    );
    const overrideTextureCacheRef = useRef(new Map<string, THREE.Texture>());

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
          importedObjectMapRef.current = buildImportedObjectRegistry(nextScene);
          originalTextureSlotsRef.current.clear();
          nextScene.traverse((object) => {
            object.castShadow = true;
            object.receiveShadow = true;
          });
          importedObjectMapRef.current.forEach((object, objectId) => {
            if (!(object instanceof THREE.Mesh)) {
              return;
            }

            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];

            materials.forEach((material, index) => {
              const materialId = getImportedMaterialId(objectId, index);
              const originalSlots: Record<string, THREE.Texture | null> = {};
              Object.entries(material).forEach(([channel, value]) => {
                if (value instanceof THREE.Texture) {
                  originalSlots[channel] = value;
                }
              });
              originalTextureSlotsRef.current.set(materialId, originalSlots);
            });
          });
          const metrics = collectSceneMetrics(nextScene);
          const importedTransforms = buildImportedTransformRegistry(
            {
              position: { x: 0, y: -1.15, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
            },
            importedObjectMapRef.current,
          );
          const extractedBindings = extractImportedMaterialBindings(nextScene);
          const persistedState = useEditorStore.getState();
          const mergedImportedMaterialLibrary = {
            ...extractedBindings.materialLibrary,
          };
          Object.entries(persistedState.importedMaterialLibrary).forEach(
            ([materialId, materialState]) => {
              if (materialId in mergedImportedMaterialLibrary) {
                mergedImportedMaterialLibrary[materialId] = materialState;
              }
            },
          );
          const mergedImportedTransforms = {
            ...importedTransforms,
          };
          Object.entries(persistedState.importedObjectTransforms).forEach(
            ([objectId, transformState]) => {
              if (objectId in mergedImportedTransforms) {
                mergedImportedTransforms[objectId] = transformState;
              }
            },
          );

          updatePerformance({
            triangles: metrics.triangles,
            decodeTimeMs: performance.now() - startedAt,
          });
          setImportStatus("ready");
          setImportedMaterialBindings({
            materialLibrary: mergedImportedMaterialLibrary,
            nodeMaterialBindings: extractedBindings.nodeMaterialBindings,
            materialTextureSlots: extractedBindings.materialTextureSlots,
          });
          setImportedObjectTransforms(mergedImportedTransforms);
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
        overrideTextureCacheRef.current.forEach((texture) => texture.dispose());
        overrideTextureCacheRef.current.clear();
        importedObjectMapRef.current.clear();
        originalTextureSlotsRef.current.clear();
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
        const objectId = findImportedObjectId(importedObjectMapRef.current, object);
        if (!(object instanceof THREE.Mesh) || !objectId) {
          return;
        }

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material, index) => {
          const materialId = getImportedMaterialId(objectId, index);
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
    }, [importedMaterialLibrary, importedMaterialTextureOverrides, scene]);

    useEffect(() => {
      if (!scene) {
        return;
      }

      const activeScene = scene;
      let cancelled = false;
      const textureLoader = new THREE.TextureLoader();

      async function applyTextureOverrides() {
        const activeKeys = new Set<string>();

        for (const [materialId, originalSlots] of originalTextureSlotsRef.current.entries()) {
          const materialMarker = ":material:";
          const materialMarkerIndex = materialId.lastIndexOf(materialMarker);

          if (materialMarkerIndex === -1) {
            continue;
          }

          const objectId = materialId.slice(0, materialMarkerIndex);
          const materialIndex = materialId.slice(materialMarkerIndex + materialMarker.length);
          const object = importedObjectMapRef.current.get(objectId);

          if (!(object instanceof THREE.Mesh)) {
            continue;
          }

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          const material = materials[Number(materialIndex)];
          if (!material) {
            continue;
          }

          const channelOverrides = importedMaterialTextureOverrides[materialId] ?? {};

          for (const [channel, originalTexture] of Object.entries(originalSlots)) {
            const override = channelOverrides[channel];

            if (!override) {
              (material as unknown as Record<string, unknown>)[channel] = originalTexture;
              continue;
            }

            const cacheKey = `${materialId}:${channel}:${override.objectUrl}`;
            activeKeys.add(cacheKey);
            let texture = overrideTextureCacheRef.current.get(cacheKey);

            if (!texture) {
              texture = await textureLoader.loadAsync(override.objectUrl);
              texture.flipY = false;
              if (channel === "map" || channel === "emissiveMap") {
                texture.colorSpace = THREE.SRGBColorSpace;
              }
              overrideTextureCacheRef.current.set(cacheKey, texture);
            }

            if (cancelled) {
              return;
            }

            (material as unknown as Record<string, unknown>)[channel] = texture;
          }

          material.needsUpdate = true;
        }

        overrideTextureCacheRef.current.forEach((texture, key) => {
          if (!activeKeys.has(key)) {
            texture.dispose();
            overrideTextureCacheRef.current.delete(key);
          }
        });

        activeScene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            materials.forEach((material) => {
              material.needsUpdate = true;
            });
          }
        });
      }

      void applyTextureOverrides();

      return () => {
        cancelled = true;
      };
    }, [importedMaterialTextureOverrides, scene]);

    if (!scene) {
      return null;
    }

    const previewTargetIds = resolvePreviewTargetIds(selectedId, {
      importedNodeMaterialBindings,
    });
    const activeObject =
      selectedId === "imported-root"
        ? rootRef.current
        : importedObjectMapRef.current.get(selectedId) ?? null;
    const previewObjects = previewTargetIds
      .map((targetId) =>
        targetId === "imported-root"
          ? rootRef.current
          : (importedObjectMapRef.current.get(targetId) ?? null),
      )
      .filter((object): object is THREE.Object3D => object !== null);
    const previewHighlights = previewObjects
      .map((object) => {
        const box = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        return {
          object,
          size,
          center,
        };
      })
      .filter(({ size }) => size.lengthSq() > 0);

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
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            setSelected(
              "imported-root",
              importedAssetName?.replace(/\.[^.]+$/, "") || "ImportedAsset",
            );
            setTransform(
              importedObjectTransforms["imported-root"] ?? {
                position: { x: 0, y: -1.15, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
              },
            );
          }}
        >
          <primitive
            object={scene}
            onClick={(event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              const object = event.object;
              const objectId = findImportedObjectId(importedObjectMapRef.current, object);

              if (object && objectId) {
                const materialIndex =
                  typeof event.face?.materialIndex === "number"
                    ? event.face.materialIndex
                    : 0;
                setSelected(objectId, object.name || "ImportedNode");
                setActiveMaterialId(
                  resolveImportedMaterialSelection(
                    objectId,
                    materialIndex,
                    importedMaterialLibrary,
                  ),
                );
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
        {previewHighlights.map(({ center, size }, index) =>
          rootRef.current ? (
            <mesh
              key={`highlight-${previewTargetIds[index]}`}
              position={rootRef.current.worldToLocal(center.clone())}
              scale={[
                size.x * 1.03,
                size.y * 1.03,
                size.z * 1.03,
              ]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color={previewTargetIds[index] === "imported-root" ? "#fbbf24" : "#67e8f9"}
                wireframe
                toneMapped={false}
              />
            </mesh>
          ) : null,
        )}
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

  useEffect(() => {
    if (!exportRequestNonce) {
      return;
    }

    const activeRoot = importedAssetUrl
      ? importedExportRootRef.current
      : proceduralExportRootRef.current;

    if (!activeRoot) {
      return;
    }

    void exportSceneToGlb(activeRoot.clone(true), importedAssetName);
  }, [exportRequestNonce, importedAssetName, importedAssetUrl]);

  useEffect(() => {
    if (!viewportCaptureRequestNonce || !canvasRef.current) {
      return;
    }

    void captureCanvasToPng(canvasRef.current, importedAssetName);
  }, [viewportCaptureRequestNonce, importedAssetName]);

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
        canvasRef.current = gl.domElement;
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
        <FrameSelectionBridge />
        <SceneLights />
        <Environment preset="city" />
        <group position={[0, 0.4, 0]}>
          {importedAssetUrl ? (
            <ImportedModel url={importedAssetUrl} />
          ) : (
            <ViewportModel exportRootRef={proceduralExportRootRef} />
          )}
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
        ref={orbitControlsRef}
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
