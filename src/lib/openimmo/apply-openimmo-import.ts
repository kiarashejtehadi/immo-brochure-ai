import type { OpenImmoImportResult } from "@/types/openimmo-import";

export function openImmoPropertyLabel(property: OpenImmoImportResult, index: number): string {
  const title = property.title?.trim();
  const city = property.address?.city?.trim();
  const street = property.address?.streetAddress?.trim();
  const location = [city, street].filter(Boolean).join(" · ");

  if (title && location) return `${title} — ${location}`;
  if (title) return title;
  if (location) return location;
  return `Property ${index + 1}`;
}

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
