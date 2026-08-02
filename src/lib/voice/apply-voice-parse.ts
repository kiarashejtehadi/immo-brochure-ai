import { sanitizeNumericInput } from "@/lib/numeric-input";
import {
  validatePositiveAmount,
  validateRooms,
  validateSize,
} from "@/lib/listing-spec-validation";
import type { ListingAddress, PropertyDetails, RentFormData } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";

function pickString(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function applyVoiceParseResult(
  parsed: VoiceParseResult,
  handlers: {
    onAddress: (patch: Partial<ListingAddress>) => void;
    onSize: (value: string) => void;
    onRooms: (value: string) => void;
    onProperty: (patch: Partial<PropertyDetails>) => void;
    onRent: (patch: Partial<RentFormData>) => void;
  },
): number {
  let applied = 0;

  const streetAddress = pickString(parsed.streetAddress);
  const postalCode = pickString(parsed.postalCode);
  const city = pickString(parsed.city);
  const addressPatch: Partial<ListingAddress> = {};
  if (streetAddress) addressPatch.streetAddress = streetAddress;
  if (postalCode) addressPatch.postalCode = postalCode;
  if (city) addressPatch.city = city;
  if (Object.keys(addressPatch).length > 0) {
    handlers.onAddress(addressPatch);
    applied += Object.keys(addressPatch).length;
  }

  const size = pickString(parsed.size);
  if (size && validateSize(sanitizeNumericInput(size)) !== null) {
    handlers.onSize(sanitizeNumericInput(size));
    applied += 1;
  }

  const rooms = pickString(parsed.rooms);
  if (rooms && validateRooms(sanitizeNumericInput(rooms)) !== null) {
    handlers.onRooms(sanitizeNumericInput(rooms));
    applied += 1;
  }

  const floorLevel = pickString(parsed.floorLevel);
  if (floorLevel) {
    handlers.onProperty({ floorLevel });
    applied += 1;
  }

  const netRent = pickString(parsed.netRent);
  if (netRent && validatePositiveAmount(sanitizeNumericInput(netRent)) !== null) {
    handlers.onRent({ netColdRent: sanitizeNumericInput(netRent) });
    applied += 1;
  }

  const utilityCharges = pickString(parsed.utilityCharges);
  if (
    utilityCharges &&
    validatePositiveAmount(sanitizeNumericInput(utilityCharges)) !== null
  ) {
    handlers.onRent({ utilityCharges: sanitizeNumericInput(utilityCharges) });
    applied += 1;
  }

  return applied;
}
