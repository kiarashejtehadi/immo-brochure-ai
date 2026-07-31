import type { BillingStatusResponse } from "@/types/billing";
import type { GenerateResult } from "@/types/listing";
import { hasPurchasedBillingAccess } from "@/lib/billing/client-access";

/**
 * Trial-only PDF exports are watermarked. Purchased credit packs and subscriptions export clean PDFs.
 */
export function resolveShowPdfWatermark(
  result: GenerateResult | null,
  pdfWatermarkFlag: boolean,
  billing: BillingStatusResponse | null,
): boolean {
  if (billing?.billingEnabled) {
    return !hasPurchasedBillingAccess(billing);
  }

  return Boolean(result?.watermarkPdf ?? pdfWatermarkFlag);
}
