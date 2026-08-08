import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { ListingAddress } from "@/types/listing";
import { formatListingAddress } from "@/lib/location/format-address";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "immo-brochure-ai/1.0 (real-estate-expose-generator)";

const COUNTRY_ISO2: Record<string, string> = {
  germany: "de",
  deutschland: "de",
  austria: "at",
  österreich: "at",
  switzerland: "ch",
  schweiz: "ch",
  france: "fr",
  italy: "it",
  italien: "it",
  spain: "es",
  españa: "es",
  netherlands: "nl",
  poland: "pl",
};

function countryToIso2(country: string): string | undefined {
  const key = country.trim().toLowerCase();
  return COUNTRY_ISO2[key];
}

function parseHit(hit: NominatimResult): GeocodedAddress | null {
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

function geocodeMatchesListingAddress(
  geocoded: GeocodedAddress,
  address: ListingAddress,
): boolean {
  const expectedPostcode = address.postalCode.trim();
  if (expectedPostcode && geocoded.postcode && geocoded.postcode !== expectedPostcode) {
    return false;
  }

  const expectedCity = address.city.trim().toLowerCase();
  const hitCity = geocoded.city?.trim().toLowerCase() ?? "";
  if (expectedCity && hitCity && !hitCity.includes(expectedCity) && !expectedCity.includes(hitCity)) {
    return false;
  }

  const countryCode = countryToIso2(address.country);
  if (countryCode && geocoded.displayName) {
    const displayLower = geocoded.displayName.toLowerCase();
    const countryLower = address.country.trim().toLowerCase();
    const countryMatches =
      displayLower.includes(countryLower) ||
      (countryCode === "de" && displayLower.includes("deutschland")) ||
      (countryCode === "at" && displayLower.includes("österreich")) ||
      (countryCode === "ch" &&
        (displayLower.includes("schweiz") || displayLower.includes("switzerland")));
    if (!countryMatches) return false;
  }

  return true;
}

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

  return parseHit(hit);
}

/** Structured Nominatim lookup — constrains results to the listing country/city. */
async function geocodeListingStructured(
  address: ListingAddress,
  timeoutMs: number,
): Promise<GeocodedAddress | null> {
  const streetLine = [address.streetAddress.trim(), address.houseNumber.trim()]
    .filter(Boolean)
    .join(" ");
  if (!streetLine && !address.postalCode.trim() && !address.city.trim()) return null;

  const url = new URL(NOMINATIM_URL);
  if (streetLine) url.searchParams.set("street", streetLine);
  if (address.postalCode.trim()) url.searchParams.set("postalcode", address.postalCode.trim());
  if (address.city.trim()) url.searchParams.set("city", address.city.trim());
  if (address.country.trim()) url.searchParams.set("country", address.country.trim());

  const countryCode = countryToIso2(address.country);
  if (countryCode) url.searchParams.set("countrycodes", countryCode);

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

  const parsed = parseHit(hit);
  if (!parsed) return null;

  return geocodeMatchesListingAddress(parsed, address) ? parsed : null;
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

function formatPostalCityQuery(address: ListingAddress): string {
  return [address.postalCode.trim(), address.city.trim(), address.country.trim()]
    .filter(Boolean)
    .join(", ");
}

/** Geocode a listing address, falling back to postal code + city when the street is unknown. */
export async function geocodeListingAddress(
  address: ListingAddress,
  timeoutMs = 5_000,
): Promise<GeocodedAddress | null> {
  const structured = await geocodeListingStructured(address, timeoutMs);
  if (structured) return structured;

  const fullQuery = formatListingAddress(address);
  const freeText = await geocodeAddress(fullQuery, timeoutMs);
  if (freeText && geocodeMatchesListingAddress(freeText, address)) return freeText;

  const postalCityQuery = formatPostalCityQuery(address);
  if (postalCityQuery.length >= 6) {
    const countryCode = countryToIso2(address.country);
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("postalcode", address.postalCode.trim());
    url.searchParams.set("city", address.city.trim());
    if (address.country.trim()) url.searchParams.set("country", address.country.trim());
    if (countryCode) url.searchParams.set("countrycodes", countryCode);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    const res = await fetchWithTimeout(url.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 86400 },
      timeoutMs,
    }).catch(() => null);

    if (res?.ok) {
      const data = (await res.json()) as NominatimResult[];
      const parsed = data[0] ? parseHit(data[0]) : null;
      if (parsed && geocodeMatchesListingAddress(parsed, address)) return parsed;
    }

    if (postalCityQuery !== fullQuery) {
      const postalOnly = await geocodeAddress(postalCityQuery, timeoutMs);
      if (postalOnly && geocodeMatchesListingAddress(postalOnly, address)) return postalOnly;
    }
  }

  return null;
}
