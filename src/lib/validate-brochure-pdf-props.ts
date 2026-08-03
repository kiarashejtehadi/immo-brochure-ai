import type { BrochurePdfProps } from "@/types/brochure-pdf";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Minimal runtime validation for the generate-pdf API payload. */
export function parseBrochurePdfProps(body: unknown): BrochurePdfProps | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Partial<BrochurePdfProps>;

  if (
    !isNonEmptyString(data.title) ||
    !isNonEmptyString(data.address) ||
    !isStringArray(data.photoDataUrls) ||
    !isStringArray(data.summary) ||
    typeof data.fullDescription !== "string" ||
    typeof data.locationDescription !== "string" ||
    !data.agent ||
    typeof data.agent !== "object" ||
    !Array.isArray(data.specsTable) ||
    !Array.isArray(data.energyLines) ||
    (data.transactionType !== "rent" && data.transactionType !== "sale")
  ) {
    return null;
  }

  return data as BrochurePdfProps;
}
