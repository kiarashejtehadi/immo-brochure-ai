import type { CurrencyCode } from "@/lib/currency";
import type { FeatureKey, OutputLanguage, ToneKey } from "@/lib/i18n";

export type TransactionType = "rent" | "sale";

export type TargetMarket = "dach" | "global";

export type UserRole = "agent" | "private_seller";

export type CommissionPreset = "commission_free" | "buyer_commission";

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

export type FurnishingStatus =
  | "unfurnished"
  | "partially_furnished"
  | "fully_furnished";

export type PropertyDetails = {
  propertyType: PropertyType | "";
  floorLevel: string;
  parking: ParkingType | "";
  parkingFee: string;
  condition: PropertyCondition | "";
  furnishingStatus: FurnishingStatus;
  isStagedOrModel: boolean;
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
  | "solar"
  | "wood_pellets";

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
  companyAddress: string;
  phone: string;
  email: string;
  licenseId: string;
  legalDisclaimer: string;
};

export type ListingAddress = {
  /** Street name without house number (e.g. "Otto-Suhr-Allee"). */
  streetAddress: string;
  houseNumber: string;
  /** @deprecated Legacy OpenImmo import only — not shown in Section 1 UI. */
  unitNumber: string;
  postalCode: string;
  city: string;
  country: string;
  /** When true, hide house number in AI copy and PDF — street name stays visible. */
  hideExactHouseNumber: boolean;
};

export type AddressDataPayload = {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  hideExactHouseNumber: boolean;
};

export type GenerateRequestPayload = {
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
  agent: AgentFormData;
  images: { base64: string; mimeType: string }[];
  floorPlan?: { base64: string; mimeType: string };
  generationNotes?: string;
};

export type SocialCaptions = {
  instagram: string;
  linkedin: string;
  facebook: string;
};

export type PreviewCustomSection = {
  id: string;
  title: string;
  body: string;
};

export type GenerateResult = {
  title: string;
  summary: string[];
  fullDescription: string;
  locationDescription: string;
  socialCaptions: SocialCaptions;
  customSections?: PreviewCustomSection[];
  /** Set when billing consumed a trial-only credit — PDF should be watermarked. */
  watermarkPdf?: boolean;
};

export type GenerateLocationMeta = {
  locationCoords: { lat: number; lon: number } | null;
  mapDataUrl: string | null;
};

export type GenerateApiResponse = GenerateResult &
  GenerateLocationMeta & {
    watermarkPdf?: boolean;
    error?: string;
    code?: string;
  };
