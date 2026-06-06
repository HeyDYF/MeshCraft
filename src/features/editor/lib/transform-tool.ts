export const TRANSFORM_TOOLS = ["translate", "rotate", "scale"] as const;

export type TransformTool = (typeof TRANSFORM_TOOLS)[number];

export const DEFAULT_TRANSFORM_TOOL: TransformTool = "translate";

export function coerceTransformTool(value: string): TransformTool {
  return TRANSFORM_TOOLS.includes(value as TransformTool)
    ? (value as TransformTool)
    : DEFAULT_TRANSFORM_TOOL;
}
