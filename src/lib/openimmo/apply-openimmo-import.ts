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
import type { OpenImmoImportResult } from "@/types/openimmo-import";
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

export async function importedImagesToFiles(data: OpenImmoImportResult): Promise<File[]> {
  if (!data.images?.length) return [];

  const files: File[] = [];
  for (const img of data.images) {
    if (img.base64) {
      files.push(base64ToFile(img.base64, img.filename, img.mimeType));
      continue;
    }

    if (img.url) {
      try {
        const res = await fetch(img.url);
        if (!res.ok) continue;
        const blob = await res.blob();
        files.push(
          new File([blob], img.filename, {
            type: img.mimeType || blob.type || "image/jpeg",
          }),
        );
      } catch {
        // CORS or network failure — skip remote image
      }
    }
  }

  return files;
}
