import type { VoiceListingType, VoiceParseResult } from "@/types/voice-parse";

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
  ],
  additionalProperties: false,
} as const;

export const VOICE_PARSE_EXTRACTION_PROMPT = `Extract structured real estate listing details from the transcript and map them to the following keys:
- listingType: "rent" | "sale" | null — infer from phrases like "for sale", "selling", "buy" (sale) vs "for rent", "lease", "tenant" (rent); null if unclear
- streetAddress: string | null
- postalCode: string | null
- city: string | null
- size: number | null (square meters, no units)
- rooms: number | null
- floorLevel: string | null
- netRent: number | null (monthly net cold rent, no currency symbols)
- utilityCharges: number | null (monthly utilities, no currency symbols)`;

export const VOICE_PARSE_SYSTEM_PROMPT = `You extract structured real estate listing details from spoken transcripts.
Map values to the schema keys only when clearly stated or strongly implied.
Use null for any field not mentioned.
Return numeric fields (size, rooms, netRent, utilityCharges) as JSON numbers without units or currency symbols.
For floorLevel, preserve natural phrasing (e.g. "3rd floor", "EG", "ground floor") using professional real estate terminology.
Infer listingType from intent: sale phrases include "for sale", "selling", "buy", "purchase price"; rent phrases include "for rent", "lease", "tenant", "monthly rent".`;
