import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, DynamicDrawUsage, InstancedMesh, Object3D } from "three";
import { useEditorStore } from "../../editor/store/editor-store";
import {
  buildInstanceTransforms,
  SCATTER_FIELD_INSTANCE_COUNT,
} from "../lib/instanced-field";

const COLOR_START = new Color("#4fd1ff");
const COLOR_END = new Color("#d7f9ff");

export function InstancedScatterField() {
  const meshRef = useRef<InstancedMesh>(null);
  const display = useEditorStore((state) => state.display);
  const transforms = useMemo(
    () =>
      buildInstanceTransforms({
        count: SCATTER_FIELD_INSTANCE_COUNT,
        innerRadius: 3.8,
        outerRadius: 8.6,
        seed: 23,
      }),
    [],
  );

  useLayoutEffect(() => {
    if (!meshRef.current) {
      return;
    }

    const mesh = meshRef.current;
    const temp = new Object3D();
    const color = new Color();

    mesh.instanceMatrix.setUsage(DynamicDrawUsage);

    for (let index = 0; index < transforms.length; index += 1) {
      const transform = transforms[index];
      temp.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z,
      );
      temp.rotation.set(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z,
      );
      temp.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      temp.updateMatrix();
      mesh.setMatrixAt(index, temp.matrix);
      color.copy(COLOR_START).lerp(COLOR_END, index / transforms.length);
      mesh.setColorAt(index, color);
    }

    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [transforms]);

  if (!display.showScatterField) {
    return null;
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, transforms.length]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#8ce6ff"
        emissive="#48b9de"
        emissiveIntensity={display.postFx ? 0.45 : 0.18}
        metalness={0.55}
        roughness={0.2}
        transparent
        opacity={display.shading === "wireframe" ? 0.35 : 0.9}
        wireframe={display.shading === "wireframe"}
        vertexColors
      />
    </instancedMesh>
  );
}
