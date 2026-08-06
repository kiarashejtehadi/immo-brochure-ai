import type { OutputLanguage } from "@/lib/i18n";
import type { AddressDataPayload } from "@/types/listing";
import {
  resolvePublicAreaLabel,
  shouldMaskHouseNumberInOutput,
} from "@/lib/location/format-address";
import type { ListingAddress } from "@/types/listing";

export function buildAddressPrivacyInstructions(
  address: ListingAddress,
  addressData: AddressDataPayload,
  outputLanguage: OutputLanguage,
  districtContext?: string,
): string {
  const areaLabel =
    resolvePublicAreaLabel(address, districtContext) ||
    addressData.city ||
    "the surrounding area";
  const maskHouse = shouldMaskHouseNumberInOutput(address);
  const streetExample = addressData.street || "Otto-Suhr-Allee";
  const maskedExample =
    areaLabel && areaLabel !== addressData.city
      ? `${streetExample}, ${areaLabel}`
      : `${streetExample}, ${addressData.city}`.replace(/,\s*$/, "").trim();

  const streetRule =
    outputLanguage === "German"
      ? `- Street name ("${addressData.street}") MUST appear naturally in title, fullDescription, locationDescription, and socialCaptions when provided — e.g. "an der ${streetExample}" or "in der ${streetExample}".`
      : `- Street name ("${addressData.street}") MUST appear naturally in title, fullDescription, locationDescription, and socialCaptions when provided — e.g. "on ${streetExample}" or "in ${streetExample}".`;

  if (!maskHouse) {
    return `ADDRESS IN GENERATED COPY:
${streetRule}
- hideExactHouseNumber is false and a house number is provided — you MAY include the house number in address phrasing (e.g. "${streetExample} ${addressData.houseNumber}").
- Prefer district/neighborhood context in locationDescription; do not paste the full address repeatedly.
- addressData (for context — full address used internally for transit/geocoding): ${JSON.stringify(addressData)}`;
  }

  const houseRule =
    outputLanguage === "German"
      ? `- DO NOT output the numeric house number ("${addressData.houseNumber}") in title, fullDescription, locationDescription, or socialCaptions.
- Good: "${maskedExample}" — Bad (NEVER): "${streetExample} ${addressData.houseNumber}".
- The full street + house number in addressData is for internal transit/geocoding context only — never quote the house number in output.`
      : `- DO NOT output the numeric house number ("${addressData.houseNumber}") in title, fullDescription, locationDescription, or socialCaptions.
- Good: "${maskedExample}" — Bad (NEVER): "${streetExample} ${addressData.houseNumber}".
- Full street + house number in addressData is for internal transit/geocoding only — never quote the house number in output.`;

  const reason =
    addressData.hideExactHouseNumber
      ? "hideExactHouseNumber is true"
      : "no house number was provided";

  return `ADDRESS PRIVACY — HOUSE NUMBER MASKING (MANDATORY — ${reason}):
${streetRule}
${houseRule}
addressData: ${JSON.stringify(addressData, null, 2)}`;
}
