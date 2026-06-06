import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export const DRACO_DECODER_PATH = "/draco/";

export function createLoaderRuntimeConfig() {
  return {
    dracoDecoderPath: DRACO_DECODER_PATH,
    dracoWorkerLimit: 4,
  };
}

export function createConfiguredGltfLoader() {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  const config = createLoaderRuntimeConfig();

  dracoLoader.setDecoderPath(config.dracoDecoderPath);
  dracoLoader.setWorkerLimit(config.dracoWorkerLimit);
  gltfLoader.setDRACOLoader(dracoLoader);

  return {
    gltfLoader,
    dracoLoader,
  };
}

export function loadGltfWithLoader(
  loader: Pick<GLTFLoader, "load">,
  url: string,
): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}
