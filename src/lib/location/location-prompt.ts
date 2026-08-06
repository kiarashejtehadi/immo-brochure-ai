import type { OutputLanguage } from "@/lib/i18n";
import type { ListingAddress } from "@/types/listing";
import type { LocationEnrichment, NearbyLandmark, NearbyPoi } from "@/types/location-poi";
import {
  buildStreetLine,
  hasStreetLevelInput,
  resolvePublicAreaLabel,
} from "@/lib/location/format-address";
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
  /** Optional DACH district connectivity hint derived from postal code / city. */
  dachConnectivityHint?: string;
  nearbyTransit: string;
  parksAndRecreation: string;
  shoppingAndDining: string;
  highwayAirportConnectivity: string;
  riversAndWater: string;
  culturalLandmarks: string;
};

const EMPTY_POI_LABEL = "";

function formatPoiList(items: NearbyPoi[], outputLanguage: OutputLanguage): string {
  if (items.length === 0) return EMPTY_POI_LABEL;
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

function resolveAreaLabel(
  address: ListingAddress,
  districtContext: string,
): string {
  return resolvePublicAreaLabel(address, districtContext) || "this area";
}

/** Connectivity hints for well-known DACH urban postal codes (prompt guidance only). */
export function dachConnectivityHint(
  address: ListingAddress,
  outputLanguage: OutputLanguage,
): string | undefined {
  const postalCode = address.postalCode.trim();
  const city = address.city.trim().toLowerCase();
  if (!postalCode || !city) return undefined;

  const isBerlin = city.includes("berlin");
  const isGerman = outputLanguage === "German";

  if (isBerlin && (postalCode.startsWith("105") || postalCode.startsWith("106"))) {
    return isGerman
      ? "Berlin-Charlottenburg: begehrte, zentrale Wohnlage mit dichter ÖPNV-Anbindung (U-Bahn, S-Bahn, Bus) und kurzen Wegen zu den Hauptverkehrsachsen."
      : "Berlin-Charlottenburg: sought-after central location with dense public transport (U-Bahn, S-Bahn, bus) and major roadways within easy reach.";
  }

  if (isBerlin && postalCode.startsWith("140")) {
    return isGerman
      ? "Berlin-Charlottenburg: hervorragende Anbindung an den S-Bahn-Ring, zahlreiche Buslinien (z. B. M45) sowie die Stadtautobahn A100 — schnelle Wege in alle Teile Berlins."
      : "Berlin-Charlottenburg: excellent S-Bahn Ring access, frequent bus lines (e.g. M45), and the A100 city motorway for swift connections across Berlin.";
  }

  if (isBerlin && postalCode.startsWith("10")) {
    return isGerman
      ? "Zentrale Berliner Wohnlage mit dichter ÖPNV-Anbindung (U-Bahn, S-Bahn, Bus) und kurzen Wegen zu den Hauptverkehrsachsen."
      : "Central Berlin location with dense public transport (U-Bahn, S-Bahn, bus) and major roadways within easy reach.";
  }

  if (isBerlin) {
    return isGerman
      ? "Berliner Wohnlage mit guter Anbindung an das städtische Verkehrsnetz (ÖPNV, S-Bahn/U-Bahn) und die Berliner Hauptverkehrsadern."
      : "Berlin location with strong access to the city's public transport network and major roadways.";
  }

  const isMunich = city.includes("münchen") || city.includes("munich");
  if (isMunich && postalCode.startsWith("80")) {
    return isGerman
      ? "Münchner Lage mit hervorragender S-Bahn-/U-Bahn-Anbindung und schnellen Verbindungen in die Innenstadt."
      : "Munich location with excellent S-Bahn/U-Bahn connections and swift access to the city centre.";
  }

  const isVienna = city.includes("wien") || city.includes("vienna");
  if (isVienna && postalCode.startsWith("1")) {
    return isGerman
      ? "Wiener Zentrumslage mit dichter U-Bahn-, Straßenbahn- und Busanbindung."
      : "Central Vienna with dense U-Bahn, tram, and bus connections.";
  }

  return undefined;
}

function emptyLocationContextFields(): Pick<
  LocationContextPayload,
  | "nearbyTransit"
  | "parksAndRecreation"
  | "shoppingAndDining"
  | "highwayAirportConnectivity"
  | "riversAndWater"
  | "culturalLandmarks"
> {
  return {
    nearbyTransit: EMPTY_POI_LABEL,
    parksAndRecreation: EMPTY_POI_LABEL,
    shoppingAndDining: EMPTY_POI_LABEL,
    highwayAirportConnectivity: EMPTY_POI_LABEL,
    riversAndWater: EMPTY_POI_LABEL,
    culturalLandmarks: EMPTY_POI_LABEL,
  };
}

export function buildLocationContextPayload(
  address: ListingAddress,
  enrichment: LocationEnrichment | null,
  outputLanguage: OutputLanguage,
): LocationContextPayload {
  const districtContext =
    enrichment?.districtContext ||
    [address.postalCode.trim(), address.city.trim()].filter(Boolean).join(" ");
  const connectivityHint = dachConnectivityHint(address, outputLanguage);

  if (!enrichment) {
    return {
      nearbyLandmarks: [],
      districtContext,
      ...(connectivityHint ? { dachConnectivityHint: connectivityHint } : {}),
      ...emptyLocationContextFields(),
    };
  }

  return {
    nearbyLandmarks: enrichment.nearbyLandmarks.map((landmark) =>
      mapLandmarkToPayload(landmark, outputLanguage),
    ),
    districtContext,
    ...(connectivityHint ? { dachConnectivityHint: connectivityHint } : {}),
    nearbyTransit: formatPoiList(enrichment.transit, outputLanguage),
    parksAndRecreation: formatPoiList(enrichment.parks, outputLanguage),
    shoppingAndDining: formatPoiList(enrichment.shopping, outputLanguage),
    highwayAirportConnectivity: formatPoiList(enrichment.connectivity, outputLanguage),
    riversAndWater: formatPoiList(enrichment.water, outputLanguage),
    culturalLandmarks: formatPoiList(enrichment.culture, outputLanguage),
  };
}

function hasSpecificTransit(enrichment: LocationEnrichment | null): boolean {
  return (enrichment?.transit.length ?? 0) > 0;
}

function marketingToneRule(): string {
  return `LOCATION / SURROUNDINGS — MARKETING TONE (STRICT):
- Write the locationDescription as an elegant, fluent, and highly attractive real estate exposé marketing paragraph for property seekers.
- Highlight lifestyle factors smoothly: urban convenience, local amenities, public transport, and nearby green spaces.
- NEVER use defensive, cautious, or negative phrases such as "no specific connections verified", "not verified", "limited data", "information unavailable", "could not be retrieved", "unfortunately", or similar disclaimers.
- Focus on lifestyle appeal, connectivity, and neighborhood quality — always in a confident, inviting tone.`;
}

function outputCleanlinessRule(outputLanguage: OutputLanguage): string {
  const germanExamples =
    outputLanguage === "German"
      ? `
- Avoid tautological phrasing (e.g. NEVER: "Innenstadtlage zeichnet sich durch eine zentrale Lage aus").`
      : `
- Avoid tautological phrasing (e.g. NEVER: "The inner-city location is characterized by a central location").`;

  return `STRICT OUTPUT & CLEANLINESS (MANDATORY):
- NEVER output internal formatting codes, regex patterns, or generic placeholders such as "(PLZ 10xxx)", "[PLZ]", "PLZ 10585" in brackets, or "Ortsteil XXX".
- NEVER use robotic meta-phrases such as "PLZ-Bereich", "PLZ 10xxx", "in diesem Postleitzahlengebiet", or masked postal codes (e.g. "10xxx", "140xx").
- Write flowing exposé prose — no template brackets, no placeholder syntax, no technical meta-labels.${germanExamples}`;
}

function missingStreetLocationRule(
  address: ListingAddress,
  districtContext: string,
  outputLanguage: OutputLanguage,
): string {
  if (hasStreetLevelInput(address)) return "";

  const areaLabel = resolveAreaLabel(address, districtContext);
  const postalCode = address.postalCode.trim();
  const city = address.city.trim();

  if (outputLanguage === "German") {
    return `MISSING STREET / HOUSE NUMBER (PRIMARY APPROACH):
Only postal code and city are available — no exact street address.
- Lead with the city and district/neighborhood name naturally in the narrative (e.g. "${areaLabel}" for ${postalCode} ${city}).
- You MAY include the actual postal code once, naturally embedded — e.g. "in ${areaLabel} (${postalCode})" or "in attraktiver Lage von ${postalCode} ${city}".
- Do NOT mask or generalize the postal code (never "10xxx" or similar).
- Good: "Die Wohnung befindet sich in begehrter und zentraler Lage in ${areaLabel}${postalCode ? ` (${postalCode})` : ""}. Der Kiez bietet eine exzellente Infrastruktur..."
- Good: "In attraktiver Lage von ${postalCode} ${city} gelegen, profitiert diese Immobilie von einer hervorragenden Anbindung..."
- Bad (NEVER output): "Die Berliner Innenstadtlage (PLZ 10xxx) zeichnet sich..."`;
  }

  return `MISSING STREET / HOUSE NUMBER (PRIMARY APPROACH):
Only postal code and city are available — no exact street address.
- Lead with the city and district/neighborhood name naturally in the narrative (e.g. "${areaLabel}" for ${postalCode} ${city}).
- You MAY include the actual postal code once, naturally embedded — e.g. "in ${areaLabel} (${postalCode})" or "in the attractive ${postalCode} ${city} area".
- Do NOT mask or generalize the postal code (never "10xxx" or similar).
- Write confident, lifestyle-focused prose — never placeholder-style location labels.`;
}

function transitLocationRule(
  outputLanguage: OutputLanguage,
  enrichment: LocationEnrichment | null,
): string {
  const generalTransitDe =
    "Die Anbindung an das öffentliche Verkehrsnetz sowie an die umliegenden Hauptverkehrsadern ist hervorragend und gewährleistet schnelle Wege in alle Teile der Stadt.";
  const generalTransitEn =
    "Public transportation connections and major roadways are easily accessible, providing swift access across the city.";

  if (hasSpecificTransit(enrichment)) {
    return `TRANSIT & CONNECTIVITY (MANDATORY):
- Specific transit stops/lines ARE provided in Nearby Transit below — name them explicitly in locationDescription (e.g. Bus M45, S-Bahn Westend, U7, U-Bahn Richard-Wagner-Platz).
- Pair each named stop with its pre-normalized proximity phrasing where available.
- Do NOT replace named stops with generic disclaimers.`;
  }

  const fallbackPhrase = outputLanguage === "German" ? generalTransitDe : generalTransitEn;
  return `TRANSIT & CONNECTIVITY (MANDATORY):
- No specific stop/line names appear in the payload — do NOT mention missing data or output any disclaimer.
- Instead, include this positive general connectivity phrasing (adapt naturally into your paragraph):
  "${fallbackPhrase}"`;
}

function dachPostalCodeRule(
  address: ListingAddress,
  outputLanguage: OutputLanguage,
  districtContext: string,
  connectivityHint?: string,
): string {
  if (!connectivityHint) return "";

  const areaLabel = resolveAreaLabel(address, districtContext);

  return `DACH / URBAN CONTEXT (${areaLabel}):
- Acknowledge the area's high connectivity positively — e.g. nearby S-Bahn Ring, bus lines, and motorway access where applicable.
- Use the district/neighborhood name naturally (e.g. "${areaLabel}") — never masked postal codes or "PLZ-Bereich" phrasing.
- Guidance: ${connectivityHint}
- Weave this into locationDescription naturally; do NOT frame it as unverified or uncertain.`;
}

function landmarkMandateRule(outputLanguage: OutputLanguage): string {
  const germanHint =
    outputLanguage === "German"
      ? " Use natural German phrasing (e.g. 'in unmittelbarer Nähe zum Schlosspark Charlottenburg' or 'nur wenige Gehminuten von der U-Bahn Richard-Wagner-Platz')."
      : "";

  return `LANDMARK NAMING (MANDATORY):
- Name the top 2-3 landmarks from nearbyLandmarks in locationDescription.
- For each landmark, include its pre-computed proximityText — e.g. "Schlosspark Charlottenburg (ca. 5 Gehminuten)".
- Use ONLY landmark names from nearbyLandmarks or the POI lists below.${germanHint}`;
}

function districtHighlightsRule(districtContext: string, outputLanguage: OutputLanguage): string {
  if (!districtContext.trim()) return "";

  const example =
    outputLanguage === "German"
      ? "Charlottenburg → Schloss Charlottenburg, Schlosspark Charlottenburg, Ku'damm, Spreeufer"
      : "Charlottenburg → Charlottenburg Palace, Schlosspark, Kurfürstendamm, Spree riverfront";

  return `DISTRICT HIGHLIGHTS:
- District context: "${districtContext}".
- Highlight well-known area assets positively (e.g. ${example}) where they fit the district.
- Write with confident marketing appeal — no disclaimers about data gaps.`;
}

export function buildLocationPromptInstructions(
  address: ListingAddress,
  enrichment: LocationEnrichment | null,
  outputLanguage: OutputLanguage,
): string {
  const streetLine = buildStreetLine(address);
  const locationLine = streetLine
    ? [streetLine, address.city.trim()].filter(Boolean).join(", ")
    : [address.postalCode.trim(), address.city.trim()].filter(Boolean).join(" ");
  const locationContext = buildLocationContextPayload(
    address,
    enrichment,
    outputLanguage,
  );
  const connectivityHint = locationContext.dachConnectivityHint;

  const landmarkSection =
    enrichment && enrichment.nearbyLandmarks.length > 0
      ? landmarkMandateRule(outputLanguage)
      : districtHighlightsRule(locationContext.districtContext, outputLanguage);

  const poiBlock = enrichment
    ? `Nearby POI data (distances pre-normalized — use proximity phrasing as shown):
- Nearby Transit: ${formatPoiList(enrichment.transit, outputLanguage) || "(use general positive transit phrasing — see TRANSIT rule)"}
- Parks/Recreation: ${formatPoiList(enrichment.parks, outputLanguage) || "(emphasize green spaces and recreation positively if district context supports it)"}
- Rivers/Water: ${formatPoiList(enrichment.water, outputLanguage) || "(omit or describe district water features positively if known from context)"}
- Cultural Landmarks: ${formatPoiList(enrichment.culture, outputLanguage) || "(highlight district culture positively if context supports it)"}
- Shopping/Dining: ${formatPoiList(enrichment.shopping, outputLanguage) || "(mention daily amenities positively where appropriate)"}
- Highway/Airport Connectivity: ${formatPoiList(enrichment.connectivity, outputLanguage) || "(mention motorway/airport access positively if district context supports it)"}

nearbyLandmarks (top 2-3 names + proximityText MUST appear when non-empty):
${formatLandmarksForPrompt(enrichment.nearbyLandmarks, outputLanguage)}`
    : `nearbyLandmarks: []
(Draw on districtContext and dachConnectivityHint for a compelling location paragraph.)`;

  return `LOCATION & NEIGHBORHOOD GENERATION INSTRUCTIONS:
Property: ${locationLine || "this property"}

${outputCleanlinessRule(outputLanguage)}

${marketingToneRule()}

${missingStreetLocationRule(address, locationContext.districtContext, outputLanguage)}

${transitLocationRule(outputLanguage, enrichment)}

${dachPostalCodeRule(address, outputLanguage, locationContext.districtContext, connectivityHint)}

${landmarkSection}

locationContext (JSON payload):
${JSON.stringify(locationContext, null, 2)}

${poiBlock}

Write a compelling, professional locationDescription (${outputLanguage}) for the exposé Location / Surroundings section.
Use provided POI names, transit stops, landmarks, and proximityText where available.
When specific names are absent from the payload, rely on positive general phrasing and district context — never on disclaimers or placeholder labels.

${distanceFormattingRules(outputLanguage)}`;
}
