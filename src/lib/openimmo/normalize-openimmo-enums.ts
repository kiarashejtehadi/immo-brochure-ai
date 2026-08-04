import type {
  EnergyCertificateType,
  EnergyClass,
  HeatingSource,
  PropertyCondition,
  PropertyDetails,
  PropertyType,
  EnergyFormData,
} from "@/types/listing";
import type { OpenImmoImportResult } from "@/types/openimmo-import";
import { getText, getValue, textValue } from "@/lib/openimmo/xml-node-utils";

const PROPERTY_TYPES = new Set<PropertyType>([
  "apartment",
  "house",
  "penthouse",
  "commercial",
  "land",
]);

const HEATING_SOURCES = new Set<HeatingSource>([
  "heat_pump",
  "district_heating",
  "gas",
  "oil",
  "electricity",
  "solar",
  "wood_pellets",
]);

const CONDITIONS = new Set<PropertyCondition>([
  "first_occupancy",
  "modernized",
  "well_maintained",
  "needs_renovation",
]);

const ENERGY_CLASSES = new Set<EnergyClass>(["A+", "A", "B", "C", "D", "E", "F", "G", "H"]);

const CERTIFICATE_TYPES = new Set<EnergyCertificateType>(["consumption", "demand", "na"]);

function upper(value: unknown): string {
  return textValue(value).toUpperCase();
}

/** Map raw OpenImmo heating / energy carrier strings to UI `HeatingSource` keys. */
export function normalizeHeatingType(xmlValue: string | undefined): HeatingSource | "" {
  if (!xmlValue?.trim()) return "";
  const val = xmlValue.trim().toUpperCase();

  if (val.includes("WAERMEPUMPE") || val.includes("WARMEPUMPE") || val.includes("PUMPE")) {
    return "heat_pump";
  }
  if (val.includes("FERN") || val.includes("FERNWAERME") || val.includes("DISTRICT")) {
    return "district_heating";
  }
  if (val.includes("PELLET") || val.includes("HOLZ") || val.includes("WOOD")) {
    return "wood_pellets";
  }
  if (val.includes("SOLAR")) return "solar";
  if (val.includes("STROM") || val.includes("ELEKTRO") || val.includes("ELECTRIC")) {
    return "electricity";
  }
  if (val.includes("OEL") || val.includes("ÖL") || val.includes("OIL")) return "oil";
  if (
    val.includes("ZENTRAL") ||
    val.includes("ZENTRALHEIZUNG") ||
    val.includes("ETAGEN") ||
    val.includes("ETAGENHEIZUNG") ||
    val.includes("FUSSBODEN") ||
    val.includes("GAS")
  ) {
    return "gas";
  }

  return "";
}

/** Map OpenImmo `objektkategorie.objektart` structure to UI `PropertyType` keys. */
export function normalizePropertyType(immobilie: Record<string, unknown>): PropertyType | "" {
  const objKategorie = getValue(immobilie, "objektkategorie") as Record<string, unknown> | undefined;
  const objArt = (getValue(objKategorie, "objektart") ?? getValue(immobilie, "objektart")) as
    | Record<string, unknown>
    | undefined;

  if (objArt && typeof objArt === "object") {
    const wohnung = getValue(objArt, "wohnung") as Record<string, unknown> | undefined;
    if (wohnung !== undefined) {
      const type = upper(getValue(wohnung, "wohnungtyp"));
      if (type.includes("PENTHOUSE")) return "penthouse";
      if (type.includes("DACHGESCHOSS") || type.includes("DG")) return "penthouse";
      if (type.includes("MAISONETTE")) return "apartment";
      if (type.includes("ERDGESCHOSS") || type.includes("EG")) return "apartment";
      return "apartment";
    }

    const haus = getValue(objArt, "haus") as Record<string, unknown> | undefined;
    if (haus !== undefined) {
      const type = upper(getValue(haus, "haustyp"));
      if (type.includes("GEWERBE") || type.includes("COMMERCIAL")) return "commercial";
      return "house";
    }

    if (getValue(objArt, "grundstueck") !== undefined) return "land";
    if (getValue(objArt, "zimmer") !== undefined) return "apartment";
    if (getValue(objArt, "buero_praxen") !== undefined || getValue(objArt, "gewerbe") !== undefined) {
      return "commercial";
    }
  }

  return normalizePropertyTypeFromText(
    getText(objArt, "wohnungtyp") || getText(objArt, "objektart") || getText(objArt, "objektart_zusatz"),
  );
}

function normalizePropertyTypeFromText(value: string): PropertyType | "" {
  if (!value.trim()) return "";
  const val = value.trim().toUpperCase();

  if (val.includes("PENTHOUSE") || val.includes("DACHGESCHOSS") || val.includes("DG")) {
    return "penthouse";
  }
  if (val.includes("WOHNUNG") || val.includes("APARTMENT") || val.includes("MAISONETTE")) {
    return "apartment";
  }
  if (val.includes("HAUS") || val.includes("VILLA") || val.includes("REIHEN") || val.includes("DOPPEL")) {
    return "house";
  }
  if (val.includes("GEWERBE") || val.includes("COMMERCIAL") || val.includes("BUERO")) {
    return "commercial";
  }
  if (val.includes("GRUNDST") || val.includes("LAND")) return "land";

  return "";
}

/** Map raw OpenImmo condition strings to UI `PropertyCondition` keys. */
export function normalizeCondition(xmlValue: string | undefined): PropertyCondition | "" {
  if (!xmlValue?.trim()) return "";
  const val = xmlValue.trim().toUpperCase();

  if (val.includes("NEUBAU") || val.includes("ERSTBEZUG") || val.includes("FIRST")) {
    return "first_occupancy";
  }
  if (val.includes("RENOVIERUNGSBEDUERFTIG") || val.includes("BEDARF") || val.includes("NEED")) {
    return "needs_renovation";
  }
  if (val.includes("SANIERT") || val.includes("MODERNISIERT") || val.includes("MODERN")) {
    return "modernized";
  }
  if (val.includes("GEPFLEGT") || val.includes("MAINTAIN")) return "well_maintained";

  return "";
}

export function normalizeEnergyClass(xmlValue: string | undefined): EnergyClass | "" {
  if (!xmlValue?.trim()) return "";
  const normalized = xmlValue.trim().toUpperCase().replace(/\s+/g, "");
  return ENERGY_CLASSES.has(normalized as EnergyClass) ? (normalized as EnergyClass) : "";
}

export function normalizeCertificateType(xmlValue: string | undefined): EnergyCertificateType {
  if (!xmlValue?.trim()) return "na";
  const val = xmlValue.trim().toUpperCase();
  if (val.includes("VERBRAUCH") || val.includes("CONSUMPTION")) return "consumption";
  if (val.includes("BEDARF") || val.includes("DEMAND")) return "demand";
  return "na";
}

function sanitizePropertyType(value: unknown): PropertyType | "" {
  const normalized =
    typeof value === "string" && PROPERTY_TYPES.has(value as PropertyType)
      ? (value as PropertyType)
      : normalizePropertyTypeFromText(textValue(value));
  return normalized;
}

function sanitizeHeatingSource(value: unknown): HeatingSource | "" {
  const normalized =
    typeof value === "string" && HEATING_SOURCES.has(value as HeatingSource)
      ? (value as HeatingSource)
      : normalizeHeatingType(textValue(value));
  return normalized;
}

function sanitizeCondition(value: unknown): PropertyCondition | "" {
  const normalized =
    typeof value === "string" && CONDITIONS.has(value as PropertyCondition)
      ? (value as PropertyCondition)
      : normalizeCondition(textValue(value));
  return normalized;
}

function sanitizeEnergyClass(value: unknown): EnergyClass | "" {
  const normalized =
    typeof value === "string" && ENERGY_CLASSES.has(value as EnergyClass)
      ? (value as EnergyClass)
      : normalizeEnergyClass(textValue(value));
  return normalized;
}

function sanitizeCertificateType(value: unknown): EnergyCertificateType {
  const normalized =
    typeof value === "string" && CERTIFICATE_TYPES.has(value as EnergyCertificateType)
      ? (value as EnergyCertificateType)
      : normalizeCertificateType(textValue(value));
  return normalized;
}

/** Ensure imported enum fields only contain values accepted by form `<select>` components. */
export function sanitizeOpenImmoImportResult(data: OpenImmoImportResult): OpenImmoImportResult {
  const property: Partial<PropertyDetails> = {
    ...data.property,
    propertyType: sanitizePropertyType(data.property?.propertyType),
    condition: sanitizeCondition(data.property?.condition),
  };

  const energy: Partial<EnergyFormData> = {
    ...data.energy,
    certificateType: sanitizeCertificateType(data.energy?.certificateType),
    energyClass: sanitizeEnergyClass(data.energy?.energyClass),
    heatingSource: sanitizeHeatingSource(data.energy?.heatingSource),
  };

  return {
    ...data,
    property,
    energy,
  };
}
