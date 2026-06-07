export function buildViewportCaptureFileName(importedAssetName: string | null) {
  if (!importedAssetName) {
    return "meshcraft-render.png";
  }

  const stem = importedAssetName.replace(/\.(glb|gltf)$/i, "");
  return `${stem}-render.png`;
}

export async function captureCanvasToPng(
  canvas: HTMLCanvasElement,
  importedAssetName: string | null,
) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (!nextBlob) {
        reject(new Error("Failed to capture viewport PNG"));
        return;
      }

      resolve(nextBlob);
    }, "image/png");
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = buildViewportCaptureFileName(importedAssetName);
  link.click();
  URL.revokeObjectURL(objectUrl);
}
