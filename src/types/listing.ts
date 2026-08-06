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
  /** Unit / floor detail (e.g. "3rd Floor", "Wohnung 12", "Hinterhaus"). */
  unitNumber: string;
  postalCode: string;
  city: string;
  country: string;
  /** When true, mask street/house/unit in AI copy and PDF — full address still used for geocoding. */
  hideExactAddress: boolean;
};

export type AddressDataPayload = {
  street: string;
  houseNumber: string;
  unitNumber: string;
  zipCode: string;
  city: string;
  hideExactAddress: boolean;
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
  /** Set when billing consumed a trial-only credit — PDF should be watermarked. */
  watermarkPdf?: boolean;
};
