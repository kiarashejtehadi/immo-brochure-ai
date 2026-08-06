import type { GenerateRequestPayload } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";

export const SIZE_MIN_SQM = 10;
export const SIZE_MAX_SQM = 2000;
export const ROOMS_MIN = 1;
export const ROOMS_MAX = 30;

export type ListingSpecValidationError = {
  ok: false;
  error: string;
  field: string;
};

export type ListingSpecValidationSuccess = {
  ok: true;
  size: string;
  rooms: string;
};

export type ListingSpecValidationResult =
  | ListingSpecValidationSuccess
  | ListingSpecValidationError;

function parseNumericValue(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

function formatNumericValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function validateSizeValue(value: number): number | null {
  if (!Number.isFinite(value) || value < SIZE_MIN_SQM || value > SIZE_MAX_SQM) return null;
  return value;
}

export function validateRoomsValue(value: number): number | null {
  if (!Number.isFinite(value) || value < ROOMS_MIN || value > ROOMS_MAX) return null;
  return value;
}

export function validatePositiveAmountValue(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function validateSize(raw: string): number | null {
  const value = parseNumericValue(raw);
  if (value === null) return null;
  return validateSizeValue(value);
}

export function validateRooms(raw: string): number | null {
  const value = parseNumericValue(raw);
  if (value === null) return null;
  return validateRoomsValue(value);
}

export function validatePositiveAmount(raw: string): number | null {
  const value = parseNumericValue(raw);
  if (value === null) return null;
  return validatePositiveAmountValue(value);
}

export function validateListingSpecs(
  body: GenerateRequestPayload,
): ListingSpecValidationResult {
  let size = body.size?.trim() ?? "";
  let rooms = body.rooms?.trim() ?? "";

  if (size) {
    const parsed = validateSize(size);
    if (parsed === null) {
      return {
        ok: false,
        field: "size",
        error: `Invalid size: must be a number between ${SIZE_MIN_SQM} and ${SIZE_MAX_SQM} m².`,
      };
    }
    size = formatNumericValue(parsed);
  }

  if (rooms) {
    const parsed = validateRooms(rooms);
    if (parsed === null) {
      return {
        ok: false,
        field: "rooms",
        error: `Invalid rooms: must be a number between ${ROOMS_MIN} and ${ROOMS_MAX}.`,
      };
    }
    rooms = formatNumericValue(parsed);
  }

  if (body.transactionType === "rent" && body.rent?.netColdRent?.trim()) {
    const parsed = validatePositiveAmount(body.rent.netColdRent);
    if (parsed === null) {
      return {
        ok: false,
        field: "netColdRent",
        error: "Invalid net rent: must be a positive number.",
      };
    }
  }

  return { ok: true, size, rooms };
}

export function sanitizeVoiceParseResult(fields: VoiceParseResult): VoiceParseResult {
  const validatedSize =
    fields.size !== null ? validateSizeValue(fields.size) : null;
  const validatedRooms =
    fields.rooms !== null ? validateRoomsValue(fields.rooms) : null;
  const validatedNetRent =
    fields.netRent !== null ? validatePositiveAmountValue(fields.netRent) : null;
  const validatedUtilityCharges =
    fields.utilityCharges !== null
      ? validatePositiveAmountValue(fields.utilityCharges)
      : null;

  return {
    listingType: fields.listingType,
    streetAddress: fields.streetAddress,
    postalCode: fields.postalCode,
    city: fields.city,
    size: validatedSize,
    rooms: validatedRooms,
    floorLevel: fields.floorLevel,
    netRent: validatedNetRent,
    utilityCharges: validatedUtilityCharges,
  };
}

export function collectGenerateModerationText(body: GenerateRequestPayload): string {
  const parts = [
    body.address?.streetAddress,
    body.address?.houseNumber,
    body.address?.postalCode,
    body.address?.city,
    body.address?.country,
    body.size,
    body.rooms,
    body.property?.floorLevel,
    body.property?.parkingFee,
    body.rent?.netColdRent,
    body.rent?.utilityCharges,
    body.rent?.totalRent,
    body.rent?.securityDeposit,
    body.rent?.availableFrom,
    body.rent?.minimumLeaseTerm,
    body.rent?.petPolicy,
    body.sale?.purchasePrice,
    body.sale?.hoaFee,
    body.sale?.rentalYield,
    body.sale?.commissionTerms,
    body.energy?.constructionYear,
    body.energy?.heatingInstallYear,
    body.energy?.energyValue,
    body.agent?.name,
    body.agent?.agency,
    body.agent?.phone,
    body.agent?.email,
    body.agent?.legalDisclaimer,
  ];

  return parts
    .filter((part): part is string => typeof part === "string")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");
}
