import type { BillingStatusResponse } from "@/types/billing";
import type { GenerateResult } from "@/types/listing";

/**
 * Free-tier PDF exports are watermarked unless the user has an active Pro subscription.
 * Credit-pack and trial generations always watermark on the server; this mirrors that on download.
 */
export function resolveShowPdfWatermark(
  result: GenerateResult | null,
  pdfWatermarkFlag: boolean,
  billing: BillingStatusResponse | null,
): boolean {
  if (billing?.billingEnabled) {
    if (billing.isPro || billing.hasActiveSubscription) {
      return false;
    }
    return true;
  }

  return Boolean(result?.watermarkPdf ?? pdfWatermarkFlag);
}
