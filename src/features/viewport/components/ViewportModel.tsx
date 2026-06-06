import { Edges, TransformControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Group, Mesh } from "three";
import { DoubleSide, Vector3 } from "three";
import { getSelectionCapabilities } from "../../editor/lib/editor-bindings";
import { useEditorStore } from "../../editor/store/editor-store";
import type { TransformState } from "../../editor/types";
import { HologramShell } from "./HologramShell";
import {
  getLodLevelForDistance,
  type ProceduralLodLevel,
} from "../lib/procedural-lod";

type DetailConfig = {
  housingSegments: number;
  ventRadialSegments: number;
  ventTubularSegments: number;
  rotorBladeCount: number;
  rotorBladeLength: number;
  rotorCylinderSegments: number;
  boltCount: number;
  boltSegments: number;
  trimSegments: number;
};

const DETAIL_CONFIG: Record<ProceduralLodLevel, DetailConfig> = {
  high: {
    housingSegments: 48,
    ventRadialSegments: 16,
    ventTubularSegments: 48,
    rotorBladeCount: 10,
    rotorBladeLength: 1.4,
    rotorCylinderSegments: 24,
    boltCount: 8,
    boltSegments: 16,
    trimSegments: 64,
  },
  medium: {
    housingSegments: 24,
    ventRadialSegments: 12,
    ventTubularSegments: 24,
    rotorBladeCount: 6,
    rotorBladeLength: 1.15,
    rotorCylinderSegments: 16,
    boltCount: 6,
    boltSegments: 10,
    trimSegments: 32,
  },
  low: {
    housingSegments: 12,
    ventRadialSegments: 8,
    ventTubularSegments: 12,
    rotorBladeCount: 3,
    rotorBladeLength: 0.9,
    rotorCylinderSegments: 8,
    boltCount: 4,
    boltSegments: 6,
    trimSegments: 16,
  },
};

function transformToTriplet(transform: TransformState, group: keyof TransformState) {
  const value = transform[group];
  return [value.x, value.y, value.z] as [number, number, number];
}

export function ViewportModel({ exportRootRef }: { exportRootRef?: RefObject<Group | null> }) {
  const localGroupRef = useRef<Group>(null);
  const group = exportRootRef ?? localGroupRef;
  const rotor = useRef<Group>(null);
  const housingRef = useRef<Mesh>(null);
  const ventsRef = useRef<Group>(null);
  const boltsRef = useRef<Group>(null);
  const lodProbe = useMemo(() => new Vector3(), []);
  const [lodLevel, setLodLevel] = useState<ProceduralLodLevel>("high");
  const objectTransforms = useEditorStore((state) => state.objectTransforms);
  const materialLibrary = useEditorStore((state) => state.materialLibrary);
  const mode = useEditorStore((state) => state.mode);
  const display = useEditorStore((state) => state.display);
  const selectedId = useEditorStore((state) => state.selectedId);
  const transformTool = useEditorStore((state) => state.transformTool);
  const setSelected = useEditorStore((state) => state.setSelected);
  const setTransform = useEditorStore((state) => state.setTransform);
  const wireframe = display.shading === "wireframe";
  const useNormalsTint = display.shading === "normals";
  const shellMaterial = materialLibrary["mat-steel"];
  const rotorMaterial = materialLibrary["mat-carbon"];
  const glowMaterial = materialLibrary["mat-glow"];
  const rotorColor = useMemo(
    () => (useNormalsTint ? "#7fb5ff" : rotorMaterial.baseColor),
    [rotorMaterial.baseColor, useNormalsTint],
  );
  const selectedTransformable = getSelectionCapabilities(selectedId).canTransform;
  const selectedObject =
    selectedId === "mesh-housing"
      ? housingRef.current
      : selectedId === "mesh-core"
        ? rotor.current
        : selectedId === "mesh-vents"
          ? ventsRef.current
          : selectedId === "mesh-bolts"
            ? boltsRef.current
            : null;
  const detail = DETAIL_CONFIG[lodLevel];

  useEffect(() => {
    if (display.lodPreview) {
      setLodLevel("low");
    }
  }, [display.lodPreview]);

  useFrame(({ camera }, delta) => {
    if (display.autoRotate && group.current) {
      group.current.rotation.y += delta * 0.2;
    }

    if (rotor.current) {
      rotor.current.rotation.z += delta * 0.6;
    }

    if (!group.current || display.lodPreview) {
      return;
    }

    group.current.getWorldPosition(lodProbe);
    const nextLod = getLodLevelForDistance(camera.position.distanceTo(lodProbe));

    setLodLevel((current) => (current === nextLod ? current : nextLod));
  });

  return (
    <>
      <group ref={group}>
        <mesh
          ref={housingRef}
          castShadow
          receiveShadow
          position={[
            objectTransforms["mesh-housing"].position.x,
            objectTransforms["mesh-housing"].position.y + 0.45,
            objectTransforms["mesh-housing"].position.z,
          ]}
          rotation={transformToTriplet(objectTransforms["mesh-housing"], "rotation")}
          scale={transformToTriplet(objectTransforms["mesh-housing"], "scale")}
          onClick={(event) => {
            event.stopPropagation();
            setSelected("mesh-housing", "Housing_Shell");
          }}
        >
          <cylinderGeometry
            args={[1.35, 1.55, 2.2, detail.housingSegments, 1, true]}
          />
          <meshStandardMaterial
            color={shellMaterial.baseColor}
            metalness={display.shading === "matcap" ? 0.15 : shellMaterial.metalness}
            roughness={shellMaterial.roughness}
            emissive={shellMaterial.baseColor}
            emissiveIntensity={shellMaterial.emission}
            transparent={shellMaterial.opacity < 1}
            opacity={shellMaterial.opacity}
            wireframe={wireframe}
            side={DoubleSide}
          />
          {!wireframe && lodLevel !== "low" && <Edges threshold={20} color="#1c2530" />}
        </mesh>

        {display.showHologramScan && (
          <HologramShell
            position={[
              objectTransforms["mesh-housing"].position.x,
              objectTransforms["mesh-housing"].position.y + 0.45,
              objectTransforms["mesh-housing"].position.z,
            ]}
            rotation={transformToTriplet(objectTransforms["mesh-housing"], "rotation")}
            scale={[
              objectTransforms["mesh-housing"].scale.x * 1.015,
              objectTransforms["mesh-housing"].scale.y * 1.015,
              objectTransforms["mesh-housing"].scale.z * 1.015,
            ]}
            radialSegments={detail.housingSegments}
          />
        )}

        <group
          ref={ventsRef}
          position={transformToTriplet(objectTransforms["mesh-vents"], "position")}
          rotation={transformToTriplet(objectTransforms["mesh-vents"], "rotation")}
          scale={transformToTriplet(objectTransforms["mesh-vents"], "scale")}
          onClick={(event) => {
            event.stopPropagation();
            setSelected("mesh-vents", "Intake_Vents");
          }}
        >
          {[1.55, -0.65].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow>
              <torusGeometry
                args={[1.4, 0.12, detail.ventRadialSegments, detail.ventTubularSegments]}
              />
              <meshStandardMaterial
                color={shellMaterial.baseColor}
                metalness={shellMaterial.metalness}
                roughness={shellMaterial.roughness}
                wireframe={wireframe}
              />
            </mesh>
          ))}
        </group>

        <group
          ref={rotor}
          position={transformToTriplet(objectTransforms["mesh-core"], "position")}
          rotation={transformToTriplet(objectTransforms["mesh-core"], "rotation")}
          scale={transformToTriplet(objectTransforms["mesh-core"], "scale")}
          onClick={(event) => {
            event.stopPropagation();
            setSelected("mesh-core", "Core_Rotor");
          }}
        >
          <mesh>
            <cylinderGeometry
              args={[0.34, 0.34, 1.6, detail.rotorCylinderSegments]}
            />
            <meshStandardMaterial
              color="#3a424e"
              metalness={0.95}
              roughness={0.25}
              wireframe={wireframe}
            />
          </mesh>
          {Array.from({ length: detail.rotorBladeCount }).map((_, index) => {
            const angle = (index / detail.rotorBladeCount) * Math.PI * 2;

            return (
              <mesh
                key={`${lodLevel}-${index}`}
                position={[Math.cos(angle) * 0.7, 0, Math.sin(angle) * 0.7]}
                rotation={[0, -angle, 0.35]}
                castShadow
              >
                <boxGeometry args={[0.55, detail.rotorBladeLength, 0.06]} />
                <meshStandardMaterial
                  color={rotorColor}
                  metalness={rotorMaterial.metalness}
                  roughness={rotorMaterial.roughness}
                  emissive={rotorMaterial.baseColor}
                  emissiveIntensity={rotorMaterial.emission}
                  wireframe={wireframe}
                />
              </mesh>
            );
          })}
        </group>

        <group
          ref={boltsRef}
          position={transformToTriplet(objectTransforms["mesh-bolts"], "position")}
          rotation={transformToTriplet(objectTransforms["mesh-bolts"], "rotation")}
          scale={transformToTriplet(objectTransforms["mesh-bolts"], "scale")}
          onClick={(event) => {
            event.stopPropagation();
            setSelected("mesh-bolts", "Fastener_Array");
          }}
        >
          {Array.from({ length: detail.boltCount }).map((_, index) => {
            const angle = (index / detail.boltCount) * Math.PI * 2;
            return (
              <mesh
                key={`${lodLevel}-${index}`}
                castShadow
                position={[Math.cos(angle) * 1.7, -0.15, Math.sin(angle) * 1.7]}
              >
                <sphereGeometry args={[0.08, detail.boltSegments, detail.boltSegments]} />
                <meshStandardMaterial
                  color={shellMaterial.baseColor}
                  metalness={shellMaterial.metalness}
                  roughness={shellMaterial.roughness}
                  wireframe={wireframe}
                />
              </mesh>
            );
          })}
        </group>

        <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.46, 0.03, 12, detail.trimSegments]} />
          <meshStandardMaterial
            color={display.lodPreview ? "#fbbf24" : glowMaterial.baseColor}
            emissive={display.lodPreview ? "#fbbf24" : glowMaterial.baseColor}
            emissiveIntensity={
              display.postFx ? glowMaterial.emission : glowMaterial.emission * 0.5
            }
            toneMapped={false}
            metalness={glowMaterial.metalness}
            roughness={glowMaterial.roughness}
            transparent={glowMaterial.opacity < 1}
            opacity={glowMaterial.opacity}
          />
        </mesh>

        {display.showGizmo && (
          <group>
            {[
              { dir: [1, 0, 0], color: "#ff5d5d" },
              { dir: [0, 1, 0], color: "#5dff8f" },
              { dir: [0, 0, 1], color: "#5d9bff" },
            ].map(({ dir, color }, index) => {
              const length = 2.35;
              const position: [number, number, number] = [
                dir[0] * length * 0.5,
                dir[1] * length * 0.5,
                dir[2] * length * 0.5,
              ];
              const rotation: [number, number, number] =
                index === 0
                  ? [0, 0, -Math.PI / 2]
                  : index === 2
                    ? [Math.PI / 2, 0, 0]
                    : [0, 0, 0];
              const tip: [number, number, number] = [
                dir[0] * length,
                dir[1] * length,
                dir[2] * length,
              ];

              return (
                <group key={color}>
                  <mesh position={position} rotation={rotation}>
                    <cylinderGeometry args={[0.012, 0.012, length, 8]} />
                    <meshBasicMaterial color={color} toneMapped={false} />
                  </mesh>
                  <mesh position={tip} rotation={rotation}>
                    <coneGeometry args={[0.06, 0.18, 10]} />
                    <meshBasicMaterial color={color} toneMapped={false} />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}

        {selectedTransformable && selectedObject && (
          <mesh
            position={selectedObject.position}
            rotation={
              "rotation" in selectedObject ? selectedObject.rotation : [0, 0, 0]
            }
          >
            <torusGeometry args={[1.9, 0.012, 8, 120]} />
            <meshBasicMaterial
              color={display.lodPreview ? "#fbbf24" : "#67e8f9"}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>

      {mode === "object" && display.showGizmo && selectedTransformable && selectedObject && (
        <TransformControls
          object={selectedObject}
          mode={transformTool}
          onObjectChange={() => {
            if (!selectedObject) {
              return;
            }

            setTransform({
              position: {
                x: selectedObject.position.x,
                y: selectedObject.position.y,
                z: selectedObject.position.z,
              },
              rotation: {
                x: selectedObject.rotation.x,
                y: selectedObject.rotation.y,
                z: selectedObject.rotation.z,
              },
              scale: {
                x: selectedObject.scale.x,
                y: selectedObject.scale.y,
                z: selectedObject.scale.z,
              },
            });
          }}
        />
      )}
    </>
  );
}
