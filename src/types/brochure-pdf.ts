import type { CurrencyCode } from "@/lib/currency";
import type { TransactionType } from "@/types/listing";

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
  brandColor?: string;
  logoDataUrl?: string;
  showWatermark?: boolean;
  website?: string;
};
