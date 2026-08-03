import type { ListingAddress } from "@/types/listing";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { formatListingAddress } from "@/lib/location/format-address";

const MAP_FETCH_TIMEOUT_MS = 12_000;

/** Fetch a static map preview as a data URL for PDF rendering (client-side). */
export async function fetchMapForPdf(
  address: ListingAddress,
): Promise<string | undefined> {
  const query = formatListingAddress(address);
  if (!query.trim() || query.length < 6) return undefined;

  try {
    const res = await fetchWithTimeout("/api/location/map-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
      timeoutMs: MAP_FETCH_TIMEOUT_MS,
    });
    if (!res.ok) return undefined;

    const data = (await res.json()) as { mapDataUrl?: string | null };
    return data.mapDataUrl ?? undefined;
  } catch {
    return undefined;
  }
}
