import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { ListingAddress } from "@/types/listing";
import type {
  LandmarkKind,
  LocationEnrichment,
  NearbyLandmark,
  NearbyPoi,
  PoiCategory,
} from "@/types/location-poi";
import {
  geocodeAddress,
  geocodeListingAddress,
  reverseGeocodeDistrict,
  searchDistrictLandmarks,
  type GeocodedAddress,
} from "@/lib/location/geocode-address";
import { formatListingAddress } from "@/lib/location/format-address";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "immo-brochure-ai/1.0 (real-estate-expose-generator)";
const POI_RADIUS_METERS = 1000;
const FALLBACK_LANDMARK_RADIUS_METERS = 2500;
const CONNECTIVITY_RADIUS_METERS = 50000;
const MAX_POIS_PER_CATEGORY = 6;
const MAX_NEARBY_LANDMARKS = 10;

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const GENERIC_POI_NAMES = new Set([
  "bus stop",
  "green space",
  "rail station",
  "rail halt",
  "tram",
  "subway",
  "shop",
  "supermarket",
  "convenience",
  "marketplace",
  "motorway junction",
  "park",
  "garden",
  "nature reserve",
  "airport",
  "water",
  "river",
  "canal",
]);

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function elementCoords(element: OverpassElement): { lat: number; lon: number } | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lon: element.lon };
  }
  if (element.center) return element.center;
  return null;
}

function poiName(tags: Record<string, string> | undefined, fallback: string): string {
  if (!tags) return fallback;
  const named =
    tags.name?.trim() ||
    tags["name:de"]?.trim() ||
    tags["name:en"]?.trim() ||
    tags.brand?.trim() ||
    tags.operator?.trim();
  if (named) return named;

  const ref = tags.ref?.trim() || tags["n:ref"]?.trim() || tags["route_ref"]?.trim();
  if (ref) {
    if (fallback === "bus stop") return `Bus ${ref}`;
    if (fallback === "tram") return `Tram ${ref}`;
    if (fallback === "subway") return `U-Bahn ${ref}`;
    if (fallback === "rail station" || fallback === "rail halt") return ref;
    return ref;
  }

  return fallback;
}

function isNamedPoi(name: string, subtype?: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (normalized.length < 2) return false;
  if (subtype === "bus stop" && /^bus\s+\S+/i.test(name.trim())) return true;
  if (!GENERIC_POI_NAMES.has(normalized)) return true;
  return false;
}

function classifyTransit(tags: Record<string, string>): { category: PoiCategory; subtype: string } | null {
  if (tags.railway === "station" || tags.railway === "halt") {
    return { category: "transit", subtype: tags.railway === "halt" ? "rail halt" : "rail station" };
  }
  if (tags.public_transport === "station" || tags.amenity === "bus_station") {
    return { category: "transit", subtype: tags.station ?? tags.railway ?? "transit station" };
  }
  if (tags.railway === "tram_stop" || tags.station === "tram") {
    return { category: "transit", subtype: "tram" };
  }
  if (tags.station === "subway" || tags.railway === "subway_entrance") {
    return { category: "transit", subtype: "subway" };
  }
  if (tags.highway === "bus_stop") {
    return { category: "transit", subtype: "bus stop" };
  }
  return null;
}

function classifyElement(
  element: OverpassElement,
): { category: PoiCategory; name: string; subtype?: string } | null {
  const tags = element.tags ?? {};

  const transit = classifyTransit(tags);
  if (transit) {
    return {
      category: transit.category,
      name: poiName(tags, transit.subtype),
      subtype: transit.subtype,
    };
  }

  if (tags.leisure === "park" || tags.leisure === "garden" || tags.leisure === "nature_reserve") {
    return {
      category: "parks",
      name: poiName(tags, tags.leisure.replace("_", " ")),
      subtype: tags.leisure,
    };
  }

  if (tags.landuse === "forest" || tags.natural === "wood") {
    return {
      category: "parks",
      name: poiName(tags, "green space"),
      subtype: tags.landuse ?? tags.natural,
    };
  }

  if (
    tags.waterway === "river" ||
    tags.waterway === "canal" ||
    tags.waterway === "stream" ||
    (tags.natural === "water" && tags.name)
  ) {
    return {
      category: "water",
      name: poiName(tags, tags.waterway ?? "water"),
      subtype: tags.waterway ?? tags.natural,
    };
  }

  if (
    tags.tourism === "attraction" ||
    tags.tourism === "museum" ||
    tags.tourism === "viewpoint" ||
    tags.tourism === "artwork" ||
    tags.historic ||
    tags.amenity === "theatre" ||
    tags.amenity === "arts_centre"
  ) {
    const subtype =
      tags.historic ??
      tags.tourism ??
      tags.amenity ??
      "landmark";
    return {
      category: "culture",
      name: poiName(tags, subtype.replace("_", " ")),
      subtype,
    };
  }

  if (
    tags.shop === "supermarket" ||
    tags.shop === "mall" ||
    tags.shop === "convenience" ||
    tags.amenity === "marketplace" ||
    tags.amenity === "supermarket"
  ) {
    const subtype = tags.shop ?? tags.amenity ?? "shop";
    return {
      category: "shopping",
      name: poiName(tags, subtype.replace("_", " ")),
      subtype,
    };
  }

  if (tags.aeroway === "aerodrome") {
    return {
      category: "connectivity",
      name: poiName(tags, "airport"),
      subtype: "airport",
    };
  }

  if (tags.highway === "motorway_junction") {
    return {
      category: "connectivity",
      name: poiName(tags, "motorway junction"),
      subtype: "motorway",
    };
  }

  return null;
}

function poiToLandmarkKind(category: PoiCategory): LandmarkKind {
  if (category === "parks") return "park";
  return category;
}

function landmarkPriority(poi: NearbyPoi): number {
  if (poi.category === "culture") return 0;
  if (poi.category === "parks" && isNamedPoi(poi.name, poi.subtype)) return 1;
  if (poi.category === "water" && isNamedPoi(poi.name, poi.subtype)) return 2;
  if (
    poi.category === "transit" &&
    isNamedPoi(poi.name, poi.subtype) &&
    poi.subtype !== "bus stop"
  ) {
    return poi.subtype === "subway" ? 3 : 4;
  }
  if (poi.category === "parks") return 5;
  if (poi.category === "transit" && poi.subtype !== "bus stop") return 6;
  return 9;
}

export function buildNearbyLandmarks(allPois: NearbyPoi[]): NearbyLandmark[] {
  const seen = new Set<string>();
  const candidates = allPois
    .filter((poi) => {
      if (poi.category === "shopping" || poi.category === "connectivity") return false;
      if (poi.category === "transit" && poi.subtype === "bus stop") return false;
      return isNamedPoi(poi.name, poi.subtype);
    })
    .sort((a, b) => {
      const priorityDiff = landmarkPriority(a) - landmarkPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      return a.distanceMeters - b.distanceMeters;
    });

  const landmarks: NearbyLandmark[] = [];
  for (const poi of candidates) {
    const key = poi.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    landmarks.push({
      name: poi.name.trim(),
      kind: poiToLandmarkKind(poi.category),
      distanceMeters: poi.distanceMeters,
      subtype: poi.subtype,
    });
    if (landmarks.length >= MAX_NEARBY_LANDMARKS) break;
  }

  return landmarks;
}

function dedupeAndLimit(items: NearbyPoi[], limit: number): NearbyPoi[] {
  const seen = new Set<string>();
  const sorted = [...items].sort((a, b) => a.distanceMeters - b.distanceMeters);
  const result: NearbyPoi[] = [];

  for (const item of sorted) {
    const key = `${item.category}:${item.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= limit) break;
  }

  return result;
}

async function fetchOverpassPois(
  lat: number,
  lon: number,
  radiusMeters = POI_RADIUS_METERS,
): Promise<NearbyPoi[]> {
  const query = `
[out:json][timeout:25];
(
  node["railway"~"station|halt|tram_stop|subway_entrance"]["name"](around:${radiusMeters},${lat},${lon});
  node["public_transport"="station"]["name"](around:${radiusMeters},${lat},${lon});
  node["highway"="bus_stop"](around:${radiusMeters},${lat},${lon});
  node["amenity"~"bus_station|supermarket|marketplace|theatre|arts_centre"](around:${radiusMeters},${lat},${lon});
  node["station"~"subway|tram"](around:${radiusMeters},${lat},${lon});
  node["leisure"~"park|garden|nature_reserve"]["name"](around:${radiusMeters},${lat},${lon});
  way["leisure"~"park|garden|nature_reserve"]["name"](around:${radiusMeters},${lat},${lon});
  relation["leisure"="park"]["name"](around:${radiusMeters},${lat},${lon});
  node["shop"~"supermarket|mall|convenience"](around:${radiusMeters},${lat},${lon});
  node["landuse"="forest"](around:${radiusMeters},${lat},${lon});
  node["natural"="wood"](around:${radiusMeters},${lat},${lon});
  way["waterway"~"river|canal|stream"]["name"](around:${radiusMeters},${lat},${lon});
  relation["waterway"~"river|canal"]["name"](around:${radiusMeters},${lat},${lon});
  node["natural"="water"]["name"](around:${radiusMeters},${lat},${lon});
  way["natural"="water"]["name"](around:${radiusMeters},${lat},${lon});
  node["tourism"~"attraction|museum|viewpoint|artwork"]["name"](around:${radiusMeters},${lat},${lon});
  way["tourism"~"attraction|museum"]["name"](around:${radiusMeters},${lat},${lon});
  node["historic"]["name"](around:${radiusMeters},${lat},${lon});
  way["historic"]["name"](around:${radiusMeters},${lat},${lon});
  node["aeroway"="aerodrome"](around:${CONNECTIVITY_RADIUS_METERS},${lat},${lon});
  node["highway"="motorway_junction"](around:5000,${lat},${lon});
);
out center tags;
`;

  const res = await fetchWithTimeout(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    timeoutMs: 10_000,
  });

  if (!res.ok) return [];

  const payload = (await res.json()) as { elements?: OverpassElement[] };
  const pois: NearbyPoi[] = [];

  for (const element of payload.elements ?? []) {
    const coords = elementCoords(element);
    if (!coords) continue;

    const classified = classifyElement(element);
    if (!classified) continue;

    pois.push({
      name: classified.name,
      category: classified.category,
      subtype: classified.subtype,
      distanceMeters: haversineMeters(lat, lon, coords.lat, coords.lon),
    });
  }

  return pois;
}

function buildDistrictContext(
  address: ListingAddress,
  geocoded: {
    suburb?: string;
    cityDistrict?: string;
    postcode?: string;
    city?: string;
  },
): string {
  const district =
    geocoded.cityDistrict ||
    geocoded.suburb ||
    address.city.trim();
  return [
    address.postalCode.trim(),
    address.city.trim() || geocoded.city?.trim(),
    district,
  ]
    .filter(Boolean)
    .join(" ");
}

async function fetchDistrictFallbackLandmarks(
  lat: number,
  lon: number,
  districtContext: string,
): Promise<NearbyLandmark[]> {
  if (!districtContext.trim()) return [];

  const queries = [
    `${districtContext} park`,
    `${districtContext} U-Bahn`,
    `${districtContext} landmark`,
  ];

  const seen = new Set<string>();
  const landmarks: NearbyLandmark[] = [];

  for (const query of queries) {
    const hits = await searchDistrictLandmarks(query, { lat, lon }, 4, 3_500);
    for (const hit of hits) {
      const key = hit.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      landmarks.push({
        name: hit.name,
        kind: inferLandmarkKindFromName(hit.name),
        distanceMeters: haversineMeters(lat, lon, hit.lat, hit.lon),
      });
      if (landmarks.length >= MAX_NEARBY_LANDMARKS) {
        return landmarks.sort((a, b) => a.distanceMeters - b.distanceMeters);
      }
    }
  }

  return landmarks.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

function inferLandmarkKindFromName(name: string): LandmarkKind {
  const lower = name.toLowerCase();
  if (/park|garten|garden|schlosspark/.test(lower)) return "park";
  if (/spree|see|fluss|river|canal|ufer|wasser/.test(lower)) return "water";
  if (/u-bahn|s-bahn|bahnhof|station|metro/.test(lower)) return "transit";
  if (/museum|schloss|denkmal|kirche|theater|monument|platz/.test(lower)) return "culture";
  return "culture";
}

async function fetchTransitFallback(
  lat: number,
  lon: number,
  districtContext: string,
): Promise<NearbyPoi[]> {
  const cityQuery = districtContext.split(" ").pop() ?? "Berlin";
  const queries = [
    `U-Bahn ${districtContext}`,
    `S-Bahn ${districtContext}`,
    `Bahnhof ${cityQuery}`,
  ];

  const seen = new Set<string>();
  const results: NearbyPoi[] = [];

  for (const query of queries) {
    const hits = await searchDistrictLandmarks(query, { lat, lon }, 3, 3_500);
    for (const hit of hits) {
      const key = hit.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const distanceMeters = haversineMeters(lat, lon, hit.lat, hit.lon);
      if (distanceMeters > 3_000) continue;
      results.push({
        name: hit.name,
        category: "transit",
        subtype: inferTransitSubtypeFromName(hit.name),
        distanceMeters,
      });
      if (results.length >= MAX_POIS_PER_CATEGORY) break;
    }
    if (results.length >= MAX_POIS_PER_CATEGORY) break;
  }

  return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

function inferTransitSubtypeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (/u-bahn|ubahn|metro|subway/.test(lower)) return "subway";
  if (/s-bahn|sbahn/.test(lower)) return "rail station";
  if (/bus|haltestelle/.test(lower)) return "bus stop";
  if (/bahnhof|station/.test(lower)) return "rail station";
  return "transit station";
}

export async function fetchLocationEnrichment(
  address: ListingAddress,
): Promise<LocationEnrichment | null> {
  const query = formatListingAddress(address);
  if (!query.trim() || query.length < 6) return null;

  const geocoded = await geocodeListingAddress(address, 5_000);
  if (!geocoded) return null;

  const [reverseDistrict, initialPois] = await Promise.all([
    reverseGeocodeDistrict(geocoded.lat, geocoded.lon, 3_000).catch(
      (): Pick<GeocodedAddress, "suburb" | "cityDistrict" | "postcode" | "city"> => ({}),
    ),
    fetchOverpassPois(geocoded.lat, geocoded.lon).catch(() => [] as NearbyPoi[]),
  ]);

  const districtMeta = {
    suburb: geocoded.suburb ?? reverseDistrict.suburb,
    cityDistrict: geocoded.cityDistrict ?? reverseDistrict.cityDistrict,
    postcode: geocoded.postcode ?? reverseDistrict.postcode ?? address.postalCode.trim(),
    city: geocoded.city ?? reverseDistrict.city ?? address.city.trim(),
  };

  const districtContext = buildDistrictContext(address, districtMeta);

  let allPois = initialPois;
  let nearbyLandmarks = buildNearbyLandmarks(allPois);
  const initialTransit = allPois.filter((p) => p.category === "transit");
  const initialParks = allPois.filter((p) => p.category === "parks");
  const hasEnoughPois =
    initialTransit.length >= 2 &&
    (initialParks.length >= 1 || nearbyLandmarks.length >= 2);

  if (!hasEnoughPois && nearbyLandmarks.length === 0) {
    const widerPois = await fetchOverpassPois(
      geocoded.lat,
      geocoded.lon,
      FALLBACK_LANDMARK_RADIUS_METERS,
    ).catch(() => [] as NearbyPoi[]);
    allPois = widerPois;
    nearbyLandmarks = buildNearbyLandmarks(widerPois);
  }

  if (nearbyLandmarks.length === 0) {
    nearbyLandmarks = await fetchDistrictFallbackLandmarks(
      geocoded.lat,
      geocoded.lon,
      districtContext,
    );
  }

  let transit = dedupeAndLimit(
    allPois.filter((p) => p.category === "transit"),
    MAX_POIS_PER_CATEGORY,
  );

  if (transit.length === 0 && !hasEnoughPois) {
    transit = dedupeAndLimit(
      await fetchTransitFallback(geocoded.lat, geocoded.lon, districtContext),
      MAX_POIS_PER_CATEGORY,
    );
  }
  const parks = dedupeAndLimit(
    allPois.filter((p) => p.category === "parks"),
    MAX_POIS_PER_CATEGORY,
  );
  const shopping = dedupeAndLimit(
    allPois.filter((p) => p.category === "shopping"),
    MAX_POIS_PER_CATEGORY,
  );
  const connectivity = dedupeAndLimit(
    allPois.filter((p) => p.category === "connectivity"),
    MAX_POIS_PER_CATEGORY,
  );
  const water = dedupeAndLimit(
    allPois.filter((p) => p.category === "water"),
    MAX_POIS_PER_CATEGORY,
  );
  const culture = dedupeAndLimit(
    allPois.filter((p) => p.category === "culture"),
    MAX_POIS_PER_CATEGORY,
  );

  return {
    lat: geocoded.lat,
    lon: geocoded.lon,
    displayName: geocoded.displayName,
    nearbyLandmarks,
    districtContext,
    transit,
    parks,
    shopping,
    connectivity,
    water,
    culture,
  };
}
