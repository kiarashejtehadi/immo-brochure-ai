import type { TransactionType } from "@/types/listing";
import type { VoiceListingType, VoiceParseResult } from "@/types/voice-parse";
import {
  VOICE_AMENITY_KEYS,
  VOICE_FURNISHING_STATUSES,
  VOICE_PARKING_KEYS,
  VOICE_PARSE_MULTILINGUAL_INSTRUCTIONS,
  VOICE_PROPERTY_TYPES,
  normalizeVoiceAmenities,
  normalizeVoiceFurnishing,
  normalizeVoiceParkingOptions,
  normalizeVoicePropertyType,
} from "@/lib/voice/voice-parse-normalize";

export function parseNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseListingType(value: unknown): VoiceListingType | null {
  return value === "rent" || value === "sale" ? value : null;
}

export function parseNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function parseVoiceParseResult(raw: string): VoiceParseResult {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return {
    listingType: parseListingType(parsed.listingType),
    streetAddress: parseNullableString(parsed.streetAddress),
    postalCode: parseNullableString(parsed.postalCode),
    city: parseNullableString(parsed.city),
    size: parseNullableNumber(parsed.size),
    rooms: parseNullableNumber(parsed.rooms),
    floorLevel: parseNullableString(parsed.floorLevel),
    netRent: parseNullableNumber(parsed.netRent),
    utilityCharges: parseNullableNumber(parsed.utilityCharges),
    propertyType: normalizeVoicePropertyType(parsed.propertyType),
    furnishingStatus: normalizeVoiceFurnishing(parsed.furnishing),
    amenities: normalizeVoiceAmenities(parsed.amenities),
    parking: normalizeVoiceParkingOptions(parsed.parking),
  };
}

export const VOICE_PARSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    listingType: { type: ["string", "null"], enum: ["rent", "sale", null] },
    streetAddress: { type: ["string", "null"] },
    postalCode: { type: ["string", "null"] },
    city: { type: ["string", "null"] },
    size: { type: ["number", "null"] },
    rooms: { type: ["number", "null"] },
    floorLevel: { type: ["string", "null"] },
    netRent: { type: ["number", "null"] },
    utilityCharges: { type: ["number", "null"] },
    propertyType: {
      type: ["string", "null"],
      enum: [...VOICE_PROPERTY_TYPES, null],
    },
    furnishing: {
      type: ["string", "null"],
      enum: [...VOICE_FURNISHING_STATUSES, null],
    },
    amenities: {
      type: "array",
      items: { type: "string", enum: [...VOICE_AMENITY_KEYS] },
    },
    parking: {
      type: "array",
      items: { type: "string", enum: [...VOICE_PARKING_KEYS] },
    },
  },
  required: [
    "listingType",
    "streetAddress",
    "postalCode",
    "city",
    "size",
    "rooms",
    "floorLevel",
    "netRent",
    "utilityCharges",
    "propertyType",
    "furnishing",
    "amenities",
    "parking",
  ],
  additionalProperties: false,
} as const;

export const LISTING_TYPE_INSTRUCTIONS = `INSTRUCTIONS:
Determine whether the spoken input is describing a rental property or a property for sale.
- Return listingType: "rent" if the user mentions rent, leasing, utility costs, warm rent, or tenants.
- Return listingType: "sale" if the user mentions selling, purchase price, buying, or house sale.
- Default to the current active tab if ambiguous.`;

export const VOICE_PARSE_EXTRACTION_PROMPT = `Extract structured real estate listing details from the transcript and map them to the following keys:
- listingType: "rent" | "sale" | null
- streetAddress: string | null
- postalCode: string | null
- city: string | null
- size: number | null (square meters, no units)
- rooms: number | null
- floorLevel: string | null
- netRent: number | null (monthly net cold rent, no currency symbols)
- utilityCharges: number | null (monthly utilities, no currency symbols)
- propertyType: UPPERCASE enum or null (APARTMENT | HOUSE | COMMERCIAL | LAND | GARAGE)
- furnishing: UPPERCASE enum or null (FULLY_FURNISHED | PARTIALLY_FURNISHED | UNFURNISHED)
- amenities: string[] of UPPERCASE amenity keys (ELEVATOR | BALCONY | TERRACE | GARDEN | BASEMENT | FITTED_KITCHEN), or []
- parking: string[] of UPPERCASE parking keys (GARAGE | UNDERGROUND | CARPORT | OUTDOOR), or []`;

export const VOICE_PARSE_SYSTEM_PROMPT = `You extract structured real estate listing details from spoken transcripts.
Map values to the schema keys only when clearly stated or strongly implied.
Use null for any scalar field not mentioned.
Use [] for amenities and parking when not mentioned.
Return numeric fields (size, rooms, netRent, utilityCharges) as JSON numbers without units or currency symbols.
For floorLevel, preserve natural phrasing (e.g. "3rd floor", "EG", "ground floor") using professional real estate terminology.

${VOICE_PARSE_MULTILINGUAL_INSTRUCTIONS}

${LISTING_TYPE_INSTRUCTIONS}`;

export function parseCurrentListingType(value: unknown): TransactionType | null {
  return value === "rent" || value === "sale" ? value : null;
}

export function resolveVoiceListingType(
  parsed: VoiceListingType | null,
  currentListingType: TransactionType | null,
): VoiceListingType | null {
  if (parsed === "rent" || parsed === "sale") return parsed;
  return currentListingType;
}

export function finalizeVoiceParseResult(
  fields: VoiceParseResult,
  currentListingType: TransactionType | null,
): VoiceParseResult {
  return {
    ...fields,
    listingType: resolveVoiceListingType(fields.listingType, currentListingType),
  };
}

export function buildVoiceParseUserPrompt(
  transcript: string,
  currentListingType: TransactionType | null,
): string {
  const activeTab = currentListingType ?? "unknown";
  return `${VOICE_PARSE_EXTRACTION_PROMPT}

Current active tab: ${activeTab}

${LISTING_TYPE_INSTRUCTIONS}

Transcript:
${transcript}`;
}
