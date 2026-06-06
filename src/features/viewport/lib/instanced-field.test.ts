import { describe, expect, it } from "vitest";
import { buildInstanceTransforms } from "./instanced-field";

describe("buildInstanceTransforms", () => {
  it("creates the requested instance count within the configured annulus", () => {
    const transforms = buildInstanceTransforms({
      count: 24,
      innerRadius: 4,
      outerRadius: 8,
      seed: 7,
    });

    expect(transforms).toHaveLength(24);

    for (const transform of transforms) {
      const radius = Math.hypot(transform.position.x, transform.position.z);

      expect(radius).toBeGreaterThanOrEqual(4);
      expect(radius).toBeLessThanOrEqual(8);
      expect(transform.scale.x).toBeGreaterThan(0);
      expect(transform.scale.y).toBeGreaterThan(0);
      expect(transform.scale.z).toBeGreaterThan(0);
    }
  });

  it("is deterministic for a given seed", () => {
    const first = buildInstanceTransforms({
      count: 8,
      innerRadius: 3,
      outerRadius: 6,
      seed: 11,
    });
    const second = buildInstanceTransforms({
      count: 8,
      innerRadius: 3,
      outerRadius: 6,
      seed: 11,
    });

    expect(second).toEqual(first);
  });

  it("spreads instances across different transforms instead of collapsing them", () => {
    const transforms = buildInstanceTransforms({
      count: 12,
      innerRadius: 3,
      outerRadius: 5,
      seed: 3,
    });

    const uniquePositions = new Set(
      transforms.map((transform) =>
        [
          transform.position.x.toFixed(3),
          transform.position.y.toFixed(3),
          transform.position.z.toFixed(3),
        ].join(":"),
      ),
    );

    expect(uniquePositions.size).toBeGreaterThan(8);
  });
});
