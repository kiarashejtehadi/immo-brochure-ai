import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { PdfServerError } from "@/lib/pdf-download-error";
import { withTimeout } from "@/lib/promise-timeout";

/** Max time waiting for server PDF generation. */
export const PDF_CLIENT_RENDER_TIMEOUT_MS = 45_000;

function pdfFilename(address: string): string {
  const slug =
    address
      .trim()
      .slice(0, 40)
      .replace(/[^\wäöüÄÖÜß\-]+/gi, "-")
      .replace(/-+/g, "-") || "expose";
  return `expose-${slug}.pdf`;
}

/**
 * Request a PDF from the server-side React-PDF pipeline and trigger download.
 * Uses `/api/generate-pdf` → `ExposePdfDocument` (@react-pdf/renderer).
 */
export async function downloadExposePdf(props: BrochurePdfProps): Promise<void> {
  const response = await withTimeout(
    fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(props),
    }),
    PDF_CLIENT_RENDER_TIMEOUT_MS,
    "PDF render timed out",
  );

  if (!response.ok) {
    throw new PdfServerError();
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = pdfFilename(props.address);
  link.click();
  window.URL.revokeObjectURL(url);
}
