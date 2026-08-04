import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "immo-brochure-ai/1.0 (real-estate-expose-generator)";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
};

export type GeocodedAddress = {
  lat: number;
  lon: number;
  displayName: string;
  suburb?: string;
  cityDistrict?: string;
  postcode?: string;
  city?: string;
};

function parseNominatimAddress(address?: Record<string, string>): Pick<
  GeocodedAddress,
  "suburb" | "cityDistrict" | "postcode" | "city"
> {
  if (!address) return {};
  return {
    suburb: address.suburb?.trim() || address.neighbourhood?.trim() || address.quarter?.trim(),
    cityDistrict:
      address.city_district?.trim() ||
      address.borough?.trim() ||
      address.district?.trim(),
    postcode: address.postcode?.trim(),
    city: address.city?.trim() || address.town?.trim() || address.municipality?.trim(),
  };
}

/** Geocode a free-text address via OpenStreetMap Nominatim. */
export async function geocodeAddress(
  query: string,
  timeoutMs = 8_000,
): Promise<GeocodedAddress | null> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 6) return null;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const res = await fetchWithTimeout(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 86400 },
    timeoutMs,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as NominatimResult[];
  const hit = data[0];
  if (!hit) return null;

  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return {
    lat,
    lon,
    displayName: hit.display_name,
    ...parseNominatimAddress(hit.address),
  };
}

type NominatimReverseResult = {
  display_name?: string;
  address?: Record<string, string>;
};

/** Reverse-geocode coordinates for suburb / district labels used in POI fallback. */
export async function reverseGeocodeDistrict(
  lat: number,
  lon: number,
  timeoutMs = 5_000,
): Promise<Pick<GeocodedAddress, "suburb" | "cityDistrict" | "postcode" | "city">> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "14");

  const res = await fetchWithTimeout(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 86400 },
    timeoutMs,
  });

  if (!res.ok) return {};

  const data = (await res.json()) as NominatimReverseResult;
  return parseNominatimAddress(data.address);
}

/** Search Nominatim for named places (parks, landmarks) near a district context. */
export async function searchDistrictLandmarks(
  query: string,
  near: { lat: number; lon: number },
  limit = 6,
  timeoutMs = 4_000,
): Promise<{ name: string; lat: number; lon: number }[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("addressdetails", "0");

  const delta = 0.06;
  url.searchParams.set(
    "viewbox",
    `${near.lon - delta},${near.lat + delta},${near.lon + delta},${near.lat - delta}`,
  );
  url.searchParams.set("bounded", "1");

  const res = await fetchWithTimeout(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    timeoutMs,
  });

  if (!res.ok) return [];

  const data = (await res.json()) as NominatimResult[];
  return data
    .map((hit) => ({
      name: hit.display_name.split(",")[0]?.trim() ?? "",
      lat: Number(hit.lat),
      lon: Number(hit.lon),
    }))
    .filter(
      (item) =>
        item.name.length >= 3 &&
        Number.isFinite(item.lat) &&
        Number.isFinite(item.lon),
    );
}
