import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { compressImageForPdf } from "@/lib/prepare-images";

/** Transparent 1×1 SVG — safe fallback when an image cannot be embedded. */
export const PDF_BLANK_IMAGE_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4=";

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

/** Convert a local File to a JPEG/PNG data URL for PDF embedding. */
export async function fileToPdfDataUrl(file: File): Promise<string> {
  try {
    const compressed = await compressImageForPdf(file);
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
    const dataUrl = await readBlobAsDataUrl(blob);
    return sanitizePdfImageSrc(dataUrl);
  } catch (err) {
    console.warn("[pdf] urlToPdfDataUrl failed", err);
    return undefined;
  }
}

/** Normalize every image prop before handing off to the PDF document tree. */
export async function preparePdfImageProps(input: {
  photoFiles: File[];
  floorPlanFile?: File | null;
  logoDataUrl?: string;
  avatarDataUrl?: string;
  mapDataUrl?: string;
}): Promise<{
  photoDataUrls: string[];
  floorPlanDataUrl?: string;
  logoDataUrl?: string;
  avatarDataUrl?: string;
  mapDataUrl?: string;
}> {
  const [photoDataUrls, floorPlanDataUrl, logoDataUrl, avatarDataUrl, mapDataUrl] =
    await Promise.all([
      Promise.all(input.photoFiles.map((file) => fileToPdfDataUrl(file))),
      input.floorPlanFile ? fileToPdfDataUrl(input.floorPlanFile) : Promise.resolve(undefined),
      Promise.resolve(sanitizePdfImageSrc(input.logoDataUrl)),
      Promise.resolve(sanitizePdfImageSrc(input.avatarDataUrl)),
      Promise.resolve(sanitizePdfImageSrc(input.mapDataUrl)),
    ]);

  return {
    photoDataUrls,
    floorPlanDataUrl:
      floorPlanDataUrl && floorPlanDataUrl !== PDF_BLANK_IMAGE_DATA_URL
        ? floorPlanDataUrl
        : undefined,
    logoDataUrl,
    avatarDataUrl,
    mapDataUrl,
  };
}
