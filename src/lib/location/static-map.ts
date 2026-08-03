import sharp from "sharp";

const MAP_WIDTH = 600;
const MAP_HEIGHT = 280;
const TILE_SIZE = 256;
const OSM_TILE_URL = "https://tile.openstreetmap.org";
const USER_AGENT = "immo-brochure-ai/1.0 (real-estate-expose-generator)";

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

  const url = `${OSM_TILE_URL}/${z}/${wrappedX}/${y}.png`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "image/png" },
  });
  if (!res.ok) {
    throw new Error(`Tile fetch failed: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
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

async function composeOsmStaticMap(lat: number, lon: number): Promise<Buffer> {
  const zoom = 15;
  const center = lonLatToWorldPixel(lon, lat, zoom);
  const topLeft = { x: center.x - MAP_WIDTH / 2, y: center.y - MAP_HEIGHT / 2 };

  const minTileX = Math.floor(topLeft.x / TILE_SIZE);
  const minTileY = Math.floor(topLeft.y / TILE_SIZE);
  const maxTileX = Math.floor((topLeft.x + MAP_WIDTH - 1) / TILE_SIZE);
  const maxTileY = Math.floor((topLeft.y + MAP_HEIGHT - 1) / TILE_SIZE);

  const composites: sharp.OverlayOptions[] = [];

  for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
    for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
      const tileBuffer = await fetchOsmTile(zoom, tileX, tileY);
      composites.push({
        input: tileBuffer,
        left: Math.round(tileX * TILE_SIZE - topLeft.x),
        top: Math.round(tileY * TILE_SIZE - topLeft.y),
      });
    }
  }

  const pinSvg = Buffer.from(
    `<svg width="${MAP_WIDTH}" height="${MAP_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${MAP_WIDTH / 2}" cy="${MAP_HEIGHT / 2}" r="9" fill="#dc2626" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="${MAP_WIDTH / 2}" cy="${MAP_HEIGHT / 2}" r="3.5" fill="#ffffff"/>
    </svg>`,
  );
  composites.push({ input: pinSvg, left: 0, top: 0 });

  return sharp({
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
}

/** Fetch a static map image and return a data URL suitable for @react-pdf/renderer. */
export async function fetchStaticMapAsDataUrl(
  lat: number,
  lon: number,
): Promise<string | null> {
  const googleUrl = buildStaticMapUrl(lat, lon);

  try {
    if (googleUrl) {
      const res = await fetch(googleUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
        next: { revalidate: 86400 },
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
  } catch {
    return null;
  }
}
