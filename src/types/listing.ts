import type { CurrencyCode } from "@/lib/currency";
import type { FeatureKey, OutputLanguage, ToneKey } from "@/lib/i18n";

export type TransactionType = "rent" | "sale";

export type PropertyType =
  | "apartment"
  | "house"
  | "penthouse"
  | "commercial"
  | "land";

export type ParkingType = "none" | "outdoor" | "garage" | "underground";

export type PropertyCondition =
  | "first_occupancy"
  | "modernized"
  | "well_maintained"
  | "needs_renovation";

export type PropertyDetails = {
  propertyType: PropertyType | "";
  floorLevel: string;
  parking: ParkingType | "";
  parkingFee: string;
  condition: PropertyCondition | "";
};

export type EnergyCertificateType = "consumption" | "demand" | "na";

export type EnergyClass =
  | "A+"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H";

export type HeatingSource =
  | "heat_pump"
  | "district_heating"
  | "gas"
  | "oil"
  | "electricity"
  | "solar";

export type RentFormData = {
  netColdRent: string;
  utilityCharges: string;
  totalRent: string;
  securityDeposit: string;
  availableFrom: string;
  minimumLeaseTerm: string;
  petPolicy: string;
};

export type SaleFormData = {
  purchasePrice: string;
  hoaFee: string;
  rentalYield: string;
  commissionTerms: string;
};

export type EnergyFormData = {
  certificateType: EnergyCertificateType;
  energyValue: string;
  energyClass: EnergyClass | "";
  heatingSource: HeatingSource | "";
  constructionYear: string;
  heatingInstallYear: string;
};

export type AgentFormData = {
  name: string;
  agency: string;
  phone: string;
  email: string;
  legalDisclaimer: string;
};

export type GenerateRequestPayload = {
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
  agent: AgentFormData;
  images: { base64: string; mimeType: string }[];
  floorPlan?: { base64: string; mimeType: string };
};

export type SocialCaptions = {
  instagram: string;
  linkedin: string;
  facebook: string;
};

export type GenerateResult = {
  title: string;
  summary: string[];
  fullDescription: string;
  locationDescription: string;
  socialCaptions: SocialCaptions;
  /** Set when billing consumed a trial credit — PDF should be watermarked unless Pro. */
  watermarkPdf?: boolean;
};
