export type ProceduralLodLevel = "high" | "medium" | "low";

export const LOD_LEVEL_DISTANCES: Record<ProceduralLodLevel, number> = {
  high: 0,
  medium: 7,
  low: 14,
};

export function getLodLevelForDistance(distance: number): ProceduralLodLevel {
  if (distance >= LOD_LEVEL_DISTANCES.low) {
    return "low";
  }

  if (distance >= LOD_LEVEL_DISTANCES.medium) {
    return "medium";
  }

  return "high";
}

export function getPreviewDistanceForLodLevel(level: ProceduralLodLevel) {
  if (level === "high") {
    return 5;
  }

  if (level === "medium") {
    return 10;
  }

  return 18;
}
