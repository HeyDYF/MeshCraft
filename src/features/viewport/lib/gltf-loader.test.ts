import { describe, expect, it, vi } from "vitest";
import {
  DRACO_DECODER_PATH,
  createLoaderRuntimeConfig,
  loadGltfWithLoader,
} from "./gltf-loader";

describe("createLoaderRuntimeConfig", () => {
  it("uses the local draco decoder directory and enables worker decoding", () => {
    expect(createLoaderRuntimeConfig()).toEqual({
      dracoDecoderPath: DRACO_DECODER_PATH,
      dracoWorkerLimit: 4,
    });
  });
});

describe("loadGltfWithLoader", () => {
  it("resolves with the loader result", async () => {
    const expected = { scene: { name: "asset" } };
    const loader = {
      load: vi.fn((_url, onLoad) => onLoad(expected)),
    };

    await expect(loadGltfWithLoader(loader, "/asset.glb")).resolves.toBe(expected);
  });

  it("rejects when the loader errors", async () => {
    const loader = {
      load: vi.fn((_url, _onLoad, _onProgress, onError) =>
        onError?.(new Error("decode failed")),
      ),
    };

    await expect(loadGltfWithLoader(loader, "/asset.glb")).rejects.toThrow(
      "decode failed",
    );
  });
});
