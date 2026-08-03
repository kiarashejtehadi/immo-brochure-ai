import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { ListingAddress } from "@/types/listing";
import type { LocationEnrichment, NearbyPoi, PoiCategory } from "@/types/location-poi";
import { geocodeAddress } from "@/lib/location/geocode-address";
import { formatListingAddress } from "@/lib/location/format-address";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "immo-brochure-ai/1.0 (real-estate-expose-generator)";
const POI_RADIUS_METERS = 1000;
const CONNECTIVITY_RADIUS_METERS = 50000;
const MAX_POIS_PER_CATEGORY = 6;

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

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
  return (
    tags.name?.trim() ||
    tags["name:en"]?.trim() ||
    tags.brand?.trim() ||
    tags.operator?.trim() ||
    fallback
  );
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

async function fetchOverpassPois(lat: number, lon: number): Promise<NearbyPoi[]> {
  const query = `
[out:json][timeout:25];
(
  node["railway"~"station|halt|tram_stop|subway_entrance"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["public_transport"="station"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["highway"="bus_stop"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["amenity"~"bus_station|supermarket|marketplace"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["station"~"subway|tram"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["leisure"~"park|garden|nature_reserve"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["shop"~"supermarket|mall|convenience"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["landuse"="forest"](around:${POI_RADIUS_METERS},${lat},${lon});
  node["natural"="wood"](around:${POI_RADIUS_METERS},${lat},${lon});
  way["leisure"="park"](around:${POI_RADIUS_METERS},${lat},${lon});
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
    timeoutMs: 5_000,
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

export async function fetchLocationEnrichment(
  address: ListingAddress,
): Promise<LocationEnrichment | null> {
  const query = formatListingAddress(address);
  if (!query.trim() || query.length < 6) return null;

  const geocoded = await geocodeAddress(query);
  if (!geocoded) return null;

  const allPois = await fetchOverpassPois(geocoded.lat, geocoded.lon);

  const transit = dedupeAndLimit(
    allPois.filter((p) => p.category === "transit"),
    MAX_POIS_PER_CATEGORY,
  );
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

  return {
    lat: geocoded.lat,
    lon: geocoded.lon,
    displayName: geocoded.displayName,
    transit,
    parks,
    shopping,
    connectivity,
  };
}
