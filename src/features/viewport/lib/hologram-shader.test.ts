import { describe, expect, it } from "vitest";
import {
  HOLOGRAM_UNIFORM_DEFAULTS,
  hologramFragmentShader,
  hologramVertexShader,
} from "./hologram-shader";

describe("HOLOGRAM_UNIFORM_DEFAULTS", () => {
  it("exposes stable defaults for the scan effect uniforms", () => {
    expect(HOLOGRAM_UNIFORM_DEFAULTS.uTime).toBe(0);
    expect(HOLOGRAM_UNIFORM_DEFAULTS.uScanSpeed).toBeGreaterThan(0);
    expect(HOLOGRAM_UNIFORM_DEFAULTS.uScanStrength).toBeGreaterThan(0);
    expect(HOLOGRAM_UNIFORM_DEFAULTS.uFresnelPower).toBeGreaterThan(0);
    expect(HOLOGRAM_UNIFORM_DEFAULTS.uOpacity).toBeGreaterThan(0);
  });
});

describe("hologramVertexShader", () => {
  it("passes local position, uv and view-dependent data into the fragment stage", () => {
    expect(hologramVertexShader).toContain("varying vec2 vUv;");
    expect(hologramVertexShader).toContain("varying vec3 vPosition;");
    expect(hologramVertexShader).toContain("varying vec3 vWorldNormal;");
    expect(hologramVertexShader).toContain("varying vec3 vViewDirection;");
  });
});

describe("hologramFragmentShader", () => {
  it("combines a time-driven scanline with a Fresnel glow", () => {
    expect(hologramFragmentShader).toContain("uniform float uTime;");
    expect(hologramFragmentShader).toContain("sin(uTime * uScanSpeed");
    expect(hologramFragmentShader).toContain("fresnel");
    expect(hologramFragmentShader).toContain("gl_FragColor");
  });
});
