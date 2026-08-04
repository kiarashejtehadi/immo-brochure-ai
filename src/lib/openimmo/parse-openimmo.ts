import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { TransactionType } from "@/types/listing";
import type { OpenImmoImportResult, OpenImmoImportedImage } from "@/types/openimmo-import";
import {
  normalizeCertificateType,
  normalizeCondition,
  normalizeEnergyClass,
  normalizeHeatingType,
  normalizePropertyType,
} from "@/lib/openimmo/normalize-openimmo-enums";

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  parseTagValue: true,
  removeNSPrefix: true,
});

function toArray<T>(val: T | T[] | null | undefined): T[] {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

function getOpenImmoRoot(parsedXml: Record<string, unknown>): Record<string, unknown> {
  const root =
    parsedXml.openimmo ??
    parsedXml["openimmo:openimmo"] ??
    (parsedXml.immobilie || parsedXml.anbieter ? parsedXml : undefined);

  if (!root || typeof root !== "object") {
    throw new Error("Invalid XML: Root <openimmo> tag not found.");
  }

  return root as Record<string, unknown>;
}

function mapOpenImmoToAppState(
  immobilie: Record<string, unknown>,
  root: Record<string, unknown>,
): OpenImmoImportResult {
  const geo = (immobilie.geo ?? immobilie.geowesentliche ?? {}) as Record<string, unknown>;
  const preise = (immobilie.preise ?? {}) as Record<string, unknown>;
  const freitexte = (immobilie.freitexte ?? {}) as Record<string, unknown>;
  const flaechen = (immobilie.flaechen ?? immobilie.flaeche ?? {}) as Record<string, unknown>;
  const zustand = (immobilie.zustand_angaben ?? {}) as Record<string, unknown>;
  const energiepass = (zustand.energiepass ?? {}) as Record<string, unknown>;
  const uebertragung = root.uebertragung as Record<string, unknown> | undefined;
  const objektart = immobilie.objektart as Record<string, unknown> | undefined;

  const transactionType = mapTransactionType(
    firstText(
      uebertragung?.uebertragungsart,
      objektart?.vermarktungsart,
      pickNode(immobilie, "objektart", "vermarktungsart"),
    ),
  );

  const street = [firstText(geo.strasse, pickNode(geo, "strasse")), firstText(geo.hausnummer)]
    .filter(Boolean)
    .join(" ")
    .trim();

  const energyValue = firstText(
    energiepass.endenergiebedarf,
    energiepass.energieverbrauchkennwert,
    energiepass.endenergieverbrauch,
    energiepass.energieverbrauch,
  );

  const importId = firstText(
    pickNode(immobilie, "verwaltung_techn", "objektnr_extern"),
    pickNode(immobilie, "verwaltung_techn", "objektnr_intern"),
    pickNode(immobilie, "verwaltung_techn", "objektnr"),
  );

  return {
    importId: importId || undefined,
    title: firstText(freitexte.objekttitel, freitexte.objekttitle),
    transactionType,
    address: {
      streetAddress: street,
      postalCode: firstText(geo.plz, pickNode(geo, "plz")),
      city: firstText(geo.ort, pickNode(geo, "ort")),
      country: firstText(geo.land, pickNode(geo, "land")) || "Germany",
    },
    size: normalizeDecimal(firstText(flaechen.wohnflaeche, flaechen.gesamtflaeche)),
    rooms: normalizeDecimal(firstText(geo.anzahl_zimmer, pickNode(geo, "anzahl_zimmer"))),
    property: {
      propertyType: normalizePropertyType(immobilie),
      floorLevel: firstText(geo.etage, pickNode(geo, "etage")),
      condition: normalizeCondition(firstText(zustand.zustand, zustand.zustand_art)),
    },
    rent: {
      netColdRent: normalizeDecimal(firstText(preise.kaltmiete)),
      utilityCharges: normalizeDecimal(firstText(preise.nebenkosten)),
      totalRent: normalizeDecimal(firstText(preise.warmmiete)),
      securityDeposit: firstText(preise.kaution, preise.kaution_text),
    },
    sale: {
      purchasePrice: normalizeDecimal(firstText(preise.kaufpreis)),
      hoaFee: normalizeDecimal(firstText(preise.hausgeld)),
    },
    energy: {
      certificateType: normalizeCertificateType(firstText(energiepass.art, energiepass.epart)),
      energyClass: normalizeEnergyClass(
        firstText(energiepass.energieeffizienzklasse, energiepass.wertklasse),
      ),
      energyValue: normalizeDecimal(energyValue),
      heatingSource: normalizeHeatingType(
        firstText(energiepass.energietraeger, energiepass.primaerenergietraeger, zustand.energietraeger),
      ),
      constructionYear: firstText(zustand.baujahr, zustand.baujahr_antrag),
    },
    description: firstText(freitexte.objektbeschreibung),
    locationText: firstText(freitexte.lage, freitexte.lagebeschreibung),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function pushImmobilieNodes(target: Record<string, unknown>[], items: unknown) {
  for (const item of toArray(items)) {
    if (isRecord(item)) target.push(item);
  }
}

/** Collect every `<immobilie>` node, with or without an `<immobilien>` wrapper. */
export function extractAllImmobilien(parsedXml: unknown): Record<string, unknown>[] {
  if (!parsedXml || typeof parsedXml !== "object") {
    throw new Error("Invalid XML: Root <openimmo> tag not found.");
  }

  const doc = parsedXml as Record<string, unknown>;
  const root = getOpenImmoRoot(doc);
  const rawProperties: Record<string, unknown>[] = [];

  for (const anbieter of toArray(root.anbieter)) {
    if (!isRecord(anbieter)) continue;

    // Direct <immobilie> children under <anbieter>
    if (anbieter.immobilie !== undefined) {
      pushImmobilieNodes(rawProperties, anbieter.immobilie);
    }

    // Wrapped inside <immobilien><immobilie> (single wrapper or array of wrappers)
    const immobilienNode = anbieter.immobilien;
    if (immobilienNode !== undefined) {
      if (isRecord(immobilienNode) && immobilienNode.immobilie !== undefined) {
        pushImmobilieNodes(rawProperties, immobilienNode.immobilie);
      } else {
        for (const block of toArray(immobilienNode)) {
          if (isRecord(block) && block.immobilie !== undefined) {
            pushImmobilieNodes(rawProperties, block.immobilie);
          }
        }
      }
    }
  }

  // Fallbacks for exports that place <immobilie> directly under <openimmo> or document root
  pushImmobilieNodes(rawProperties, root.immobilie);
  pushImmobilieNodes(rawProperties, doc.immobilie);

  return rawProperties;
}

export function parseAllImmobilien(parsedXml: unknown): OpenImmoImportResult[] {
  if (!parsedXml || typeof parsedXml !== "object") {
    throw new Error("Invalid OpenImmo XML structure.");
  }

  const doc = parsedXml as Record<string, unknown>;
  const root = getOpenImmoRoot(doc);
  const rawProperties = extractAllImmobilien(parsedXml);

  if (rawProperties.length === 0) {
    throw new Error("No OpenImmo property (immobilie) found in XML.");
  }

  return rawProperties.map((rawImm, index) => {
    const mapped = mapOpenImmoToAppState(rawImm, root);
    mapped.importIndex = index;
    return mapped;
  });
}

/** Normalize single objects or arrays and return the first `<immobilie>` node. */
export function extractImmobilie(parsedXml: unknown): Record<string, unknown> {
  const properties = extractAllImmobilien(parsedXml);
  if (properties.length === 0) {
    throw new Error("No OpenImmo property (immobilie) found in XML.");
  }
  return properties[0];
}

function textValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (typeof value === "object" && value !== null && "#text" in value) {
    return textValue((value as { "#text": unknown })["#text"]);
  }
  return "";
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return "";
}

function pickNode(root: unknown, ...paths: string[]): unknown {
  if (!root || typeof root !== "object") return undefined;
  let current: unknown = root;
  for (const segment of paths) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function normalizeDecimal(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return trimmed;
  return String(num % 1 === 0 ? num : Math.round(num * 100) / 100);
}

function mapTransactionType(value: string): TransactionType | undefined {
  const upper = value.trim().toUpperCase();
  if (
    upper.includes("MIETE") ||
    upper.includes("PACHT") ||
    upper === "KR_MIETE" ||
    upper === "MIETE_PACHT"
  ) {
    return "rent";
  }
  if (upper.includes("KAUF") || upper === "KR_KAUF") {
    return "sale";
  }
  return undefined;
}

function collectAnhangPaths(immobilie: Record<string, unknown>): string[] {
  const paths: string[] = [];
  const anhaenge = toArray(
    pickNode(immobilie, "anhaenge", "anhang") ??
      pickNode(immobilie, "anhang") ??
      pickNode(immobilie, "anhaenge"),
  );

  for (const entry of anhaenge) {
    if (!entry || typeof entry !== "object") continue;
    const node = entry as Record<string, unknown>;
    const pfad = firstText(
      pickNode(node, "daten", "pfad"),
      node.pfad,
      pickNode(node, "pfad"),
    );
    if (pfad) paths.push(pfad.replace(/\\/g, "/"));
  }
  return paths;
}

function mimeFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function extractImagesFromZip(
  zip: JSZip,
  referencedPaths: string[],
): Promise<OpenImmoImportedImage[]> {
  const images: OpenImmoImportedImage[] = [];
  const seen = new Set<string>();

  const tryAdd = async (path: string) => {
    const normalized = path.replace(/\\/g, "/").replace(/^\.?\//, "");
    if (!IMAGE_EXT.test(normalized) || seen.has(normalized.toLowerCase())) return;

    const file =
      zip.file(normalized) ??
      zip.file(normalized.split("/").pop() ?? "") ??
      Object.values(zip.files).find(
        (f) => !f.dir && f.name.replace(/\\/g, "/").toLowerCase().endsWith(normalized.toLowerCase()),
      );

    if (!file || file.dir) return;
    const data = await file.async("uint8array");
    if (data.length === 0) return;

    const filename = normalized.split("/").pop() ?? "image.jpg";
    seen.add(normalized.toLowerCase());
    images.push({
      filename,
      mimeType: mimeFromFilename(filename),
      base64: Buffer.from(data).toString("base64"),
    });
  };

  for (const path of referencedPaths) {
    await tryAdd(path);
  }

  if (images.length === 0) {
    for (const entry of Object.values(zip.files)) {
      if (entry.dir || !IMAGE_EXT.test(entry.name)) continue;
      await tryAdd(entry.name);
      if (images.length >= 10) break;
    }
  }

  return images.slice(0, 10);
}

export function parseOpenImmoXml(xml: string): OpenImmoImportResult {
  let parsed: unknown;
  try {
    parsed = xmlParser.parse(xml);
  } catch {
    throw new Error("Invalid OpenImmo XML.");
  }

  const properties = parseAllImmobilien(parsed);
  return properties[0];
}

function parseOpenImmoXmlAll(xml: string): OpenImmoImportResult[] {
  let parsed: unknown;
  try {
    parsed = xmlParser.parse(xml);
  } catch {
    throw new Error("Invalid OpenImmo XML.");
  }

  return parseAllImmobilien(parsed);
}

export async function parseOpenImmoUpload(
  buffer: Buffer,
  filename: string,
): Promise<OpenImmoImportResult[]> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".xml")) {
    const xml = buffer.toString("utf8");
    if (!xml.includes("openimmo") && !xml.includes("immobilie")) {
      throw new Error("File does not appear to be a valid OpenImmo XML export.");
    }
    return parseOpenImmoXmlAll(xml);
  }

  if (lower.endsWith(".zip")) {
    const zip = await JSZip.loadAsync(buffer);
    const xmlEntry = Object.values(zip.files)
      .filter((f) => !f.dir && f.name.toLowerCase().endsWith(".xml"))
      .sort((a, b) => {
        const aScore = a.name.toLowerCase().includes("openimmo") ? 0 : 1;
        const bScore = b.name.toLowerCase().includes("openimmo") ? 0 : 1;
        return aScore - bScore || a.name.length - b.name.length;
      })[0];

    if (!xmlEntry) {
      throw new Error("No XML file found inside ZIP archive.");
    }

    const xml = await xmlEntry.async("string");
    const parsedDoc = xmlParser.parse(xml) as Record<string, unknown>;
    const properties = parseAllImmobilien(parsedDoc);
    const immobilien = extractAllImmobilien(parsedDoc);

    for (let i = 0; i < properties.length; i += 1) {
      const referencedPaths = collectAnhangPaths(immobilien[i]);
      const images = await extractImagesFromZip(zip, referencedPaths);
      if (images.length > 0) {
        properties[i].images = images;
      }
    }

    return properties;
  }

  throw new Error("Unsupported file type. Please upload .xml or .zip.");
}
