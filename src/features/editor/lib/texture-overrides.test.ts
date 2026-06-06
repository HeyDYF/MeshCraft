import { describe, expect, it } from "vitest";
import {
  clearTextureOverride,
  isSupportedTextureFile,
  setTextureOverride,
} from "./texture-overrides";

describe("isSupportedTextureFile", () => {
  it("accepts common browser-safe texture formats", () => {
    expect(isSupportedTextureFile("albedo.png")).toBe(true);
    expect(isSupportedTextureFile("normal.jpg")).toBe(true);
    expect(isSupportedTextureFile("mask.webp")).toBe(true);
    expect(isSupportedTextureFile("preview.jpeg")).toBe(true);
  });

  it("rejects unrelated files", () => {
    expect(isSupportedTextureFile("scene.glb")).toBe(false);
    expect(isSupportedTextureFile("notes.txt")).toBe(false);
  });
});

describe("setTextureOverride", () => {
  it("writes or replaces a per-material per-channel override entry", () => {
    const updated = setTextureOverride(
      {},
      "mat-a",
      "map",
      {
        name: "paint_alt.png",
        objectUrl: "blob:paint-alt",
      },
    );

    expect(updated).toEqual({
      "mat-a": {
        map: {
          name: "paint_alt.png",
          objectUrl: "blob:paint-alt",
        },
      },
    });
  });
});

describe("clearTextureOverride", () => {
  it("removes a single channel override and keeps unrelated channels", () => {
    const cleared = clearTextureOverride(
      {
        "mat-a": {
          map: {
            name: "paint_alt.png",
            objectUrl: "blob:paint-alt",
          },
          normalMap: {
            name: "paint_normal.png",
            objectUrl: "blob:paint-normal",
          },
        },
      },
      "mat-a",
      "map",
    );

    expect(cleared).toEqual({
      "mat-a": {
        normalMap: {
          name: "paint_normal.png",
          objectUrl: "blob:paint-normal",
        },
      },
    });
  });
});
