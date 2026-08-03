import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "immo-brochure-ai/1.0 (real-estate-expose-generator)";

type NominatimResult = {  lat: string;
  lon: string;
  display_name: string;
};

export type GeocodedAddress = {
  lat: number;
  lon: number;
  displayName: string;
};

/** Geocode a free-text address via OpenStreetMap Nominatim. */
export async function geocodeAddress(
  query: string,
): Promise<GeocodedAddress | null> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 6) return null;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  const res = await fetchWithTimeout(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 86400 },
    timeoutMs: 8_000,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as NominatimResult[];
  const hit = data[0];
  if (!hit) return null;

  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { lat, lon, displayName: hit.display_name };
}
