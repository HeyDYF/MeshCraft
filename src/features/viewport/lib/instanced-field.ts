import type { TransformState } from "../../editor/types";

type BuildInstanceTransformsOptions = {
  count: number;
  innerRadius: number;
  outerRadius: number;
  seed?: number;
};

export const SCATTER_FIELD_INSTANCE_COUNT = 1000;

function createRandom(seed: number) {
  let state = seed >>> 0;

  return function nextRandom() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildInstanceTransforms({
  count,
  innerRadius,
  outerRadius,
  seed = 17,
}: BuildInstanceTransformsOptions): TransformState[] {
  const random = createRandom(seed);
  const transforms: TransformState[] = [];

  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = innerRadius + random() * (outerRadius - innerRadius);
    const uniformScale = 0.08 + random() * 0.22;

    transforms.push({
      position: {
        x: Math.cos(angle) * radius,
        y: -0.85 + random() * 2.7,
        z: Math.sin(angle) * radius,
      },
      rotation: {
        x: random() * Math.PI,
        y: random() * Math.PI * 2,
        z: random() * Math.PI,
      },
      scale: {
        x: uniformScale,
        y: uniformScale * (0.9 + random() * 0.8),
        z: uniformScale,
      },
    });
  }

  return transforms;
}
