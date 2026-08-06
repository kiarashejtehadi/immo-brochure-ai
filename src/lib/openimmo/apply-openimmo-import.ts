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

export type ListingImportCurrentState = {
  transactionType: TransactionType;
  address: ListingAddress;
  size: string;
  rooms: string;
  property: PropertyDetails;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
  features: FeatureKey[];
  agent: AgentFormData;
  title: string;
  description: string;
  locationText: string;
};

export type ListingImportMergedState = ListingImportCurrentState;

export type OpenImmoImportPhoto = {
  id: string;
  file: File;
  url: string;
};

export type ListingImportDefaults = {
  address: ListingAddress;
  property: PropertyDetails;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
};

function pickImportedString(imported: string | undefined, current: string): string {
  const next = imported?.trim();
  return next ? next : current;
}

function mergePartialRent(imported: Partial<RentFormData>, current: RentFormData): RentFormData {
  return {
    ...current,
    netColdRent: pickImportedString(imported.netColdRent, current.netColdRent),
    utilityCharges: pickImportedString(imported.utilityCharges, current.utilityCharges),
    totalRent: pickImportedString(imported.totalRent, current.totalRent),
    securityDeposit: pickImportedString(imported.securityDeposit, current.securityDeposit),
  };
}

function mergePartialSale(imported: Partial<SaleFormData>, current: SaleFormData): SaleFormData {
  return {
    ...current,
    purchasePrice: pickImportedString(imported.purchasePrice, current.purchasePrice),
    hoaFee: pickImportedString(imported.hoaFee, current.hoaFee),
  };
}

function mergePartialEnergy(imported: Partial<EnergyFormData>, current: EnergyFormData): EnergyFormData {
  return {
    ...current,
    certificateType: imported.certificateType ?? current.certificateType,
    energyValue: pickImportedString(imported.energyValue, current.energyValue),
    energyClass: imported.energyClass ?? current.energyClass,
    heatingSource: imported.heatingSource ?? current.heatingSource,
    constructionYear: pickImportedString(imported.constructionYear, current.constructionYear),
    heatingInstallYear: pickImportedString(imported.heatingInstallYear, current.heatingInstallYear),
  };
}

export function mergeImportedAgent(
  existingAgent: AgentFormData,
  importedAgent: Partial<AgentFormData> | undefined,
): AgentFormData {
  if (!importedAgent) return existingAgent;

  return {
    ...existingAgent,
    name: pickImportedString(importedAgent.name, existingAgent.name),
    email: pickImportedString(importedAgent.email, existingAgent.email),
    phone: pickImportedString(importedAgent.phone, existingAgent.phone),
    agency: pickImportedString(importedAgent.agency, existingAgent.agency),
    companyAddress: pickImportedString(importedAgent.companyAddress, existingAgent.companyAddress),
    licenseId: pickImportedString(importedAgent.licenseId, existingAgent.licenseId),
    legalDisclaimer: existingAgent.legalDisclaimer,
  };
}

export function buildOpenImmoFormStateSlice(
  rawData: OpenImmoImportResult,
  defaults: ListingImportDefaults,
): OpenImmoFormStateSlice {
  const data = prepareOpenImmoImportForForm(rawData);

  return {
    transactionType: data.transactionType,
    address: {
      ...defaults.address,
      streetAddress: data.address?.streetAddress ?? "",
      houseNumber: data.address?.houseNumber ?? "",
      unitNumber: "",
      postalCode: data.address?.postalCode ?? "",
      city: data.address?.city ?? "",
      country: data.address?.country ?? defaults.address.country,
    },
    size: data.size ?? "",
    rooms: data.rooms ?? "",
    property: {
      ...defaults.property,
      propertyType: data.property?.propertyType ?? "",
      floorLevel:
        data.property?.floorLevel?.trim() ||
        data.address?.unitNumber?.trim() ||
        "",
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

/** Compute the full merged listing form state in one pure step. */
export function buildImportedFormState(
  currentState: ListingImportCurrentState,
  rawData: OpenImmoImportResult,
  defaults: ListingImportDefaults,
): ListingImportMergedState {
  const imported = buildOpenImmoFormStateSlice(rawData, defaults);

  return {
    transactionType: imported.transactionType ?? currentState.transactionType,
    address: {
      ...currentState.address,
      streetAddress: pickImportedString(imported.address.streetAddress, currentState.address.streetAddress),
      houseNumber: pickImportedString(imported.address.houseNumber, currentState.address.houseNumber),
      unitNumber: pickImportedString(imported.address.unitNumber, currentState.address.unitNumber),
      postalCode: pickImportedString(imported.address.postalCode, currentState.address.postalCode),
      city: pickImportedString(imported.address.city, currentState.address.city),
      country: pickImportedString(imported.address.country, currentState.address.country),
    },
    size: pickImportedString(imported.size, currentState.size),
    rooms: pickImportedString(imported.rooms, currentState.rooms),
    property: {
      ...currentState.property,
      propertyType: imported.property.propertyType || currentState.property.propertyType,
      floorLevel: pickImportedString(imported.property.floorLevel, currentState.property.floorLevel),
      condition: imported.property.condition || currentState.property.condition,
      parking: imported.property.parking || currentState.property.parking || "",
    },
    rent: mergePartialRent(imported.rent, currentState.rent),
    sale: mergePartialSale(imported.sale, currentState.sale),
    energy: mergePartialEnergy(imported.energy, currentState.energy),
    features: mergeOpenImmoFeatures(currentState.features, imported.features, "merge"),
    agent: mergeImportedAgent(currentState.agent, imported.agent),
    title: pickImportedString(imported.title, currentState.title),
    description: pickImportedString(imported.description, currentState.description),
    locationText: pickImportedString(imported.locationText, currentState.locationText),
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
      `[OpenImmo Background] CORS/Fetch error for ${url}, using direct URL fallback:`,
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

async function loadSingleImportedPhoto(candidate: {
  url: string;
  filename: string;
  mimeType: string;
  base64?: string;
}): Promise<OpenImmoImportPhoto | null> {
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
}

export function appendImportedPhotos(
  existing: OpenImmoImportPhoto[],
  incoming: OpenImmoImportPhoto[],
  maxPhotos: number,
): OpenImmoImportPhoto[] {
  const next = [...existing];
  const seen = new Set(next.map((photo) => photo.url.toLowerCase()));

  for (const photo of incoming) {
    if (next.length >= maxPhotos) break;
    const key = photo.url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(photo);
  }

  return next;
}

/** Non-blocking sequential background loader — appends photos without touching sync form state. */
export async function loadImportedPhotosInBackground(
  importedData: OpenImmoImportResult,
  onPhotosLoaded: (photos: OpenImmoImportPhoto[]) => void,
  maxPhotos = 5,
): Promise<void> {
  const candidates = collectImageCandidates(importedData);
  if (candidates.length === 0) return;

  console.log("[OpenImmo Background] Fetching photos in background:", candidates.length);

  const loaded: OpenImmoImportPhoto[] = [];

  for (const candidate of candidates) {
    if (loaded.length >= maxPhotos) break;
    const photo = await loadSingleImportedPhoto(candidate);
    if (photo) loaded.push(photo);
  }

  if (loaded.length > 0) {
    onPhotosLoaded(loaded);
    console.log("[OpenImmo Background] Photos appended cleanly:", loaded.length);
  }
}

/** @deprecated Use loadImportedPhotosInBackground instead. */
export async function loadImportedPhotos(
  data: OpenImmoImportResult,
  maxPhotos = 5,
): Promise<OpenImmoImportPhoto[]> {
  const loaded: OpenImmoImportPhoto[] = [];
  await loadImportedPhotosInBackground(data, (photos) => {
    loaded.push(...photos);
  }, maxPhotos);
  return loaded;
}

export { mergeOpenImmoFeatures };
