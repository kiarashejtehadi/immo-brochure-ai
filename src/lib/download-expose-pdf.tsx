import { pdf } from "@react-pdf/renderer";
import { ExposePdfDocument } from "@/components/expose-pdf-document";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { ensurePdfFontsReady } from "@/lib/pdf-fonts";
import { withTimeout } from "@/lib/promise-timeout";
import { yieldToMainThread } from "@/lib/yield-to-main-thread";

/** Max time for @react-pdf/renderer to produce the PDF blob in the browser. */
export const PDF_CLIENT_RENDER_TIMEOUT_MS = 45_000;

function triggerPdfDownload(blob: Blob, address: string) {
  const slug =
    address
      .trim()
      .slice(0, 40)
      .replace(/[^\wäöüÄÖÜß\-]+/gi, "-")
      .replace(/-+/g, "-") || "expose";

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expose-${slug}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Compile and download a PDF in the browser.
 * Image data URLs must already be prepared in the click handler — never during render.
 */
export async function downloadExposePdf(props: BrochurePdfProps) {
  ensurePdfFontsReady(props.fontFamily);

  // Yield twice so React can paint "Preparing…" before the heavy render blocks the thread.
  await yieldToMainThread();
  await yieldToMainThread();

  const doc = <ExposePdfDocument {...props} />;
  const blob = await withTimeout(
    pdf(doc).toBlob(),
    PDF_CLIENT_RENDER_TIMEOUT_MS,
    "PDF render timed out",
  );

  triggerPdfDownload(blob, props.address);
}
