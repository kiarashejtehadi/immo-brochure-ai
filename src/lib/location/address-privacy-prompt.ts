import type { OutputLanguage } from "@/lib/i18n";
import type { AddressDataPayload } from "@/types/listing";
import { resolvePublicAreaLabel } from "@/lib/location/format-address";
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

  if (!addressData.hideExactAddress) {
    return `ADDRESS IN GENERATED COPY:
- hideExactAddress is false — you may reference the street address naturally in title or fullDescription when it supports the marketing narrative.
- Prefer district/neighborhood phrasing in locationDescription; do not paste the full address repeatedly.
- addressData (for context only): ${JSON.stringify(addressData)}`;
  }

  const germanRules =
    outputLanguage === "German"
      ? `- NEVER mention street name ("${addressData.street}"), house number ("${addressData.houseNumber}"), or unit/floor ("${addressData.unitNumber}") in title, fullDescription, locationDescription, or socialCaptions.
- Use district-level phrasing instead — e.g. "${areaLabel}" or "Berlin-Charlottenburg (10585)".
- Good: "Die Wohnung befindet sich in begehrter Lage in ${areaLabel}."
- Bad (NEVER): "${addressData.street} ${addressData.houseNumber}" or "Wohnung in der ${addressData.street}."
- The full address in addressData is provided ONLY to improve your understanding of connectivity — do NOT quote it in output.`
      : `- NEVER mention street name ("${addressData.street}"), house number ("${addressData.houseNumber}"), or unit/floor ("${addressData.unitNumber}") in title, fullDescription, locationDescription, or socialCaptions.
- Use district-level phrasing instead — e.g. "${areaLabel}".
- The full address in addressData is for connectivity context only — do NOT quote it in output.`;

  return `ADDRESS PRIVACY (MANDATORY — hideExactAddress: true):
${germanRules}
addressData: ${JSON.stringify(addressData, null, 2)}`;
}
