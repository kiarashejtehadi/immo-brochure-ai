import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { withTimeout } from "@/lib/promise-timeout";
import { yieldToMainThread } from "@/lib/yield-to-main-thread";

/** Max time for in-browser react-pdf rendering. */
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
 * Render the exposé PDF in the browser and trigger download.
 * Server-side react-pdf is disabled — it hangs/OOMs under React 19 and
 * serializing multi-MB image payloads blocks the main thread.
 */
export async function downloadExposePdf(props: BrochurePdfProps) {
  const [{ pdf }, { ExposePdfDocument }, { ensurePdfFontsReady }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/expose-pdf-document"),
    import("@/lib/pdf-fonts"),
  ]);

  ensurePdfFontsReady(props.fontFamily);
  await yieldToMainThread();

  const blob = await withTimeout(
    pdf(<ExposePdfDocument {...props} />).toBlob(),
    PDF_CLIENT_RENDER_TIMEOUT_MS,
    "PDF render timed out",
  );
  triggerPdfDownload(blob, props.address);
}
