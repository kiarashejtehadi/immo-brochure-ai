import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { PdfServerError } from "@/lib/pdf-download-error";
import { withTimeout } from "@/lib/promise-timeout";

/** Max time to wait for the server PDF route before falling back to client render. */
export const PDF_FETCH_TIMEOUT_MS = 8_000;

/** Max time for in-browser react-pdf fallback rendering. */
export const PDF_CLIENT_RENDER_TIMEOUT_MS = 30_000;

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

async function downloadViaServer(props: BrochurePdfProps): Promise<void> {
  const response = await withTimeout(
    fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(props),
      credentials: "same-origin",
    }),
    PDF_FETCH_TIMEOUT_MS,
    "PDF request timed out",
  );

  if (!response.ok) {
    throw new PdfServerError();
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/pdf")) {
    throw new PdfServerError();
  }

  const blob = await response.blob();
  triggerPdfDownload(blob, props.address);
}

async function downloadViaClient(props: BrochurePdfProps): Promise<void> {
  const [{ pdf }, { ExposePdfDocument }, { ensurePdfFontsReady }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/expose-pdf-document"),
    import("@/lib/pdf-fonts"),
  ]);

  ensurePdfFontsReady(props.fontFamily);
  const blob = await withTimeout(
    pdf(<ExposePdfDocument {...props} />).toBlob(),
    PDF_CLIENT_RENDER_TIMEOUT_MS,
    "PDF render timed out",
  );
  triggerPdfDownload(blob, props.address);
}

/**
 * Request a PDF and trigger download. Tries the server route first, then falls
 * back to in-browser react-pdf when the server renderer fails.
 */
export async function downloadExposePdf(props: BrochurePdfProps) {
  try {
    await downloadViaServer(props);
  } catch (serverError) {
    console.warn("[pdf] Server render failed, using client fallback", serverError);
    await downloadViaClient(props);
  }
}
