import { pdf } from "@react-pdf/renderer";
import { ExposePdfDocument } from "@/components/expose-pdf-document";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { ensurePdfFontsReady } from "@/lib/pdf-fonts";
import { withTimeout } from "@/lib/promise-timeout";

/** Max time for @react-pdf/renderer to produce the PDF blob in the browser. */
export const PDF_RENDER_TIMEOUT_MS = 10_000;

/**
 * Compile and download a PDF. Image data URLs must already be prepared
 * (via preparePdfImageProps in the download click handler — never during render).
 */
export async function downloadExposePdf(props: BrochurePdfProps) {
  try {
    console.log("PDF: Compiling React-PDF document tree...");
    ensurePdfFontsReady(props.fontFamily);

    const doc = <ExposePdfDocument {...props} />;

    console.log("PDF: Executing pdf(Doc).toBlob()...");
    const blob = await withTimeout(
      pdf(doc).toBlob(),
      PDF_RENDER_TIMEOUT_MS,
      "PDF render timed out",
    );

    console.log("PDF: Download ready");
    const url = URL.createObjectURL(blob);
    const slug =
      props.address
        .trim()
        .slice(0, 40)
        .replace(/[^\wäöüÄÖÜß\-]+/gi, "-")
        .replace(/-+/g, "-") || "expose";

    const link = document.createElement("a");
    link.href = url;
    link.download = `expose-${slug}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF: Generation failed", err);
    throw err;
  }
}
