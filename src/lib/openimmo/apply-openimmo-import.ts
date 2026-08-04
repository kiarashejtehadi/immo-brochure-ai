import type {
  EnergyFormData,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TransactionType,
} from "@/types/listing";
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
  title: string;
  description: string;
  locationText: string;
};

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

export function importedImagesToFiles(data: OpenImmoImportResult): File[] {
  if (!data.images?.length) return [];
  return data.images.map((img) => base64ToFile(img.base64, img.filename, img.mimeType));
}
