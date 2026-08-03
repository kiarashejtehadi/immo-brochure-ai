import { TimeoutError } from "@/lib/promise-timeout";
import type { UiCopy } from "@/lib/i18n";

/** Thrown when `/api/generate-pdf` returns a non-success response. */
export class PdfServerError extends Error {
  constructor() {
    super("PDF_SERVER_FAILED");
    this.name = "PdfServerError";
  }
}

/** Map PDF download failures to user-facing copy (timeouts, 504, generic). */
export function resolvePdfDownloadError(err: unknown, copy: UiCopy): string {
  if (err instanceof PdfServerError) {
    return copy.errors.pdfServerFailed;
  }

  if (err instanceof TimeoutError) {
    return copy.errors.pdfTimeout;
  }

  if (err instanceof DOMException && err.name === "AbortError") {
    return copy.errors.pdfTimeout;
  }

  if (err instanceof Error) {
    if (/504|timed out|timeout|abort/i.test(err.message)) {
      return copy.errors.pdfTimeout;
    }
    return err.message || copy.errors.pdfFailed;
  }

  return copy.errors.pdfFailed;
}
