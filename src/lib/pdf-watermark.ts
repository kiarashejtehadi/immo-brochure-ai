import type { BillingStatusResponse } from "@/types/billing";
import type { GenerateResult } from "@/types/listing";

/** Whether the exported PDF should include the free-tier footer watermark. */
export function resolveShowPdfWatermark(
  result: GenerateResult | null,
  pdfWatermarkFlag: boolean,
  billing: BillingStatusResponse | null,
): boolean {
  if (result?.watermarkPdf === true || pdfWatermarkFlag) return true;
  if (result?.watermarkPdf === false) return false;
  // Fallback when API flag missing: non-Pro users with billing enabled.
  if (billing?.billingEnabled && billing.isPro === false) return true;
  return false;
}
