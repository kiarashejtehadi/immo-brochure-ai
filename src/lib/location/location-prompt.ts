import type { ListingAddress } from "@/types/listing";
import type { LocationEnrichment, NearbyPoi } from "@/types/location-poi";

function formatPoiList(items: NearbyPoi[]): string {
  if (items.length === 0) return "None verified within search radius";
  return items
    .map((poi) => {
      const distance = `${Math.round(poi.distanceMeters)} m`;
      const subtype = poi.subtype ? ` (${poi.subtype})` : "";
      return `${poi.name}${subtype} — ~${distance}`;
    })
    .join("; ");
}

export function buildLocationPromptInstructions(
  address: ListingAddress,
  enrichment: LocationEnrichment | null,
): string {
  const locationLine = [address.streetAddress.trim(), address.city.trim()]
    .filter(Boolean)
    .join(", ");

  if (!enrichment) {
    return `LOCATION & NEIGHBORHOOD GENERATION INSTRUCTIONS:
Verified POI data could not be retrieved for ${locationLine || "this property"}.
Write a conservative locationDescription without inventing specific transit stops, distances, parks, shops, or schools. Mention the city/area only at a high level.`;
  }

  return `LOCATION & NEIGHBORHOOD GENERATION INSTRUCTIONS:
You are provided with verified location data for the property at ${locationLine}:
- Nearby Transit: ${formatPoiList(enrichment.transit)}
- Parks/Recreation: ${formatPoiList(enrichment.parks)}
- Shopping/Dining: ${formatPoiList(enrichment.shopping)}
- Highway/Airport Connectivity: ${formatPoiList(enrichment.connectivity)}

Write a compelling, professional 'Location & Neighborhood' section in the locationDescription field. STRICTLY restrict all claims about transit distances, parks, and nearby amenities to the verified POI facts listed above. Do NOT invent or assume any schools, shops, or facilities that are not present in the verified location data.`;
}
