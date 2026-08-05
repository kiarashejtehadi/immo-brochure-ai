import type {
  AgentFormData,
  EnergyFormData,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TransactionType,
} from "@/types/listing";
import type { FeatureKey } from "@/lib/i18n";
import type { OpenImmoImportResult, OpenImmoImportedImage } from "@/types/openimmo-import";
import { mergeOpenImmoFeatures } from "@/lib/openimmo/extract-openimmo-features";
import { sanitizeOpenImmoImportResult } from "@/lib/openimmo/normalize-openimmo-enums";

export function prepareOpenImmoImportForForm(data: OpenImmoImportResult): OpenImmoImportResult {
  return sanitizeOpenImmoImportResult(data);
}

export type OpenImmoFormStateSlice = {
  transactionType?: TransactionType;
  address: ListingAddress;
  size: string;
  rooms: string;
  property: PropertyDetails;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
  features: FeatureKey[];
  agent: Partial<AgentFormData>;
  title: string;
  description: string;
  locationText: string;
};

export type OpenImmoImportPhoto = {
  id: string;
  file: File;
  url: string;
};

export type OpenImmoImportSyncPatch = {
  features: FeatureKey[];
  agent: Partial<AgentFormData>;
  parking?: PropertyDetails["parking"];
};

export type OpenImmoImportApplyCallbacks = {
  /** Apply features, agent, and parking without waiting on images. */
  updateSync: (patch: OpenImmoImportSyncPatch) => void;
  /** Replace photo previews once async loading completes. */
  updatePhotos: (photos: OpenImmoImportPhoto[]) => void;
};

export function mergeImportedAgent(
  prev: AgentFormData,
  imported: Partial<AgentFormData> | undefined,
): AgentFormData {
  if (!imported) return prev;

  return {
    ...prev,
    name: imported.name?.trim() || prev.name,
    agency: imported.agency?.trim() || prev.agency,
    companyAddress: imported.companyAddress?.trim() || prev.companyAddress,
    phone: imported.phone?.trim() || prev.phone,
    email: imported.email?.trim() || prev.email,
    licenseId: imported.licenseId?.trim() || prev.licenseId,
    legalDisclaimer: prev.legalDisclaimer,
  };
}

export function extractOpenImmoSyncPatch(rawData: OpenImmoImportResult): OpenImmoImportSyncPatch {
  const data = prepareOpenImmoImportForForm(rawData);
  return {
    features: data.features ?? [],
    agent: data.agent ?? {},
    parking: data.property?.parking,
  };
}

export function hasMeaningfulOpenImmoImport(
  slice: OpenImmoFormStateSlice,
  raw?: OpenImmoImportResult,
): boolean {
  if (
    slice.title ||
    slice.description ||
    slice.locationText ||
    slice.address.streetAddress ||
    slice.address.city ||
    slice.address.postalCode ||
    slice.size ||
    slice.rooms ||
    slice.rent.netColdRent ||
    slice.rent.totalRent ||
    slice.sale.purchasePrice ||
    slice.property.propertyType ||
    slice.transactionType ||
    slice.features.length > 0
  ) {
    return true;
  }

  if (!raw) return false;

  return Boolean(
    raw.title ||
      raw.description ||
      raw.locationText ||
      raw.address?.streetAddress ||
      raw.address?.city ||
      raw.address?.postalCode ||
      raw.size ||
      raw.rooms ||
      raw.rent?.netColdRent ||
      raw.rent?.totalRent ||
      raw.sale?.purchasePrice ||
      raw.property?.propertyType ||
      raw.transactionType ||
      (raw.features?.length ?? 0) > 0 ||
      raw.agent?.name ||
      raw.agent?.email ||
      raw.agent?.phone ||
      (raw.imageUrls?.length ?? 0) > 0 ||
      (raw.images?.length ?? 0) > 0,
  );
}

export function buildOpenImmoFormStateSlice(
  rawData: OpenImmoImportResult,
  defaults: {
    address: ListingAddress;
    property: PropertyDetails;
    rent: RentFormData;
    sale: SaleFormData;
    energy: EnergyFormData;
  },
): OpenImmoFormStateSlice {
  const data = prepareOpenImmoImportForForm(rawData);

  return {
    transactionType: data.transactionType,
    address: {
      ...defaults.address,
      streetAddress: data.address?.streetAddress ?? "",
      postalCode: data.address?.postalCode ?? "",
      city: data.address?.city ?? "",
      country: data.address?.country ?? defaults.address.country,
    },
    size: data.size ?? "",
    rooms: data.rooms ?? "",
    property: {
      ...defaults.property,
      propertyType: data.property?.propertyType ?? "",
      floorLevel: data.property?.floorLevel ?? "",
      condition: data.property?.condition ?? "",
      parking: data.property?.parking ?? defaults.property.parking,
    },
    rent: {
      ...defaults.rent,
      netColdRent: data.rent?.netColdRent ?? "",
      utilityCharges: data.rent?.utilityCharges ?? "",
      totalRent: data.rent?.totalRent ?? "",
      securityDeposit: data.rent?.securityDeposit ?? "",
    },
    sale: {
      ...defaults.sale,
      purchasePrice: data.sale?.purchasePrice ?? "",
      hoaFee: data.sale?.hoaFee ?? "",
      rentalYield: "",
    },
    energy: {
      ...defaults.energy,
      certificateType: data.energy?.certificateType ?? defaults.energy.certificateType,
      energyValue: data.energy?.energyValue ?? "",
      energyClass: data.energy?.energyClass ?? "",
      heatingSource: data.energy?.heatingSource ?? "",
      constructionYear: data.energy?.constructionYear ?? "",
      heatingInstallYear: "",
    },
    title: data.title?.trim() ?? "",
    description: data.description?.trim() ?? "",
    locationText: data.locationText?.trim() ?? "",
    features: data.features ?? [],
    agent: data.agent ?? {},
  };
}

/**
 * Apply features, agent, and parking immediately — never awaits images.
 */
export function applyOpenImmoImportSync(
  importedData: OpenImmoImportResult,
  updateSync: OpenImmoImportApplyCallbacks["updateSync"],
): void {
  console.log("👉 Applying OpenImmo Import Payload:", importedData);
  updateSync(extractOpenImmoSyncPatch(importedData));
}

/**
 * Apply synchronous import fields immediately, then load photos in the background.
 * Sync updates never wait on or fail because of image fetches.
 */
export async function applyOpenImmoImport(
  importedData: OpenImmoImportResult,
  callbacks: OpenImmoImportApplyCallbacks,
  options?: { maxPhotos?: number },
): Promise<void> {
  applyOpenImmoImportSync(importedData, callbacks.updateSync);
  const photos = await loadImportedPhotos(importedData, options?.maxPhotos ?? 5);
  if (photos.length > 0) {
    callbacks.updatePhotos(photos);
  }
}

export function openImmoPropertyLabel(property: OpenImmoImportResult, index: number): string {
  const title = property.title?.trim();
  const city = property.address?.city?.trim();
  const street = property.address?.streetAddress?.trim();
  const location = [city, street].filter(Boolean).join(" · ");
  const idPrefix = property.importId ? `#${property.importId} · ` : "";

  if (title && location) return `${idPrefix}${title} — ${location}`;
  if (title) return `${idPrefix}${title}`;
  if (location) return `${idPrefix}${location}`;
  return `${idPrefix}Property ${property.importIndex != null ? property.importIndex + 1 : index + 1}`;
}

export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
}

function mimeFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function photoFromBase64(img: OpenImmoImportedImage): OpenImmoImportPhoto {
  const file = base64ToFile(img.base64!, img.filename, img.mimeType);
  return {
    id: `${img.filename}-${file.size}-${crypto.randomUUID()}`,
    file,
    url: URL.createObjectURL(file),
  };
}

function photoFromDataUrl(url: string, filename: string): OpenImmoImportPhoto {
  const file = new File([], filename, { type: "image/jpeg" });
  return {
    id: `${filename}-${crypto.randomUUID()}`,
    file,
    url,
  };
}

async function photoFromRemoteUrl(
  url: string,
  filename: string,
  mimeType: string,
): Promise<OpenImmoImportPhoto> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      const file = new File([blob], filename, {
        type: mimeType || blob.type || "image/jpeg",
      });
      return {
        id: `${filename}-${file.size}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(blob),
      };
    }
  } catch (err) {
    console.warn(
      `[OpenImmo Import] CORS error fetching image ${url}, falling back to direct URL:`,
      err,
    );
  }

  const file = new File([], filename, { type: mimeType });
  return {
    id: `${filename}-${crypto.randomUUID()}`,
    file,
    url,
  };
}

function collectImageCandidates(data: OpenImmoImportResult): Array<{
  url: string;
  filename: string;
  mimeType: string;
  base64?: string;
}> {
  const seen = new Set<string>();
  const candidates: Array<{ url: string; filename: string; mimeType: string; base64?: string }> =
    [];

  const addCandidate = (entry: {
    url?: string;
    filename: string;
    mimeType: string;
    base64?: string;
  }) => {
    const key = (entry.base64 ? `b64:${entry.filename}` : entry.url)?.toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    candidates.push({
      url: entry.url ?? "",
      filename: entry.filename,
      mimeType: entry.mimeType,
      base64: entry.base64,
    });
  };

  for (const img of data.images ?? []) {
    if (img.base64) {
      addCandidate({ filename: img.filename, mimeType: img.mimeType, base64: img.base64 });
      continue;
    }
    if (img.url) {
      addCandidate({ url: img.url, filename: img.filename, mimeType: img.mimeType });
    }
  }

  for (const url of data.imageUrls ?? []) {
    const filename = url.split("/").pop()?.split("?")[0]?.split("#")[0] ?? "image.jpg";
    addCandidate({ url, filename, mimeType: mimeFromFilename(filename) });
  }

  return candidates;
}

export async function loadImportedPhotos(
  data: OpenImmoImportResult,
  maxPhotos = 5,
): Promise<OpenImmoImportPhoto[]> {
  const candidates = collectImageCandidates(data);
  if (candidates.length === 0) return [];

  const loaded = await Promise.all(
    candidates.slice(0, maxPhotos).map(async (candidate) => {
      if (candidate.base64) {
        return photoFromBase64({
          filename: candidate.filename,
          mimeType: candidate.mimeType,
          base64: candidate.base64,
        });
      }

      const url = candidate.url.trim();
      if (!url) return null;

      if (url.startsWith("data:image/") || url.startsWith("blob:")) {
        return photoFromDataUrl(url, candidate.filename);
      }

      return photoFromRemoteUrl(url, candidate.filename, candidate.mimeType);
    }),
  );

  return loaded.filter((photo): photo is OpenImmoImportPhoto => photo != null);
}

/** @deprecated Use loadImportedPhotos via applyOpenImmoImport instead. */
export async function importedImagesToFiles(data: OpenImmoImportResult): Promise<File[]> {
  const photos = await loadImportedPhotos(data);
  return photos.map((photo) => photo.file);
}

export { mergeOpenImmoFeatures };
