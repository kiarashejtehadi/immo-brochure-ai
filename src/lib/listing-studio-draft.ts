import { mergeListingAddress } from "@/lib/location/format-address";
import { compressImageForUpload, fileToBase64 } from "@/lib/prepare-images";
import type { CurrencyCode } from "@/lib/currency";
import type { FeatureKey, OutputLanguage, ToneKey } from "@/lib/i18n";
import type {
  AgentFormData,
  CommissionPreset,
  EnergyFormData,
  GenerateResult,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TargetMarket,
  TransactionType,
  UserRole,
} from "@/types/listing";

export const LISTING_STUDIO_DRAFT_STORAGE_KEY = "listing-studio-draft-v1";

export type StoredPhotoDraft = {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  lastModified: number;
};

export type ListingStudioPreviewTab = "story" | "location" | "social" | "reel";

export type ListingStudioDraft = {
  version: 1;
  ownerKey: string;
  savedAt: number;
  targetLanguage: OutputLanguage;
  currency: CurrencyCode;
  targetMarket: TargetMarket;
  userRole: UserRole;
  commissionPreset: CommissionPreset;
  bedrooms: string;
  bathrooms: string;
  transactionType: TransactionType;
  address: ListingAddress;
  size: string;
  rooms: string;
  property: PropertyDetails;
  features: FeatureKey[];
  tone: ToneKey;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
  agent: AgentFormData;
  photos: StoredPhotoDraft[];
  floorPlan: StoredPhotoDraft | null;
  result: GenerateResult | null;
  hasGenerated: boolean;
  previewTab: ListingStudioPreviewTab;
};

export function draftOwnerKey(email: string | null | undefined): string {
  const normalized = email?.trim().toLowerCase();
  return normalized || "__anonymous__";
}

export function readListingStudioDraft(): ListingStudioDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LISTING_STUDIO_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListingStudioDraft;
    if (parsed?.version !== 1 || typeof parsed.ownerKey !== "string") return null;
    return {
      ...parsed,
      address: mergeListingAddress(parsed.address),
    };
  } catch {
    return null;
  }
}

export function clearListingStudioDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LISTING_STUDIO_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function writeListingStudioDraft(draft: ListingStudioDraft): boolean {
  if (typeof window === "undefined") return false;
  try {
    sessionStorage.setItem(LISTING_STUDIO_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    try {
      sessionStorage.setItem(
        LISTING_STUDIO_DRAFT_STORAGE_KEY,
        JSON.stringify({ ...draft, photos: [], floorPlan: null }),
      );
      return true;
    } catch {
      return false;
    }
  }
}

function dataUrlToFile(
  dataUrl: string,
  name: string,
  mimeType: string,
  lastModified: number,
): File {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1]! : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: mimeType, lastModified });
}

export async function fileToStoredPhotoDraft(
  id: string,
  file: File,
): Promise<StoredPhotoDraft> {
  const compressed = await compressImageForUpload(file);
  const { base64, mimeType } = await fileToBase64(compressed);
  return {
    id,
    name: file.name,
    mimeType,
    dataUrl: `data:${mimeType};base64,${base64}`,
    lastModified: file.lastModified,
  };
}

export type RestoredPhotoPreview = {
  id: string;
  file: File;
  url: string;
};

export function storedPhotoToPreview(stored: StoredPhotoDraft): RestoredPhotoPreview {
  const file = dataUrlToFile(stored.dataUrl, stored.name, stored.mimeType, stored.lastModified);
  return {
    id: stored.id,
    file,
    url: URL.createObjectURL(file),
  };
}
