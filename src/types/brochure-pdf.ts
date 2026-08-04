import type { CurrencyCode } from "@/lib/currency";
import type { TransactionType } from "@/types/listing";
import type { BrandFontFamily, PDFBrandingProps } from "@/types/branding";

export type BrochurePdfProps = {
  transactionType: TransactionType;
  transactionBadge: string;
  title: string;
  address: string;
  size: string;
  rooms: string;
  currency: CurrencyCode;
  priceOnRequestLabel: string;
  priceLabel: string;
  priceAmount: string;
  /** German rent breakdown (Miete) — populated when transactionType is "rent". */
  netColdRent?: string;
  utilityCharges?: string;
  totalRent?: string;
  securityDeposit?: string;
  /** DACH commission / provision text shown on page 4 (from sale.commissionTerms). */
  commission?: string;
  commissionLabel?: string;
  specsTable: { label: string; value: string }[];
  summary: string[];
  fullDescription: string;
  locationDescription: string;
  energyLines: { label: string; value: string }[];
  agent: {
    name: string;
    agency: string;
    phone: string;
    email: string;
    legalDisclaimer: string;
  };
  legalDisclaimerFallback: string;
  stagingDisclaimer?: string;
  photoDataUrls: string[];
  floorPlanDataUrl?: string;
  /** Static map preview for the location section (data URL). */
  mapDataUrl?: string;
  /** @deprecated Prefer primaryColor */
  brandColor?: string;
  primaryColor?: string;
  accentColor?: string;
  logoDataUrl?: string;
  avatarDataUrl?: string;
  fontFamily?: BrandFontFamily | string;
  showWatermark?: boolean;
  website?: string;
};

export type { PDFBrandingProps };
