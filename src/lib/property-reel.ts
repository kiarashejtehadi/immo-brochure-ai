import { formatPriceAmount, type CurrencyCode } from "@/lib/currency";
import type { FormCopy } from "@/lib/i18n-form";
import { propertyTypeLabel } from "@/lib/listing-property-labels";
import { DEFAULT_BRAND_COLOR } from "@/types/branding";
import type { UserBrandingProfile } from "@/types/branding";
import type {
  PropertyReelProps,
  ReelBrokerContact,
} from "@/types/property-reel";
import type {
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TransactionType,
} from "@/types/listing";

export function formatReelSize(size: string): string {
  const trimmed = size.trim();
  if (!trimmed) return "";
  if (/m²|m2|sq\.?\s*m/i.test(trimmed)) return trimmed;
  return `${trimmed} m²`;
}

export function reelBrandingFromProfile(
  branding: UserBrandingProfile | null,
  isPro: boolean,
  agent: { name: string; phone: string; email: string },
): Pick<PropertyReelProps, "agencyLogoUrl" | "brandColor" | "brokerContact"> {
  const brandColor =
    isPro && branding?.brandColor?.trim()
      ? branding.brandColor.trim()
      : DEFAULT_BRAND_COLOR;

  const agencyLogoUrl =
    isPro && branding?.logoUrl ? branding.logoUrl : undefined;

  const brokerContact: ReelBrokerContact = {
    name:
      (isPro ? branding?.brokerName?.trim() : undefined) ||
      agent.name.trim() ||
      undefined,
    phone:
      (isPro ? branding?.contactPhone?.trim() : undefined) ||
      agent.phone.trim() ||
      undefined,
    email:
      (isPro ? branding?.contactEmail?.trim() : undefined) ||
      agent.email.trim() ||
      undefined,
  };

  const hasBrokerContact = Boolean(
    brokerContact.name || brokerContact.phone || brokerContact.email,
  );

  return {
    brandColor,
    agencyLogoUrl,
    brokerContact: hasBrokerContact ? brokerContact : undefined,
  };
}

export function buildPropertyReelProps(input: {
  photoUrls: string[];
  transactionType: TransactionType;
  currency: CurrencyCode;
  address: string;
  size: string;
  rooms: string;
  property: PropertyDetails;
  rent: RentFormData;
  sale: SaleFormData;
  formCopy: FormCopy;
  priceOnRequestLabel: string;
  perMonthSuffix: string;
  headline?: string;
  agencyLogoUrl?: string;
  brandColor?: string;
  brokerContact?: ReelBrokerContact;
}): PropertyReelProps {
  const priceRaw =
    input.transactionType === "rent"
      ? input.rent.totalRent || input.rent.netColdRent
      : input.sale.purchasePrice;

  const formattedPrice = formatPriceAmount(
    priceRaw,
    input.currency,
    input.priceOnRequestLabel,
  );

  const price =
    input.transactionType === "rent" &&
    priceRaw.trim() &&
    formattedPrice !== input.priceOnRequestLabel
      ? `${formattedPrice}${input.perMonthSuffix}`
      : formattedPrice;

  const propertyType =
    input.property.propertyType !== ""
      ? propertyTypeLabel(input.property.propertyType, input.formCopy)
      : undefined;

  return {
    photos: input.photoUrls.slice(0, 5),
    price,
    size: formatReelSize(input.size),
    location: input.address.trim(),
    rooms: input.rooms.trim() || undefined,
    propertyType,
    headline: input.headline?.trim() || undefined,
    agencyLogoUrl: input.agencyLogoUrl,
    brandColor: input.brandColor ?? DEFAULT_BRAND_COLOR,
    brokerContact: input.brokerContact,
  };
}

/** Stable data URLs for Remotion export (blob URLs are preview-only). */
export async function photosToDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
