import type { FeatureKey } from "@/lib/i18n";
import type { FurnishingStatus, ParkingType, PropertyType } from "@/types/listing";

export const VOICE_PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "COMMERCIAL",
  "LAND",
  "GARAGE",
] as const;

export const VOICE_FURNISHING_STATUSES = [
  "FULLY_FURNISHED",
  "PARTIALLY_FURNISHED",
  "UNFURNISHED",
] as const;

export const VOICE_AMENITY_KEYS = [
  "ELEVATOR",
  "BALCONY",
  "TERRACE",
  "GARDEN",
  "BASEMENT",
  "FITTED_KITCHEN",
] as const;

export const VOICE_PARKING_KEYS = [
  "GARAGE",
  "UNDERGROUND",
  "CARPORT",
  "OUTDOOR",
] as const;

export type VoicePropertyTypeKey = (typeof VOICE_PROPERTY_TYPES)[number];
export type VoiceFurnishingKey = (typeof VOICE_FURNISHING_STATUSES)[number];
export type VoiceAmenityKey = (typeof VOICE_AMENITY_KEYS)[number];
export type VoiceParkingKey = (typeof VOICE_PARKING_KEYS)[number];

const PROPERTY_TYPE_MAP: Record<VoicePropertyTypeKey, PropertyType | null> = {
  APARTMENT: "apartment",
  HOUSE: "house",
  COMMERCIAL: "commercial",
  LAND: "land",
  GARAGE: null,
};

const FURNISHING_MAP: Record<VoiceFurnishingKey, FurnishingStatus> = {
  FULLY_FURNISHED: "fully_furnished",
  PARTIALLY_FURNISHED: "partially_furnished",
  UNFURNISHED: "unfurnished",
};

const AMENITY_MAP: Record<VoiceAmenityKey, FeatureKey> = {
  ELEVATOR: "Elevator",
  BALCONY: "Balcony Terrace",
  TERRACE: "Balcony Terrace",
  GARDEN: "Garden",
  BASEMENT: "Cellar",
  FITTED_KITCHEN: "Fitted Kitchen",
};

const PARKING_PRIORITY: Array<{ key: VoiceParkingKey; type: ParkingType }> = [
  { key: "UNDERGROUND", type: "underground" },
  { key: "GARAGE", type: "garage" },
  { key: "CARPORT", type: "outdoor" },
  { key: "OUTDOOR", type: "outdoor" },
];

function isEnumValue<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

export function parseUppercaseEnumArray<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<T>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const normalized = item.trim().toUpperCase();
    if (!normalized || !isEnumValue(allowed, normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
  }
  return [...seen];
}

export function normalizeVoicePropertyType(value: unknown): PropertyType | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (!isEnumValue(VOICE_PROPERTY_TYPES, normalized)) return null;
  return PROPERTY_TYPE_MAP[normalized];
}

export function normalizeVoiceFurnishing(value: unknown): FurnishingStatus | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (!isEnumValue(VOICE_FURNISHING_STATUSES, normalized)) return null;
  return FURNISHING_MAP[normalized];
}

export function normalizeVoiceAmenities(value: unknown): FeatureKey[] {
  const keys = parseUppercaseEnumArray(value, VOICE_AMENITY_KEYS);
  const features = new Set<FeatureKey>();
  for (const key of keys) {
    features.add(AMENITY_MAP[key]);
  }
  return [...features];
}

export function normalizeVoiceParkingOptions(value: unknown): ParkingType | null {
  const keys = parseUppercaseEnumArray(value, VOICE_PARKING_KEYS);
  if (keys.length === 0) return null;

  for (const { key, type } of PARKING_PRIORITY) {
    if (keys.includes(key)) return type;
  }

  return null;
}

export const VOICE_PARSE_MULTILINGUAL_INSTRUCTIONS = `MULTILINGUAL INPUT SUPPORT:
The audio transcript may be spoken in English, German, Italian, Spanish, French, Polish, or other languages.
Understand terms in any of these languages and map them to standardized UPPERCASE enum keys in the JSON output.

PROPERTY TYPE MAPPING (propertyType — return one value or null):
- APARTMENT / FLAT / WOHNUNG / APPARTAMENTO / APPARTEMENT / PISOS / MIESZKANIE -> "APARTMENT"
- HOUSE / HAUS / CASA / MAISON / DOM -> "HOUSE"
- COMMERCIAL / GEWERBE / COMMERCIALE / COMMERCIAL / COMERCIAL -> "COMMERCIAL"
- LAND / GRUNDSTÜCK / TERRENO / TERRAIN / DZIAŁKA -> "LAND"
- GARAGE / PARKING / STELLPLATZ / POSTO AUTO / GARAZ (as property type) -> "GARAGE"

FURNISHING MAPPING (furnishing — return one value or null):
- Fully Furnished / Möbliert / Arredato / Meublé / Amueblado / Umeblowane -> "FULLY_FURNISHED"
- Partially Furnished / Teilmöbliert / Parzialmente arredato / Partiellement meublé / Parcialmente amueblado -> "PARTIALLY_FURNISHED"
- Unfurnished / Unmöbliert / Non arredato / Non meublé / Sin amueblar -> "UNFURNISHED"

AMENITIES (amenities — return string[] of UPPERCASE keys, or [] if none mentioned):
- Elevator / Aufzug / Ascensore / Ascenseur / Ascensor / Winda -> "ELEVATOR"
- Balcony / Balkon / Balcone / Balcon / Balcón -> "BALCONY"
- Terrace / Terrasse / Terrazza / Taras -> "TERRACE"
- Garden / Garten / Giardino / Jardin / Jardín / Ogród -> "GARDEN"
- Basement / Cellar / Keller / Cantina / Cave / Sótano / Piwnica -> "BASEMENT"
- Fitted Kitchen / Einbauküche / Cucina arredata / Cuisine équipée / Cocina equipada -> "FITTED_KITCHEN"

PARKING OPTIONS (parking — return string[] of UPPERCASE keys, or [] if none mentioned):
- Garage / Garaje / Garaż -> "GARAGE"
- Underground / Tiefgarage / Garage sotterraneo / Parking souterrain / Estacionamiento subterráneo -> "UNDERGROUND"
- Carport -> "CARPORT"
- Outdoor Space / Stellplatz / Posto auto all'aperto / Parking extérieur -> "OUTDOOR"

OUTPUT RULES:
- amenities and parking MUST be JSON arrays (string[]), never a single combined string.
- All enum values MUST be UPPERCASE as shown above.
- Use null for propertyType and furnishing when not mentioned.
- Use [] for amenities and parking when not mentioned.`;
