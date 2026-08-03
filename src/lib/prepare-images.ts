import { yieldToMainThread } from "@/lib/yield-to-main-thread";
import { API_VISION_IMAGE_MAX_EDGE } from "@/lib/generate-vision";

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

async function resizeImageFile(
  file: File,
  maxEdge: number,
  quality: number,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  await yieldToMainThread();

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    await yieldToMainThread();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    await yieldToMainThread();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function compressImageForUpload(file: File): Promise<File> {
  return resizeImageFile(file, MAX_EDGE, JPEG_QUALITY);
}

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image file"));
        return;
      }
      const comma = result.indexOf(",");
      if (comma === -1) {
        reject(new Error("Invalid image data"));
        return;
      }
      resolve({
        base64: result.slice(comma + 1),
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

export async function prepareImagesForApi(
  files: File[],
  options?: { limit?: number; maxEdge?: number },
) {
  const batch = files.slice(0, options?.limit ?? files.length);
  const maxEdge = options?.maxEdge ?? MAX_EDGE;

  await yieldToMainThread();

  return Promise.all(
    batch.map(async (file) => {
      const compressed = await resizeImageFile(file, maxEdge, JPEG_QUALITY);
      return fileToBase64(compressed);
    }),
  );
}

export { API_VISION_IMAGE_MAX_EDGE };
