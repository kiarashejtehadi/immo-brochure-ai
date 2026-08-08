import sharp from "sharp";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { geocodeAddress, geocodeListingAddress } from "@/lib/location/geocode-address";
import type { ListingAddress } from "@/types/listing";

/** 16:9 map tile dimensions (pt-equivalent pixels for sharp rendering). */
const MAP_HEIGHT = 260;
const MAP_WIDTH = Math.round((MAP_HEIGHT * 16) / 9);
const TILE_SIZE = 256;
const OSM_TILE_SOURCES = [
  "https://tile.openstreetmap.org",
  "https://tile.openstreetmap.de",
];
const USER_AGENT = "immo-brochure-ai/1.0 (real-estate-expose-generator)";
const TILE_FETCH_TIMEOUT_MS = 5_000;

function lonLatToWorldPixel(
  lon: number,
  lat: number,
  zoom: number,
): { x: number; y: number } {
  const scale = TILE_SIZE * 2 ** zoom;
  const x = ((lon + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

async function fetchOsmTile(z: number, x: number, y: number): Promise<Buffer> {
  const maxTile = 2 ** z;
  const wrappedX = ((x % maxTile) + maxTile) % maxTile;
  if (y < 0 || y >= maxTile) {
    throw new Error("Tile y out of bounds");
  }

  let lastError: unknown;
  for (const baseUrl of OSM_TILE_SOURCES) {
    const url = `${baseUrl}/${z}/${wrappedX}/${y}.png`;
    try {
      const res = await fetchWithTimeout(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "image/png" },
        timeoutMs: TILE_FETCH_TIMEOUT_MS,
      });
      if (!res.ok) {
        lastError = new Error(`Tile fetch failed: ${res.status}`);
        continue;
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Tile fetch failed");
}

/** Build a static map URL with a pin at the given coordinates (Google Maps only). */
export function buildStaticMapUrl(lat: number, lon: number): string | null {
  const googleKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!googleKey) return null;

  const params = new URLSearchParams({
    center: `${lat},${lon}`,
    zoom: "15",
    size: `${MAP_WIDTH}x${MAP_HEIGHT}`,
    scale: "2",
    markers: `color:red|${lat},${lon}`,
    key: googleKey,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

async function drawMapPinOverlay(mapBuffer: Buffer): Promise<Buffer> {
  const pinWidth = 28;
  const pinHeight = 40;
  const pinSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pinWidth}" height="${pinHeight}" viewBox="0 0 28 40">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="#dc2626"/>
    <circle cx="14" cy="14" r="6" fill="#ffffff"/>
  </svg>`);

  const pin = await sharp(pinSvg).png().toBuffer();
  const left = Math.round(MAP_WIDTH / 2 - pinWidth / 2);
  const top = Math.round(MAP_HEIGHT / 2 - pinHeight + 4);

  return sharp(mapBuffer)
    .composite([{ input: pin, left, top }])
    .png()
    .toBuffer();
}

async function composeOsmStaticMap(lat: number, lon: number): Promise<Buffer> {
  const zoom = 15;
  const center = lonLatToWorldPixel(lon, lat, zoom);
  const topLeft = { x: center.x - MAP_WIDTH / 2, y: center.y - MAP_HEIGHT / 2 };

  const minTileX = Math.floor(topLeft.x / TILE_SIZE);
  const minTileY = Math.floor(topLeft.y / TILE_SIZE);
  const maxTileX = Math.floor((topLeft.x + MAP_WIDTH - 1) / TILE_SIZE);
  const maxTileY = Math.floor((topLeft.y + MAP_HEIGHT - 1) / TILE_SIZE);

  const tileCoords: { tileX: number; tileY: number }[] = [];
  for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
    for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
      tileCoords.push({ tileX, tileY });
    }
  }

  const tiles = await Promise.all(
    tileCoords.map(async ({ tileX, tileY }) => ({
      tileX,
      tileY,
      buffer: await fetchOsmTile(zoom, tileX, tileY),
    })),
  );

  const composites: sharp.OverlayOptions[] = tiles.map(({ tileX, tileY, buffer }) => ({
    input: buffer,
    left: Math.round(tileX * TILE_SIZE - topLeft.x),
    top: Math.round(tileY * TILE_SIZE - topLeft.y),
  }));

  const baseMap = await sharp({
    create: {
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      channels: 4,
      background: { r: 230, g: 240, b: 250, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return drawMapPinOverlay(baseMap);
}

/** Fetch a static map image and return a data URL suitable for @react-pdf/renderer. */
export async function fetchStaticMapAsDataUrl(
  lat: number,
  lon: number,
): Promise<string | null> {
  const googleUrl = buildStaticMapUrl(lat, lon);

  try {
    if (googleUrl) {
      const res = await fetchWithTimeout(googleUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
        next: { revalidate: 86400 },
        timeoutMs: 8_000,
      });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 0) {
          const contentType = res.headers.get("content-type")?.split(";")[0]?.trim();
          const mime =
            contentType && contentType.startsWith("image/")
              ? contentType
              : "image/png";
          return `data:${mime};base64,${buffer.toString("base64")}`;
        }
      }
    }

    const png = await composeOsmStaticMap(lat, lon);
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (err) {
    console.warn("[static-map] fetchStaticMapAsDataUrl failed", { lat, lon, err });
    return null;
  }
}

async function geocodeForMapResolution(
  listingAddress?: ListingAddress,
  addressQuery?: string,
): Promise<{ lat: number; lon: number } | null> {
  if (listingAddress) {
    const geocoded = await geocodeListingAddress(listingAddress, 8_000).catch(() => null);
    if (geocoded) return { lat: geocoded.lat, lon: geocoded.lon };
  }

  const query = addressQuery?.trim();
  if (!query || query.length < 6) return null;

  let geocoded = await geocodeAddress(query, 8_000).catch(() => null);
  if (!geocoded) {
    const postalMatch = query.match(
      /\b(\d{4,5})\s+([A-Za-zÀ-ÿÄÖÜäöüß\-]+(?:\s+[A-Za-zÀ-ÿÄÖÜäöüß\-]+)*)/,
    );
    if (postalMatch) {
      geocoded = await geocodeAddress(
        `${postalMatch[1]} ${postalMatch[2].trim()}, Germany`,
        8_000,
      ).catch(() => null);
    }
  }

  return geocoded ? { lat: geocoded.lat, lon: geocoded.lon } : null;
}

/**
 * Always geocode the listing address and fetch a fresh map for PDF rendering.
 * Ignores any client-supplied mapDataUrl to prevent stale/wrong-location tiles.
 */
export async function resolvePdfMapDataUrl(input: {
  listingAddress?: ListingAddress;
  addressQuery?: string;
  locationCoords?: { lat: number; lon: number } | null;
}): Promise<string | undefined> {
  let coords = input.locationCoords ?? null;

  if (coords) {
    const geocoded = await geocodeForMapResolution(input.listingAddress, input.addressQuery);
    if (geocoded) {
      const latDiff = Math.abs(geocoded.lat - coords.lat);
      const lonDiff = Math.abs(geocoded.lon - coords.lon);
      if (latDiff > 0.05 || lonDiff > 0.05) {
        console.warn("[static-map] Ignoring stale locationCoords; re-geocoding address", {
          cached: coords,
          geocoded,
        });
        coords = geocoded;
      }
    }
  } else {
    coords = await geocodeForMapResolution(input.listingAddress, input.addressQuery);
  }

  if (!coords) {
    console.warn("[static-map] Could not geocode address for PDF map", input.addressQuery);
    return undefined;
  }

  const resolved = await fetchStaticMapAsDataUrl(coords.lat, coords.lon);
  return resolved ?? undefined;
}
