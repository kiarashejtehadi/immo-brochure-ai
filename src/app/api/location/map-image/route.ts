import { NextResponse } from "next/server";
import { geocodeAddress, geocodeListingAddress } from "@/lib/location/geocode-address";
import {
  formatListingAddress,
  normalizeListingAddress,
} from "@/lib/location/format-address";
import { fetchStaticMapAsDataUrl } from "@/lib/location/static-map";
import { withDeadline } from "@/lib/promise-timeout";

export const runtime = "nodejs";
export const maxDuration = 10;

/** Hard server-side budget for map tile generation. */
const MAP_IMAGE_DEADLINE_MS = 10_000;

type MapImageRequest = {
  lat?: number;
  lon?: number;
  address?: unknown;
  query?: string;
};

async function buildMapImageResponse(body: MapImageRequest) {
  let lat = typeof body.lat === "number" ? body.lat : Number(body.lat);
  let lon = typeof body.lon === "number" ? body.lon : Number(body.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    const address = normalizeListingAddress(body.address);
    const query =
      typeof body.query === "string" && body.query.trim()
        ? body.query.trim()
        : formatListingAddress(address);

    const geocoded = await geocodeListingAddress(address, 8_000);
    if (!geocoded) {
      return { mapDataUrl: null, lat: null, lon: null };
    }

    lat = geocoded.lat;
    lon = geocoded.lon;
  }

  const mapDataUrl = await fetchStaticMapAsDataUrl(lat, lon);
  return { mapDataUrl, lat, lon };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MapImageRequest;
    const result = await withDeadline(buildMapImageResponse(body), MAP_IMAGE_DEADLINE_MS);

    if (!result) {
      return NextResponse.json({ mapDataUrl: null, lat: null, lon: null });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/location/map-image]", err);
    return NextResponse.json({ mapDataUrl: null, lat: null, lon: null });
  }
}
