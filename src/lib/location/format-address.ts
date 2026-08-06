import type { AddressDataPayload, ListingAddress } from "@/types/listing";
import type { UiLocale } from "@/lib/i18n";

export const DEFAULT_LISTING_ADDRESS: ListingAddress = {
  streetAddress: "",
  houseNumber: "",
  unitNumber: "",
  postalCode: "",
  city: "",
  country: "Germany",
  hideExactAddress: false,
};

export const LISTING_COUNTRY_OPTIONS = [
  "Germany",
  "Austria",
  "Switzerland",
  "France",
  "Netherlands",
  "Italy",
  "Spain",
  "Poland",
  "United Kingdom",
] as const;

const LOCALE_DEFAULT_COUNTRY: Partial<Record<UiLocale, string>> = {
  de: "Germany",
  fr: "France",
  es: "Spain",
  it: "Italy",
  nl: "Netherlands",
  pl: "Poland",
};

export function getDefaultCountryForLocale(locale: UiLocale): string {
  return LOCALE_DEFAULT_COUNTRY[locale] ?? "Germany";
}

/** Well-known Berlin district labels derived from postal code (display / prompt guidance). */
export function berlinDistrictLabel(postalCode: string): string | undefined {
  const pc = postalCode.trim();
  if (pc.startsWith("105") || pc.startsWith("106")) return "Charlottenburg";
  if (pc.startsWith("140")) return "Charlottenburg";
  if (pc.startsWith("101") || pc.startsWith("104")) return "Mitte";
  if (pc.startsWith("102") || pc.startsWith("109")) return "Friedrichshain-Kreuzberg";
  if (pc.startsWith("103")) return "Prenzlauer Berg";
  if (pc.startsWith("107") || pc.startsWith("108")) return "Tempelhof-Schöneberg";
  if (pc.startsWith("120") || pc.startsWith("121")) return "Neukölln";
  if (pc.startsWith("130") || pc.startsWith("131")) return "Pankow";
  return undefined;
}

export function resolvePublicAreaLabel(
  address: ListingAddress,
  districtContext?: string,
): string {
  const city = address.city.trim();
  const postalCode = address.postalCode.trim();
  const context = (districtContext ?? "").trim();

  if (context) {
    const districtFromContext = context
      .replace(postalCode, "")
      .replace(city, "")
      .trim();
    if (districtFromContext && districtFromContext !== city) {
      return city ? `${city}-${districtFromContext}` : districtFromContext;
    }
  }

  const cityLower = city.toLowerCase();
  if (cityLower.includes("berlin")) {
    const berlinDistrict = berlinDistrictLabel(postalCode);
    if (berlinDistrict) return `Berlin-${berlinDistrict}`;
  }

  if (postalCode && city) return `${postalCode} ${city}`;
  return city || postalCode || "";
}

function splitLegacyStreetLine(streetLine: string): {
  streetAddress: string;
  houseNumber: string;
} {
  const trimmed = streetLine.trim();
  const match = trimmed.match(/^(.+?)\s+(\d+[a-zA-Z]?)$/);
  if (match) {
    return { streetAddress: match[1].trim(), houseNumber: match[2].trim() };
  }
  return { streetAddress: trimmed, houseNumber: "" };
}

/** Street line for geocoding — always includes house number and unit when provided. */
export function buildStreetLine(address: ListingAddress): string {
  const street = address.streetAddress.trim();
  const house = address.houseNumber.trim();
  const unit = address.unitNumber.trim();
  const line1 = [street, house].filter(Boolean).join(" ");
  if (!line1 && !unit) return "";
  if (unit) return line1 ? `${line1}, ${unit}` : unit;
  return line1;
}

export function hasStreetLevelInput(address: ListingAddress): boolean {
  return buildStreetLine(address).length > 0;
}

/** Full address string for geocoding / map queries — never masked. */
export function formatFullListingAddress(address: ListingAddress): string {
  const street = buildStreetLine(address);
  const postalCity = [address.postalCode.trim(), address.city.trim()]
    .filter(Boolean)
    .join(" ");
  const country = address.country.trim();

  return [street, postalCity, country].filter(Boolean).join(", ");
}

/** @deprecated Alias for formatFullListingAddress — used by geocoding paths. */
export function formatListingAddress(address: ListingAddress): string {
  return formatFullListingAddress(address);
}

/** Address shown in PDF and public-facing UI — respects hideExactAddress. */
export function formatPublicListingAddress(
  address: ListingAddress,
  districtContext?: string,
): string {
  const postalCity = [address.postalCode.trim(), address.city.trim()]
    .filter(Boolean)
    .join(" ");
  const country = address.country.trim();

  if (address.hideExactAddress) {
    const area = resolvePublicAreaLabel(address, districtContext);
    return [area, country].filter(Boolean).join(", ");
  }

  return formatFullListingAddress(address);
}

export function buildAddressDataPayload(address: ListingAddress): AddressDataPayload {
  return {
    street: address.streetAddress.trim(),
    houseNumber: address.houseNumber.trim(),
    unitNumber: address.unitNumber.trim(),
    zipCode: address.postalCode.trim(),
    city: address.city.trim(),
    hideExactAddress: address.hideExactAddress === true,
  };
}

export function isListingAddressComplete(address: ListingAddress): boolean {
  return (
    (hasStreetLevelInput(address) || address.postalCode.trim() !== "") &&
    address.city.trim() !== "" &&
    address.country.trim() !== ""
  );
}

/** Accept legacy single-line address strings from older clients. */
export function normalizeListingAddress(raw: unknown): ListingAddress {
  if (raw && typeof raw === "object" && "streetAddress" in raw) {
    const value = raw as Partial<ListingAddress>;
    let streetAddress = String(value.streetAddress ?? "").trim();
    let houseNumber = String(value.houseNumber ?? "").trim();
    const unitNumber = String(value.unitNumber ?? "").trim();

    if (streetAddress && !houseNumber) {
      const split = splitLegacyStreetLine(streetAddress);
      streetAddress = split.streetAddress;
      houseNumber = split.houseNumber;
    }

    return {
      streetAddress,
      houseNumber,
      unitNumber,
      postalCode: String(value.postalCode ?? "").trim(),
      city: String(value.city ?? "").trim(),
      country: String(value.country ?? "Germany").trim() || "Germany",
      hideExactAddress: value.hideExactAddress === true,
    };
  }

  if (typeof raw === "string" && raw.trim()) {
    return parseLegacyAddressString(raw);
  }

  return { ...DEFAULT_LISTING_ADDRESS };
}

function parseLegacyAddressString(line: string): ListingAddress {
  const trimmed = line.trim();
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const maybeCountry = LISTING_COUNTRY_OPTIONS.find(
      (c) => c.toLowerCase() === last.toLowerCase(),
    );
    const country = maybeCountry ?? "Germany";
    const cityPart = maybeCountry ? parts[parts.length - 2] : parts[parts.length - 1];
    const streetPart = maybeCountry
      ? parts.slice(0, -2).join(", ")
      : parts.slice(0, -1).join(", ");

    const split = splitLegacyStreetLine(streetPart);
    const postalMatch = cityPart.match(/^(\d{4,5})\s+(.+)$/);
    if (postalMatch) {
      return {
        streetAddress: split.streetAddress,
        houseNumber: split.houseNumber,
        unitNumber: "",
        postalCode: postalMatch[1],
        city: postalMatch[2],
        country,
        hideExactAddress: false,
      };
    }

    return {
      streetAddress: split.streetAddress,
      houseNumber: split.houseNumber,
      unitNumber: "",
      postalCode: "",
      city: cityPart,
      country,
      hideExactAddress: false,
    };
  }

  const inlinePostal = trimmed.match(/^(.+?)\s+(\d{4,5})\s+(.+)$/);
  if (inlinePostal) {
    const split = splitLegacyStreetLine(inlinePostal[1].trim());
    return {
      streetAddress: split.streetAddress,
      houseNumber: split.houseNumber,
      unitNumber: "",
      postalCode: inlinePostal[2],
      city: inlinePostal[3].trim(),
      country: "Germany",
      hideExactAddress: false,
    };
  }

  const split = splitLegacyStreetLine(trimmed);
  return {
    streetAddress: split.streetAddress,
    houseNumber: split.houseNumber,
    unitNumber: "",
    postalCode: "",
    city: "",
    country: "Germany",
    hideExactAddress: false,
  };
}
