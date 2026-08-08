import type { FeatureKey } from "@/lib/i18n";
import type { FurnishingStatus, ParkingType, PropertyType } from "@/types/listing";

export type VoiceListingType = "rent" | "sale";

export type VoiceParseResult = {
  listingType: VoiceListingType | null;
  streetAddress: string | null;
  postalCode: string | null;
  city: string | null;
  size: number | null;
  rooms: number | null;
  floorLevel: string | null;
  netRent: number | null;
  utilityCharges: number | null;
  propertyType: PropertyType | null;
  furnishingStatus: FurnishingStatus | null;
  amenities: FeatureKey[];
  parking: ParkingType | null;
};
