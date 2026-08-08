import {
  validatePositiveAmountValue,
  validateRoomsValue,
  validateSizeValue,
} from "@/lib/listing-spec-validation";
import type { FeatureKey } from "@/lib/i18n";
import type { ListingAddress, PropertyDetails, RentFormData, TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";

function pickString(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function numberToFormValue(value: number | null | undefined): string | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Number.isInteger(value) ? String(value) : String(value);
}

export function applyVoiceParseResult(
  parsed: VoiceParseResult,
  currentTransactionType: TransactionType,
  handlers: {
    onTransactionType?: (type: TransactionType) => void;
    onAddress: (patch: Partial<ListingAddress>) => void;
    onSize: (value: string) => void;
    onRooms: (value: string) => void;
    onProperty: (patch: Partial<PropertyDetails>) => void;
    onRent: (patch: Partial<RentFormData>) => void;
    onFeatures?: (features: FeatureKey[]) => void;
  },
): number {
  let applied = 0;

  if (parsed.listingType && parsed.listingType !== currentTransactionType) {
    handlers.onTransactionType?.(parsed.listingType);
    applied += 1;
  }

  const activeTransactionType = parsed.listingType ?? currentTransactionType;

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

  const propertyPatch: Partial<PropertyDetails> = {};
  if (parsed.propertyType) propertyPatch.propertyType = parsed.propertyType;
  if (parsed.furnishingStatus) propertyPatch.furnishingStatus = parsed.furnishingStatus;
  if (parsed.parking) propertyPatch.parking = parsed.parking;

  const floorLevel = pickString(parsed.floorLevel);
  if (floorLevel) propertyPatch.floorLevel = floorLevel;

  if (Object.keys(propertyPatch).length > 0) {
    handlers.onProperty(propertyPatch);
    applied += Object.keys(propertyPatch).length;
  }

  const size = numberToFormValue(parsed.size);
  if (size && parsed.size !== null && validateSizeValue(parsed.size) !== null) {
    handlers.onSize(size);
    applied += 1;
  }

  const rooms = numberToFormValue(parsed.rooms);
  if (rooms && parsed.rooms !== null && validateRoomsValue(parsed.rooms) !== null) {
    handlers.onRooms(rooms);
    applied += 1;
  }

  if (parsed.amenities.length > 0) {
    handlers.onFeatures?.(parsed.amenities);
    applied += parsed.amenities.length;
  }

  if (activeTransactionType === "rent") {
    const netRent = numberToFormValue(parsed.netRent);
    if (netRent && parsed.netRent !== null && validatePositiveAmountValue(parsed.netRent) !== null) {
      handlers.onRent({ netColdRent: netRent });
      applied += 1;
    }

    const utilityCharges = numberToFormValue(parsed.utilityCharges);
    if (
      utilityCharges &&
      parsed.utilityCharges !== null &&
      validatePositiveAmountValue(parsed.utilityCharges) !== null
    ) {
      handlers.onRent({ utilityCharges });
      applied += 1;
    }
  }

  return applied;
}
