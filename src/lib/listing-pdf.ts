import type { FormCopy } from "@/lib/i18n-form";
import type { UiCopy } from "@/lib/i18n";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import type {
  EnergyFormData,
  GenerateRequestPayload,
  GenerateResult,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TransactionType,
} from "@/types/listing";
import type { CurrencyCode } from "@/lib/currency";
import type { FeatureKey, OutputLanguage, ToneKey } from "@/lib/i18n";
import { propertyOverviewRows, certificateTypeLabel, heatingSourceLabel } from "@/lib/listing-property-labels";
import { filterPdfTableRows } from "@/lib/pdf-table-rows";
import { getFurnishingDisclaimerText } from "@/lib/furnishing-guardrail";
import { formatPublicListingAddress } from "@/lib/location/format-address";

/** Strip EPC value/class when no certificate applies. */
export function sanitizeEnergyForPayload(energy: EnergyFormData): EnergyFormData {
  if (energy.certificateType === "na") {
    return { ...energy, energyValue: "", energyClass: "" };
  }
  return energy;
}

export function buildGeneratePayload(input: {
  transactionType: TransactionType;
  targetLanguage: OutputLanguage;
  currency: CurrencyCode;
  address: ListingAddress;
  size: string;
  rooms: string;
  property: PropertyDetails;
  features: FeatureKey[];
  tone: ToneKey;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
  agent: GenerateRequestPayload["agent"];
  images: { base64: string; mimeType: string }[];
  floorPlan?: { base64: string; mimeType: string };
}): GenerateRequestPayload {
  return { ...input, energy: sanitizeEnergyForPayload(input.energy) };
}

export function buildBrochurePdfProps(input: {
  transactionType: TransactionType;
  form: FormCopy;
  ui: UiCopy;
  currency: CurrencyCode;
  address: ListingAddress;
  size: string;
  rooms: string;
  property: PropertyDetails;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
  agent: GenerateRequestPayload["agent"];
  result: GenerateResult;
  photoCount?: number;
  branding?: {
    brandColor?: string;
    primaryColor?: string;
    accentColor?: string;
    logoDataUrl?: string;
    avatarDataUrl?: string;
    fontFamily?: string;
    website?: string;
    showWatermark?: boolean;
  };
}): Omit<BrochurePdfProps, "photoDataUrls" | "floorPlanDataUrl"> {
  const badge =
    input.transactionType === "rent"
      ? input.form.transactionBadgeRent
      : input.form.transactionBadgeSale;

  const priceLabel =
    input.transactionType === "rent" ? input.form.totalRent : input.form.purchasePrice;
  const priceAmount =
    input.transactionType === "rent"
      ? input.rent.totalRent || input.rent.netColdRent
      : input.sale.purchasePrice;

  const pricingRows =
    input.transactionType === "rent"
      ? [
          { label: input.form.netColdRent, value: input.rent.netColdRent },
          { label: input.form.utilityCharges, value: input.rent.utilityCharges },
          { label: input.form.totalRent, value: input.rent.totalRent },
          { label: input.form.securityDeposit, value: input.rent.securityDeposit },
        ]
      : [
          { label: input.form.purchasePrice, value: input.sale.purchasePrice },
          { label: input.form.hoaFee, value: input.sale.hoaFee },
          { label: input.form.rentalYield, value: input.sale.rentalYield },
        ];

  const specsTable = filterPdfTableRows([
    ...propertyOverviewRows(input.property, input.form, input.currency),
    { label: input.ui.size, value: input.size.trim() ? `${input.size} m²` : "" },
    { label: input.ui.rooms, value: input.rooms.trim() },
    ...pricingRows.map((row) => ({
      label: row.label,
      value: row.value.trim(),
    })),
  ]);

  const energyLines = filterPdfTableRows([
    {
      label: input.form.certificateType,
      value: certificateTypeLabel(input.energy.certificateType, input.form),
    },
    ...(input.energy.certificateType !== "na"
      ? [
          { label: input.form.energyValue, value: input.energy.energyValue.trim() },
          { label: input.form.energyClass, value: input.energy.energyClass.trim() },
        ]
      : []),
    {
      label: input.form.heatingSource,
      value: heatingSourceLabel(input.energy.heatingSource, input.form),
    },
    {
      label: input.form.constructionYear,
      value: input.energy.constructionYear.trim(),
    },
    {
      label: input.form.heatingInstallYear,
      value: input.energy.heatingInstallYear.trim(),
    },
  ]);

  return {
    transactionType: input.transactionType,
    transactionBadge: badge,
    title: input.result.title,
    address: formatPublicListingAddress(input.address),
    size: input.size,
    rooms: input.rooms,
    currency: input.currency,
    priceOnRequestLabel: input.ui.priceOnRequest,
    priceLabel,
    priceAmount,
    ...(input.transactionType === "rent"
      ? {
          netColdRent: input.rent.netColdRent.trim(),
          utilityCharges: input.rent.utilityCharges.trim(),
          totalRent: input.rent.totalRent.trim(),
          securityDeposit: input.rent.securityDeposit.trim(),
        }
      : {}),
    specsTable,
    summary: input.result.summary,
    fullDescription: input.result.fullDescription,
    locationDescription: input.result.locationDescription,
    energyLines,
    agent: input.agent,
    legalDisclaimerFallback: input.form.defaultLegalDisclaimer,
    stagingDisclaimer: getFurnishingDisclaimerText(
      input.property.furnishingStatus,
      input.photoCount ?? 0,
      {
        stagingDisclaimerUnfurnished: input.form.stagingDisclaimerUnfurnished,
        stagingDisclaimerPartially: input.form.stagingDisclaimerPartially,
      },
    ),
    commission: input.sale.commissionTerms.trim(),
    commissionLabel: input.form.commissionLabel,
    brandColor: input.branding?.primaryColor ?? input.branding?.brandColor,
    primaryColor: input.branding?.primaryColor ?? input.branding?.brandColor,
    accentColor: input.branding?.accentColor,
    logoDataUrl: input.branding?.logoDataUrl,
    avatarDataUrl: input.branding?.avatarDataUrl,
    fontFamily: input.branding?.fontFamily,
    website: input.branding?.website,
    showWatermark: input.branding?.showWatermark,
  };
}
