import { Color } from "three";

export const HOLOGRAM_UNIFORM_DEFAULTS = {
  uTime: 0,
  uScanSpeed: 2.35,
  uScanStrength: 0.42,
  uFresnelPower: 2.8,
  uOpacity: 0.32,
  uGlowColor: new Color("#39d8ff"),
};

export const hologramVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
  vUv = uv;
  vPosition = position;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vViewDirection = normalize(cameraPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const hologramFragmentShader = `
uniform float uTime;
uniform float uScanSpeed;
uniform float uScanStrength;
uniform float uFresnelPower;
uniform float uOpacity;
uniform vec3 uGlowColor;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
  float scan = sin(uTime * uScanSpeed + vPosition.y * 6.0) * 0.5 + 0.5;
  float scanMask = smoothstep(0.55, 1.0, scan) * uScanStrength;
  float fresnel = pow(1.0 - max(dot(normalize(vWorldNormal), normalize(vViewDirection)), 0.0), uFresnelPower);
  float gridPulse = smoothstep(0.75, 1.0, sin((vUv.y + uTime * 0.08) * 60.0) * 0.5 + 0.5) * 0.08;
  vec3 finalColor = uGlowColor * (0.35 + scanMask + fresnel + gridPulse);
  float alpha = clamp(uOpacity + scanMask * 0.45 + fresnel * 0.55, 0.0, 0.98);

  gl_FragColor = vec4(finalColor, alpha);
}
`;
