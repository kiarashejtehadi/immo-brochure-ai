import type { ListingAddress } from "@/types/listing";
import type { UiLocale } from "@/lib/i18n";

export const DEFAULT_LISTING_ADDRESS: ListingAddress = {
  streetAddress: "",
  postalCode: "",
  city: "",
  country: "Germany",
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

/** `${streetAddress}, ${postalCode} ${city}, ${country}` */
export function formatListingAddress(address: ListingAddress): string {
  const street = address.streetAddress.trim();
  const postalCity = [address.postalCode.trim(), address.city.trim()]
    .filter(Boolean)
    .join(" ");
  const country = address.country.trim();

  return [street, postalCity, country].filter(Boolean).join(", ");
}

export function isListingAddressComplete(address: ListingAddress): boolean {
  return (
    address.streetAddress.trim() !== "" &&
    address.city.trim() !== "" &&
    address.country.trim() !== ""
  );
}

/** Accept legacy single-line address strings from older clients. */
export function normalizeListingAddress(raw: unknown): ListingAddress {
  if (raw && typeof raw === "object" && "streetAddress" in raw) {
    const value = raw as ListingAddress;
    return {
      streetAddress: String(value.streetAddress ?? "").trim(),
      postalCode: String(value.postalCode ?? "").trim(),
      city: String(value.city ?? "").trim(),
      country: String(value.country ?? "Germany").trim() || "Germany",
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

    const postalMatch = cityPart.match(/^(\d{4,5})\s+(.+)$/);
    if (postalMatch) {
      return {
        streetAddress: streetPart,
        postalCode: postalMatch[1],
        city: postalMatch[2],
        country,
      };
    }

    return {
      streetAddress: streetPart,
      postalCode: "",
      city: cityPart,
      country,
    };
  }

  const inlinePostal = trimmed.match(/^(.+?)\s+(\d{4,5})\s+(.+)$/);
  if (inlinePostal) {
    return {
      streetAddress: inlinePostal[1].trim(),
      postalCode: inlinePostal[2],
      city: inlinePostal[3].trim(),
      country: "Germany",
    };
  }

  return {
    streetAddress: trimmed,
    postalCode: "",
    city: "",
    country: "Germany",
  };
}
