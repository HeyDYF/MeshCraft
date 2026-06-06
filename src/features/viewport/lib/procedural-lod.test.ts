import { describe, expect, it } from "vitest";
import {
  LOD_LEVEL_DISTANCES,
  getLodLevelForDistance,
  getPreviewDistanceForLodLevel,
} from "./procedural-lod";

describe("LOD_LEVEL_DISTANCES", () => {
  it("defines ascending thresholds for high, medium and low detail", () => {
    expect(LOD_LEVEL_DISTANCES.high).toBe(0);
    expect(LOD_LEVEL_DISTANCES.medium).toBeGreaterThan(LOD_LEVEL_DISTANCES.high);
    expect(LOD_LEVEL_DISTANCES.low).toBeGreaterThan(LOD_LEVEL_DISTANCES.medium);
  });
});

describe("getLodLevelForDistance", () => {
  it("keeps nearby views on high detail", () => {
    expect(getLodLevelForDistance(0)).toBe("high");
    expect(getLodLevelForDistance(6.9)).toBe("high");
  });

  it("switches to medium detail at the configured middle range", () => {
    expect(getLodLevelForDistance(7)).toBe("medium");
    expect(getLodLevelForDistance(13.9)).toBe("medium");
  });

  it("switches to low detail for distant views", () => {
    expect(getLodLevelForDistance(14)).toBe("low");
    expect(getLodLevelForDistance(28)).toBe("low");
  });
});

describe("getPreviewDistanceForLodLevel", () => {
  it("returns a deterministic camera distance that forces each target lod level", () => {
    expect(getPreviewDistanceForLodLevel("high")).toBeLessThan(LOD_LEVEL_DISTANCES.medium);
    expect(getPreviewDistanceForLodLevel("medium")).toBeGreaterThanOrEqual(
      LOD_LEVEL_DISTANCES.medium,
    );
    expect(getPreviewDistanceForLodLevel("medium")).toBeLessThan(
      LOD_LEVEL_DISTANCES.low,
    );
    expect(getPreviewDistanceForLodLevel("low")).toBeGreaterThanOrEqual(
      LOD_LEVEL_DISTANCES.low,
    );
  });
});
