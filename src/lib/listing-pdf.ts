import type { FormCopy } from "@/lib/i18n-form";
import type { UiCopy } from "@/lib/i18n";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import type {
  EnergyFormData,
  GenerateRequestPayload,
  GenerateResult,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TransactionType,
} from "@/types/listing";
import type { CurrencyCode } from "@/lib/currency";
import type { FeatureKey, OutputLanguage, ToneKey } from "@/lib/i18n";
import { propertyOverviewRows } from "@/lib/listing-property-labels";

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
  address: string;
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
  address: string;
  size: string;
  rooms: string;
  property: PropertyDetails;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
  agent: GenerateRequestPayload["agent"];
  result: GenerateResult;
  branding?: {
    brandColor?: string;
    logoDataUrl?: string;
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

  const specsTable = [
    ...propertyOverviewRows(input.property, input.form, input.currency),
    { label: input.ui.size, value: input.size.trim() ? `${input.size} m²` : "" },
    { label: input.ui.rooms, value: input.rooms },
    ...pricingRows,
  ];

  const energyLines = [
    { label: input.form.certificateType, value: input.energy.certificateType },
    ...(input.energy.certificateType !== "na"
      ? [
          { label: input.form.energyValue, value: input.energy.energyValue },
          { label: input.form.energyClass, value: input.energy.energyClass },
        ]
      : []),
    { label: input.form.heatingSource, value: input.energy.heatingSource },
    { label: input.form.constructionYear, value: input.energy.constructionYear },
    {
      label: input.form.heatingInstallYear,
      value: input.energy.heatingInstallYear,
    },
  ];

  return {
    transactionType: input.transactionType,
    transactionBadge: badge,
    title: input.result.title,
    address: input.address,
    size: input.size,
    rooms: input.rooms,
    currency: input.currency,
    priceOnRequestLabel: input.ui.priceOnRequest,
    priceLabel,
    priceAmount,
    specsTable,
    summary: input.result.summary,
    fullDescription: input.result.fullDescription,
    locationDescription: input.result.locationDescription,
    energyLines,
    agent: input.agent,
    legalDisclaimerFallback: input.form.defaultLegalDisclaimer,
    brandColor: input.branding?.brandColor,
    logoDataUrl: input.branding?.logoDataUrl,
    website: input.branding?.website,
    showWatermark: input.branding?.showWatermark,
  };
}
