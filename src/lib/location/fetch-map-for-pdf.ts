import type { ListingAddress } from "@/types/listing";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

/** Strict map fetch budget — PDF must not block indefinitely, but geocode + tiles need headroom. */
export const MAP_FETCH_TIMEOUT_MS = 10_000;

export type MapFetchCoords = {
  lat: number;
  lon: number;
};

/** Fetch a static map preview as a data URL for PDF rendering (client-side). */
export async function fetchMapForPdf(
  address: ListingAddress,
  coords?: MapFetchCoords | null,
): Promise<string | undefined> {
  try {
    const res = await fetchWithTimeout("/api/location/map-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        coords
          ? { lat: coords.lat, lon: coords.lon }
          : { address },
      ),
      timeoutMs: MAP_FETCH_TIMEOUT_MS,
    });
    if (!res.ok) return undefined;

    const data = (await res.json()) as { mapDataUrl?: string | null };
    return data.mapDataUrl ?? undefined;
  } catch {
    return undefined;
  }
}
