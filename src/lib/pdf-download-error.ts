import { TimeoutError } from "@/lib/promise-timeout";
import type { UiCopy } from "@/lib/i18n";

/** Map PDF download failures to user-facing copy (timeouts, 504, generic). */
export function resolvePdfDownloadError(err: unknown, copy: UiCopy): string {
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
