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
};
