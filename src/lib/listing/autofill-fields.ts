import type {
  EnergyFormData,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TransactionType,
} from "@/types/listing";
import type { FeatureKey } from "@/lib/i18n";
import type { VoiceParseResult } from "@/types/voice-parse";
import type { ListingImportCurrentState, ListingImportMergedState } from "@/lib/openimmo/apply-openimmo-import";
import { cn } from "@/lib/utils";

export type AutofillFieldKey =
  | "propertyType"
  | "streetAddress"
  | "houseNumber"
  | "postalCode"
  | "city"
  | "country"
  | "transactionType"
  | "size"
  | "rooms"
  | "bedrooms"
  | "bathrooms"
  | "floorLevel"
  | "netColdRent"
  | "utilityCharges"
  | "totalRent"
  | "securityDeposit"
  | "purchasePrice"
  | "hoaFee"
  | "energyCertificate"
  | "energyValue"
  | "energyClass"
  | "heatingSource"
  | "constructionYear"
  | "heatingInstallYear"
  | "condition"
  | "parking"
  | "parkingFee"
  | "furnishingStatus"
  | "features"
  | "agentName"
  | "agentEmail"
  | "agentPhone"
  | "agency"
  | "companyAddress"
  | "licenseId";

export function autofillHighlightClass(active: boolean): string {
  return cn(
    active &&
      "ring-2 ring-emerald-500/50 ring-offset-1 ring-offset-white transition-shadow duration-500 dark:ring-emerald-400/40 dark:ring-offset-zinc-900",
  );
}

function pushIfChanged<T>(
  fields: AutofillFieldKey[],
  key: AutofillFieldKey,
  before: T,
  after: T,
) {
  if (before !== after && String(after ?? "").trim() !== "") {
    fields.push(key);
  }
}

export function collectOpenImmoAutofillFields(
  before: ListingImportCurrentState,
  after: ListingImportMergedState,
): AutofillFieldKey[] {
  const fields: AutofillFieldKey[] = [];

  pushIfChanged(fields, "transactionType", before.transactionType, after.transactionType);
  pushIfChanged(fields, "size", before.size, after.size);
  pushIfChanged(fields, "rooms", before.rooms, after.rooms);

  const addressKeys: Array<[keyof ListingAddress, AutofillFieldKey]> = [
    ["streetAddress", "streetAddress"],
    ["houseNumber", "houseNumber"],
    ["postalCode", "postalCode"],
    ["city", "city"],
    ["country", "country"],
  ];
  for (const [key, fieldKey] of addressKeys) {
    pushIfChanged(fields, fieldKey, before.address[key], after.address[key]);
  }

  const propertyKeys: Array<[keyof PropertyDetails, AutofillFieldKey]> = [
    ["propertyType", "propertyType"],
    ["floorLevel", "floorLevel"],
    ["condition", "condition"],
    ["parking", "parking"],
    ["parkingFee", "parkingFee"],
  ];
  for (const [key, fieldKey] of propertyKeys) {
    pushIfChanged(fields, fieldKey, before.property[key], after.property[key]);
  }

  const rentKeys: Array<[keyof RentFormData, AutofillFieldKey]> = [
    ["netColdRent", "netColdRent"],
    ["utilityCharges", "utilityCharges"],
    ["totalRent", "totalRent"],
    ["securityDeposit", "securityDeposit"],
  ];
  for (const [key, fieldKey] of rentKeys) {
    pushIfChanged(fields, fieldKey, before.rent[key], after.rent[key]);
  }

  const saleKeys: Array<[keyof SaleFormData, AutofillFieldKey]> = [
    ["purchasePrice", "purchasePrice"],
    ["hoaFee", "hoaFee"],
  ];
  for (const [key, fieldKey] of saleKeys) {
    pushIfChanged(fields, fieldKey, before.sale[key], after.sale[key]);
  }

  const energyKeys: Array<[keyof EnergyFormData, AutofillFieldKey]> = [
    ["certificateType", "energyCertificate"],
    ["energyValue", "energyValue"],
    ["energyClass", "energyClass"],
    ["heatingSource", "heatingSource"],
    ["constructionYear", "constructionYear"],
    ["heatingInstallYear", "heatingInstallYear"],
  ];
  for (const [key, fieldKey] of energyKeys) {
    pushIfChanged(fields, fieldKey, before.energy[key], after.energy[key]);
  }

  if (
    after.features.length > before.features.length ||
    after.features.some((f) => !before.features.includes(f))
  ) {
    fields.push("features");
  }

  pushIfChanged(fields, "agentName", before.agent.name, after.agent.name);
  pushIfChanged(fields, "agency", before.agent.agency, after.agent.agency);
  pushIfChanged(fields, "agentPhone", before.agent.phone, after.agent.phone);
  pushIfChanged(fields, "agentEmail", before.agent.email, after.agent.email);
  pushIfChanged(fields, "companyAddress", before.agent.companyAddress, after.agent.companyAddress);
  pushIfChanged(fields, "licenseId", before.agent.licenseId, after.agent.licenseId);

  return fields;
}

export function collectVoiceAutofillFields(
  parsed: VoiceParseResult,
  currentTransactionType: TransactionType,
): AutofillFieldKey[] {
  const fields: AutofillFieldKey[] = [];

  if (parsed.listingType && parsed.listingType !== currentTransactionType) {
    fields.push("transactionType");
  }

  const activeType = parsed.listingType ?? currentTransactionType;

  if (parsed.streetAddress?.trim()) fields.push("streetAddress");
  if (parsed.postalCode?.trim()) fields.push("postalCode");
  if (parsed.city?.trim()) fields.push("city");
  if (parsed.size != null) fields.push("size");
  if (parsed.rooms != null) fields.push("rooms");
  if (parsed.floorLevel?.trim()) fields.push("floorLevel");
  if (parsed.propertyType) fields.push("propertyType");
  if (parsed.furnishingStatus) fields.push("furnishingStatus");
  if (parsed.parking) fields.push("parking");
  if (parsed.amenities.length > 0) fields.push("features");

  if (activeType === "rent") {
    if (parsed.netRent != null) fields.push("netColdRent");
    if (parsed.utilityCharges != null) fields.push("utilityCharges");
  }

  return fields;
}

export function mergeAutofillFields(
  existing: Set<AutofillFieldKey>,
  incoming: AutofillFieldKey[],
): Set<AutofillFieldKey> {
  const next = new Set(existing);
  for (const key of incoming) next.add(key);
  return next;
}
