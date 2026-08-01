import type { TransactionType } from "@/types/listing";

const MLS_CHAR_LIMIT = 500;

export function truncateMlsCaption(text: string, max = MLS_CHAR_LIMIT): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace > max * 0.65 ? cut.slice(0, lastSpace) : cut;
  return `${body.trim()}…`;
}

export function stripPlainSocialText(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[#*_~`[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractCityTokenFromAddress(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 1]
      .replace(/^\d{4,5}\s*/, "")
      .trim();
    const token = cityPart.split(/\s+/)[0]?.replace(/[^A-Za-zÀ-ÿ]/g, "");
    if (token && token.length > 2) return token;
  }

  const postalMatch = trimmed.match(/\b\d{4,5}\s+([A-Za-zÀ-ÿ\-]+)/);
  if (postalMatch?.[1]) return postalMatch[1];

  return null;
}

export function buildRealEstateHashtags(options: {
  address?: string;
  city?: string;
  transactionType?: TransactionType;
  propertyType?: string;
}): string[] {
  const city =
    options.city?.trim() ||
    (options.address ? extractCityTokenFromAddress(options.address) : null);
  const cityTag = city ? `#${city}RealEstate` : "#CityLiving";
  const rentOrSale =
    options.transactionType === "rent" ? "#ForRent" : "#ForSale";
  const typeTag =
    options.propertyType === "apartment"
      ? "#Apartment"
      : options.propertyType === "house"
        ? "#House"
        : "#Property";

  return [
    "#RealEstate",
    rentOrSale,
    "#JustListed",
    "#NewListing",
    typeTag,
    "#HomeSweetHome",
    "#PropertyListing",
    cityTag,
    "#RealEstateAgent",
    "#DreamHome",
  ].slice(0, 10);
}

export function formatInstagramWithHashtags(
  caption: string,
  hashtags: string[],
): string {
  const base = caption.trim();
  const tags = hashtags.join(" ");
  return base.includes(tags) ? base : `${base}\n\n${tags}`;
}
