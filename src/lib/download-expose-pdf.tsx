import type { BrochurePdfProps } from "@/types/brochure-pdf";
import { PdfServerError } from "@/lib/pdf-download-error";
import { withTimeout } from "@/lib/promise-timeout";

/** Max time to wait for the server PDF route (network + render). */
export const PDF_FETCH_TIMEOUT_MS = 60_000;

/**
 * Request a server-rendered PDF and trigger a browser download.
 * Image data URLs must already be prepared on the client before calling.
 */
export async function downloadExposePdf(props: BrochurePdfProps) {
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

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const filenameMatch = /filename="([^"]+)"/i.exec(disposition);
  const downloadName = filenameMatch?.[1] ?? "Expose.pdf";

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = downloadName;
  link.click();
  window.URL.revokeObjectURL(url);
}
