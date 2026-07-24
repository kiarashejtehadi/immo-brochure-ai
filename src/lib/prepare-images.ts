const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

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

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
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

export async function prepareImagesForApi(files: File[]) {
  const compressed = await Promise.all(files.map((f) => compressImageForUpload(f)));
  return Promise.all(compressed.map((f) => fileToBase64(f)));
}
