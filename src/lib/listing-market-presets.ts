import type { OutputLanguage, FeatureKey } from "@/lib/i18n";
import type { CurrencyCode } from "@/lib/currency";
import type {
  AgentFormData,
  CommissionPreset,
  EnergyFormData,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TargetMarket,
  TransactionType,
  UserRole,
} from "@/types/listing";

export const DACH_LEGAL_DISCLAIMER =
  "Alle Angaben sind ohne Gewähr und basieren ausschließlich auf Informationen, die uns vom Auftraggeber übermittelt wurden. Wir übernehmen keine Gewähr für die Vollständigkeit, Richtigkeit und Aktualität dieser Angaben.";

export const COMMISSION_PRESET_LABELS: Record<
  CommissionPreset,
  { en: string; de: string }
> = {
  commission_free: {
    en: "Commission free (Provisionsfrei)",
    de: "Provisionsfrei",
  },
  buyer_commission: {
    en: "Buyer commission (e.g. 3.57% incl. VAT)",
    de: "Käuferprovision (z. B. 3,57 % inkl. MwSt.)",
  },
};

export function commissionTermsFromPreset(
  preset: CommissionPreset,
  transactionType: TransactionType,
): string {
  if (preset === "commission_free") {
    return transactionType === "rent"
      ? "Provisionsfrei für Mieter"
      : "Provisionsfrei";
  }
  return transactionType === "rent"
    ? "Provision trägt Vermieter"
    : "Käuferprovision 3,57 % inkl. MwSt.";
}

export function parseCommissionPreset(
  value: string,
  transactionType: TransactionType = "sale",
): CommissionPreset {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("provisionsfrei") || normalized.includes("commission free")) {
    return "commission_free";
  }
  if (
    transactionType === "rent" &&
    (normalized.includes("vermieter") ||
      normalized.includes("landlord") ||
      normalized.includes("provision trägt"))
  ) {
    return "buyer_commission";
  }
  return "buyer_commission";
}

export function shouldShowDachCommissionControls(
  transactionType: TransactionType,
  userRole: UserRole,
): boolean {
  if (transactionType === "sale") return true;
  return userRole === "agent";
}

export function privateLandlordRentCommissionTerms(): string {
  return commissionTermsFromPreset("commission_free", "rent");
}

/** Sum net cold rent + utilities; empty parts treated as zero when the other is set. */
export function calculateWarmRent(netColdRent: string, utilityCharges: string): string {
  const net = netColdRent.trim();
  const utilities = utilityCharges.trim();
  if (!net && !utilities) return "";

  const netNum = net ? Number(net) : 0;
  const utilNum = utilities ? Number(utilities) : 0;
  if (Number.isNaN(netNum) || Number.isNaN(utilNum)) return "";
  const sum = netNum + utilNum;
  if (!Number.isFinite(sum)) return "";
  return String(sum % 1 === 0 ? sum : Math.round(sum * 100) / 100);
}

export type DachMarketPresetApply = {
  currency: CurrencyCode;
  targetLanguage: OutputLanguage;
};

export function dachMarketPresetApply(): DachMarketPresetApply {
  return {
    currency: "EUR",
    targetLanguage: "German",
  };
}

export type DachDemoListingPreset = {
  transactionType: TransactionType;
  targetMarket: TargetMarket;
  userRole: UserRole;
  commissionPreset: CommissionPreset;
  address: ListingAddress;
  size: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  property: PropertyDetails;
  rent: RentFormData;
  sale: SaleFormData;
  energy: EnergyFormData;
  agent: AgentFormData;
  features: FeatureKey[];
};

export function buildDachDemoListingPreset(): DachDemoListingPreset {
  return {
    transactionType: "rent",
    targetMarket: "dach",
    userRole: "agent",
    commissionPreset: "commission_free",
    address: {
      streetAddress: "Heubnerweg 20",
      postalCode: "14059",
      city: "Berlin",
      country: "Germany",
    },
    size: "85",
    rooms: "3",
    bedrooms: "2",
    bathrooms: "1",
    property: {
      propertyType: "apartment",
      floorLevel: "3. OG",
      parking: "underground",
      parkingFee: "",
      condition: "modernized",
      furnishingStatus: "unfurnished",
      isStagedOrModel: false,
    },
    rent: {
      netColdRent: "1800",
      utilityCharges: "350",
      totalRent: "2150",
      securityDeposit: "3 Monatskaltmieten",
      availableFrom: "sofort",
      minimumLeaseTerm: "12 Monate",
      petPolicy: "nach Vereinbarung",
    },
    sale: {
      purchasePrice: "",
      hoaFee: "",
      rentalYield: "",
      commissionTerms: commissionTermsFromPreset("commission_free", "rent"),
    },
    energy: {
      certificateType: "demand",
      energyValue: "42",
      energyClass: "A+",
      heatingSource: "heat_pump",
      constructionYear: "2021",
      heatingInstallYear: "2021",
    },
    agent: {
      name: "Max Mustermann",
      agency: "Muster Immobilien GmbH",
      companyAddress: "Friedrichstraße 123, 10117 Berlin",
      phone: "+49 30 12345678",
      email: "max.mustermann@muster-immo.de",
      licenseId: "§ 34c GewO — 12345/BER",
      legalDisclaimer: DACH_LEGAL_DISCLAIMER,
    },
    features: ["Balcony Terrace", "Fitted Kitchen", "Elevator", "Cellar"],
  };
}
