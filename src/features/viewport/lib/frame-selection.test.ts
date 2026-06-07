import { describe, expect, it } from "vitest";
import { Box3, Vector3 } from "three";
import { computeFrameSelectionPose } from "./frame-selection";

describe("computeFrameSelectionPose", () => {
  it("frames the center of a single bounds box using the current camera direction", () => {
    const pose = computeFrameSelectionPose({
      bounds: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)),
      cameraPosition: new Vector3(6, 4, 8),
      controlsTarget: new Vector3(0, 0, 0),
      fovDegrees: 42,
      padding: 1.4,
    });

    expect(pose.target.toArray()).toEqual([0, 0, 0]);
    expect(pose.position.distanceTo(pose.target)).toBeGreaterThan(5);
  });

  it("unions multiple bounds and falls back to a forward direction when camera and target overlap", () => {
    const pose = computeFrameSelectionPose({
      bounds: new Box3(new Vector3(-2, -1, -1), new Vector3(3, 2, 1)),
      cameraPosition: new Vector3(0, 0, 0),
      controlsTarget: new Vector3(0, 0, 0),
      fovDegrees: 42,
      padding: 1.2,
    });

    expect(pose.target.toArray()).toEqual([0.5, 0.5, 0]);
    expect(pose.position.z).toBeGreaterThan(pose.target.z);
  });
});
