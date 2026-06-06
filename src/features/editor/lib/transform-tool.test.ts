import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRANSFORM_TOOL,
  coerceTransformTool,
  TRANSFORM_TOOLS,
} from "./transform-tool";

describe("TRANSFORM_TOOLS", () => {
  it("exposes the supported transform gizmo modes in editor order", () => {
    expect(TRANSFORM_TOOLS).toEqual(["translate", "rotate", "scale"]);
    expect(DEFAULT_TRANSFORM_TOOL).toBe("translate");
  });
});

describe("coerceTransformTool", () => {
  it("accepts valid transform tools and falls back for unknown values", () => {
    expect(coerceTransformTool("translate")).toBe("translate");
    expect(coerceTransformTool("rotate")).toBe("rotate");
    expect(coerceTransformTool("scale")).toBe("scale");
    expect(coerceTransformTool("skew")).toBe("translate");
  });
});
