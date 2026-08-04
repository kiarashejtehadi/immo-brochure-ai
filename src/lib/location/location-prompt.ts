import type { OutputLanguage } from "@/lib/i18n";
import type { ListingAddress } from "@/types/listing";
import type { LocationEnrichment, NearbyLandmark, NearbyPoi } from "@/types/location-poi";
import {
  distanceFormattingRules,
  formatDistanceForLanguage,
} from "@/lib/location/distance-format";

export type LocationContextPayload = {
  nearbyLandmarks: {
    name: string;
    kind: string;
    distanceMeters: number;
    walkingMinutes: number;
    proximityText: string;
    /** @deprecated Prefer proximityText — kept for backward compatibility in prompts. */
    proximity: string;
    subtype?: string;
  }[];
  districtContext: string;
  nearbyTransit: string;
  parksAndRecreation: string;
  shoppingAndDining: string;
  highwayAirportConnectivity: string;
  riversAndWater: string;
  culturalLandmarks: string;
};

function formatPoiList(items: NearbyPoi[], outputLanguage: OutputLanguage): string {
  if (items.length === 0) return "None verified within search radius";
  return items
    .map((poi) => {
      const { text, minutes } = formatDistanceForLanguage(poi.distanceMeters, outputLanguage);
      const subtype = poi.subtype ? ` (${poi.subtype})` : "";
      return `${poi.name}${subtype} — ${text} [${minutes} min walk]`;
    })
    .join("; ");
}

function formatLandmarksForPrompt(
  landmarks: NearbyLandmark[],
  outputLanguage: OutputLanguage,
): string {
  if (landmarks.length === 0) return "[]";
  return JSON.stringify(
    landmarks.map((landmark) => {
      const { text, minutes } = formatDistanceForLanguage(
        landmark.distanceMeters,
        outputLanguage,
      );
      return {
        name: landmark.name,
        kind: landmark.kind,
        distanceMeters: Math.round(landmark.distanceMeters),
        walkingMinutes: minutes,
        proximityText: text,
        proximity: text,
        subtype: landmark.subtype,
      };
    }),
    null,
    2,
  );
}

function mapLandmarkToPayload(
  landmark: NearbyLandmark,
  outputLanguage: OutputLanguage,
): LocationContextPayload["nearbyLandmarks"][number] {
  const { text, minutes } = formatDistanceForLanguage(
    landmark.distanceMeters,
    outputLanguage,
  );
  return {
    name: landmark.name,
    kind: landmark.kind,
    distanceMeters: Math.round(landmark.distanceMeters),
    walkingMinutes: minutes,
    proximityText: text,
    proximity: text,
    subtype: landmark.subtype,
  };
}

export function buildLocationContextPayload(
  address: ListingAddress,
  enrichment: LocationEnrichment | null,
  outputLanguage: OutputLanguage,
): LocationContextPayload {
  if (!enrichment) {
    const districtContext = [address.postalCode.trim(), address.city.trim()]
      .filter(Boolean)
      .join(" ");
    return {
      nearbyLandmarks: [],
      districtContext,
      nearbyTransit: "None verified within search radius",
      parksAndRecreation: "None verified within search radius",
      shoppingAndDining: "None verified within search radius",
      highwayAirportConnectivity: "None verified within search radius",
      riversAndWater: "None verified within search radius",
      culturalLandmarks: "None verified within search radius",
    };
  }

  return {
    nearbyLandmarks: enrichment.nearbyLandmarks.map((landmark) =>
      mapLandmarkToPayload(landmark, outputLanguage),
    ),
    districtContext: enrichment.districtContext,
    nearbyTransit: formatPoiList(enrichment.transit, outputLanguage),
    parksAndRecreation: formatPoiList(enrichment.parks, outputLanguage),
    shoppingAndDining: formatPoiList(enrichment.shopping, outputLanguage),
    highwayAirportConnectivity: formatPoiList(enrichment.connectivity, outputLanguage),
    riversAndWater: formatPoiList(enrichment.water, outputLanguage),
    culturalLandmarks: formatPoiList(enrichment.culture, outputLanguage),
  };
}

function landmarkMandateRule(outputLanguage: OutputLanguage): string {
  const germanHint =
    outputLanguage === "German"
      ? " When writing in German, weave landmarks in naturally (e.g. 'in unmittelbarer Nähe zum Schlosspark Charlottenburg' or 'nur wenige Gehminuten von der U-Bahn Richard-Wagner-Platz')."
      : "";

  return `LANDMARK NAMING RULE (MANDATORY):
You MUST explicitly name the top 2-3 specific real-world landmarks provided in the nearbyLandmarks array in the generated neighborhood text.
For EACH named landmark you mention, you MUST include its pre-computed proximityText (and walkingMinutes where natural) — e.g. "Schlosspark Charlottenburg (ca. 5 Gehminuten)" or "U-Bahn Richard-Wagner-Platz, ca. 3 Gehminuten entfernt".
Highlight proximity to major parks, bodies of water, or famous monuments using ONLY the provided proximityText values — do not recalculate or round differently.
Only use landmark names that appear in nearbyLandmarks or the verified POI lists below; do not invent additional named places.${germanHint}`;
}

function fallbackDistrictRule(districtContext: string): string {
  if (!districtContext.trim()) {
    return `FALLBACK: No hyper-local landmarks were verified. Write conservatively about the city/area without inventing specific transit stops, distances, or named amenities.`;
  }

  return `FALLBACK — DISTRICT CONTEXT:
Hyper-local POI data was limited. Use the district context "${districtContext}" to reference well-known district highlights (e.g. Charlottenburg → Schloss Charlottenburg, Schlosspark Charlottenburg, Ku'damm, Spreeufer) at a general level.
Do NOT invent precise walking distances unless they appear in nearbyLandmarks or verified POI lists.`;
}

export function buildLocationPromptInstructions(
  address: ListingAddress,
  enrichment: LocationEnrichment | null,
  outputLanguage: OutputLanguage,
): string {
  const locationLine = [address.streetAddress.trim(), address.city.trim()]
    .filter(Boolean)
    .join(", ");
  const locationContext = buildLocationContextPayload(
    address,
    enrichment,
    outputLanguage,
  );

  if (!enrichment) {
    return `LOCATION & NEIGHBORHOOD GENERATION INSTRUCTIONS:
Verified POI data could not be retrieved for ${locationLine || "this property"}.
locationContext (JSON):
${JSON.stringify(locationContext, null, 2)}

${fallbackDistrictRule(locationContext.districtContext)}
Write a conservative locationDescription without inventing specific transit stops, distances, parks, shops, or schools. Mention the city/area only at a high level.`;
  }

  const hasLandmarks = enrichment.nearbyLandmarks.length > 0;
  const landmarkSection = hasLandmarks
    ? landmarkMandateRule(outputLanguage)
    : fallbackDistrictRule(enrichment.districtContext);

  return `LOCATION & NEIGHBORHOOD GENERATION INSTRUCTIONS:
You are provided with verified location data for the property at ${locationLine}.

nearbyLandmarks (use these exact names and proximityText — top 2-3 MUST appear in locationDescription):
${formatLandmarksForPrompt(enrichment.nearbyLandmarks, outputLanguage)}

locationContext (JSON — includes nearbyLandmarks for the model payload):
${JSON.stringify(locationContext, null, 2)}

Verified POI categories (distances pre-normalized — use proximity phrasing as shown):
- Nearby Transit: ${formatPoiList(enrichment.transit, outputLanguage)}
- Parks/Recreation: ${formatPoiList(enrichment.parks, outputLanguage)}
- Rivers/Water: ${formatPoiList(enrichment.water, outputLanguage)}
- Cultural Landmarks: ${formatPoiList(enrichment.culture, outputLanguage)}
- Shopping/Dining: ${formatPoiList(enrichment.shopping, outputLanguage)}
- Highway/Airport Connectivity: ${formatPoiList(enrichment.connectivity, outputLanguage)}

${landmarkSection}

Write a compelling, professional 'Location & Neighborhood' section in the locationDescription field. STRICTLY restrict all claims about transit distances, parks, and nearby amenities to the verified POI facts and nearbyLandmarks listed above. Do NOT invent or assume any schools, shops, or facilities that are not present in the verified location data.

${distanceFormattingRules(outputLanguage)}`;
}
