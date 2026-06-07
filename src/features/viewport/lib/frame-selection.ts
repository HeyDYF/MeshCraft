import { Box3, Sphere, Vector3 } from "three";

type ComputeFrameSelectionPoseOptions = {
  bounds: Box3;
  cameraPosition: Vector3;
  controlsTarget: Vector3;
  fovDegrees: number;
  padding?: number;
};

const FALLBACK_DIRECTION = new Vector3(0, 0, 1);

export function computeFrameSelectionPose({
  bounds,
  cameraPosition,
  controlsTarget,
  fovDegrees,
  padding = 1.35,
}: ComputeFrameSelectionPoseOptions) {
  const sphere = bounds.getBoundingSphere(new Sphere());
  const direction = cameraPosition.clone().sub(controlsTarget);

  if (direction.lengthSq() === 0) {
    direction.copy(FALLBACK_DIRECTION);
  } else {
    direction.normalize();
  }

  const radius = Math.max(sphere.radius, 0.5);
  const fovRadians = (fovDegrees * Math.PI) / 180;
  const distance = (radius / Math.tan(fovRadians / 2)) * padding;
  const target = sphere.center.clone();
  const position = target.clone().add(direction.multiplyScalar(distance));

  return {
    target,
    position,
  };
}
