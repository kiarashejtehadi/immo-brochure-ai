import type { OpenImmoImportResult } from "@/types/openimmo-import";

export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
}

export function importedImagesToFiles(data: OpenImmoImportResult): File[] {
  if (!data.images?.length) return [];
  return data.images.map((img) => base64ToFile(img.base64, img.filename, img.mimeType));
}
