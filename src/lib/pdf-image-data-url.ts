import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { withTimeout } from "@/lib/promise-timeout";
import { yieldToMainThread } from "@/lib/yield-to-main-thread";

/** Transparent 1×1 SVG — safe fallback when an image cannot be embedded. */
export const PDF_BLANK_IMAGE_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4=";

/** Max edge for listing photos embedded in PDFs. */
const PDF_MAX_EDGE = 720;
/** Smaller cap for branding logo/avatar — large assets freeze react-pdf. */
const PDF_BRANDING_MAX_EDGE = 320;
const PDF_JPEG_QUALITY = 0.62;
const PDF_BRANDING_JPEG_QUALITY = 0.75;

export type PdfReadyImages = {
  photoDataUrls: string[];
  floorPlanDataUrl?: string;
  logoDataUrl?: string;
  avatarDataUrl?: string;
  mapDataUrl?: string;
};

export function isPdfSafeDataUrl(src: string | undefined | null): src is string {
  if (!src?.trim()) return false;
  const trimmed = src.trim();
  if (!/^data:image\//i.test(trimmed)) return false;
  // react-pdf hangs on SVG — raster JPEG/PNG only
  if (/^data:image\/svg/i.test(trimmed)) return false;
  return true;
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

/** Rasterize any image blob to a JPEG data URL sized for PDF embedding. */
async function blobToPdfJpegDataUrl(
  blob: Blob,
  maxEdge: number,
  quality: number,
): Promise<string | undefined> {
  if (!blob.type.startsWith("image/") && blob.size === 0) return undefined;

  await yieldToMainThread();

  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height, 1));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    await yieldToMainThread();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return undefined;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    await yieldToMainThread();

    const jpeg = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
    if (!jpeg) return undefined;

    const dataUrl = await readBlobAsDataUrl(jpeg);
    return isPdfSafeDataUrl(dataUrl) ? dataUrl : undefined;
  } catch (err) {
    console.warn("[pdf] blobToPdfJpegDataUrl failed", err);
    return undefined;
  }
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

/** Fetch a remote branding asset, rasterize to JPEG (SVG-safe), for react-pdf. */
export async function urlToPdfDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 5_000, cache: "no-store" });
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return blobToPdfJpegDataUrl(blob, PDF_BRANDING_MAX_EDGE, PDF_BRANDING_JPEG_QUALITY);
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

/** Fetch branding asset with a hard timeout — never block PDF generation. */
export async function brandingUrlToPdfDataUrl(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url?.trim()) return undefined;
  try {
    return await withTimeout(
      urlToPdfDataUrl(url),
      6_000,
      "Branding image fetch timed out",
    );
  } catch (err) {
    console.warn("[pdf] brandingUrlToPdfDataUrl skipped", err);
    return undefined;
  }
}
