import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { yieldToMainThread } from "@/lib/yield-to-main-thread";

/** Transparent 1×1 SVG — safe fallback when an image cannot be embedded. */
export const PDF_BLANK_IMAGE_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4=";

const PDF_MAX_EDGE = 1000;
const PDF_JPEG_QUALITY = 0.7;

export type PdfReadyImages = {
  photoDataUrls: string[];
  floorPlanDataUrl?: string;
  logoDataUrl?: string;
  avatarDataUrl?: string;
  mapDataUrl?: string;
};

export function isPdfSafeDataUrl(src: string | undefined | null): src is string {
  if (!src?.trim()) return false;
  return /^data:image\//i.test(src.trim());
}

/**
 * Only pass data URLs into @react-pdf/renderer `<Image />`.
 * Remote URLs hang when CORS blocks the fetch inside react-pdf.
 */
export function sanitizePdfImageSrc(
  src: string | undefined | null,
): string | undefined {
  if (!src?.trim()) return undefined;
  if (isPdfSafeDataUrl(src)) return src.trim();
  console.warn("[pdf] Blocked non-data-url image src for react-pdf");
  return undefined;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image blob"));
    };
    reader.onerror = () => reject(new Error("Could not read image blob"));
    reader.readAsDataURL(blob);
  });
}

/** Non-blocking canvas resize — yields before/after heavy work. */
async function compressFileForPdf(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  await yieldToMainThread();

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PDF_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
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
      canvas.toBlob(resolve, "image/jpeg", PDF_JPEG_QUALITY);
    });

    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Convert a local File to a JPEG data URL for PDF embedding. */
export async function fileToPdfDataUrl(file: File): Promise<string> {
  try {
    const compressed = await compressFileForPdf(file);
    await yieldToMainThread();
    const dataUrl = await readBlobAsDataUrl(compressed);
    return isPdfSafeDataUrl(dataUrl) ? dataUrl : PDF_BLANK_IMAGE_DATA_URL;
  } catch (err) {
    console.warn("[pdf] fileToPdfDataUrl failed", err);
    return PDF_BLANK_IMAGE_DATA_URL;
  }
}

/** Fetch a remote branding asset and convert to a data URL (never pass the URL to react-pdf). */
export async function urlToPdfDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 8_000 });
    if (!res.ok) return undefined;
    const blob = await res.blob();
    await yieldToMainThread();
    const dataUrl = await readBlobAsDataUrl(blob);
    return sanitizePdfImageSrc(dataUrl);
  } catch (err) {
    console.warn("[pdf] urlToPdfDataUrl failed", err);
    return undefined;
  }
}

/**
 * Prepare all PDF image props in one async pass (call from click handlers only — never during render).
 * Processes photos sequentially with main-thread yields so caption UI stays responsive.
 */
export async function preparePdfImageProps(input: {
  photoFiles: File[];
  floorPlanFile?: File | null;
  logoDataUrl?: string;
  avatarDataUrl?: string;
  mapDataUrl?: string;
}): Promise<PdfReadyImages> {
  const photoDataUrls: string[] = [];
  for (const file of input.photoFiles) {
    photoDataUrls.push(await fileToPdfDataUrl(file));
    await yieldToMainThread();
  }

  let floorPlanDataUrl: string | undefined;
  if (input.floorPlanFile) {
    const raw = await fileToPdfDataUrl(input.floorPlanFile);
    floorPlanDataUrl =
      raw !== PDF_BLANK_IMAGE_DATA_URL ? raw : undefined;
    await yieldToMainThread();
  }

  return {
    photoDataUrls,
    floorPlanDataUrl,
    logoDataUrl: sanitizePdfImageSrc(input.logoDataUrl),
    avatarDataUrl: sanitizePdfImageSrc(input.avatarDataUrl),
    mapDataUrl: sanitizePdfImageSrc(input.mapDataUrl),
  };
}
