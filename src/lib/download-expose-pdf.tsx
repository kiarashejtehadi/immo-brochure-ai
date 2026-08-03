import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { downloadExposePdfWithPdfLib } from "@/lib/download-expose-pdf-pdf-lib";

/** Max time for PDF generation (pdf-lib is usually fast; cap runaway work). */
export const PDF_CLIENT_RENDER_TIMEOUT_MS = 45_000;

/**
 * Build and download the exposé PDF in the browser.
 * Uses pdf-lib (not react-pdf) so generation works without listing photos or branding assets.
 */
export async function downloadExposePdf(props: BrochurePdfProps) {
  await downloadExposePdfWithPdfLib(props);
}
