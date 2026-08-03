import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/location/geocode-address";
import {
  formatListingAddress,
  normalizeListingAddress,
} from "@/lib/location/format-address";
import { fetchStaticMapAsDataUrl } from "@/lib/location/static-map";

export const runtime = "nodejs";

type MapImageRequest = {
  lat?: number;
  lon?: number;
  address?: unknown;
  query?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MapImageRequest;

    let lat = typeof body.lat === "number" ? body.lat : Number(body.lat);
    let lon = typeof body.lon === "number" ? body.lon : Number(body.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      const address = normalizeListingAddress(body.address);
      const query =
        typeof body.query === "string" && body.query.trim()
          ? body.query.trim()
          : formatListingAddress(address);

      const geocoded = await geocodeAddress(query);
      if (!geocoded) {
        return NextResponse.json({ mapDataUrl: null, lat: null, lon: null });
      }

      lat = geocoded.lat;
      lon = geocoded.lon;
    }

    const mapDataUrl = await fetchStaticMapAsDataUrl(lat, lon);
    return NextResponse.json({ mapDataUrl, lat, lon });
  } catch (err) {
    console.error("[api/location/map-image]", err);
    return NextResponse.json({ mapDataUrl: null, lat: null, lon: null });
  }
}
