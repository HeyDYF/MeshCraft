import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElement, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AdditiveBlending, DoubleSide } from "three";
import {
  HOLOGRAM_UNIFORM_DEFAULTS,
  hologramFragmentShader,
  hologramVertexShader,
} from "../lib/hologram-shader";

const HologramShaderMaterial = shaderMaterial(
  HOLOGRAM_UNIFORM_DEFAULTS,
  hologramVertexShader,
  hologramFragmentShader,
);

extend({ HologramShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    hologramShaderMaterial: ThreeElement<typeof HologramShaderMaterial>;
  }
}

type HologramMaterialInstance = InstanceType<typeof HologramShaderMaterial>;

export function HologramShell({
  position,
  rotation,
  scale,
  radialSegments,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  radialSegments: number;
}) {
  const materialRef = useRef<HologramMaterialInstance>(null);

  useFrame((_, delta) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uTime += delta;
  });

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <cylinderGeometry args={[1.37, 1.57, 2.24, radialSegments, 1, true]} />
      <hologramShaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
