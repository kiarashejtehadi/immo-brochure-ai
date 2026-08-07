"use client";

import { useState } from "react";
import { useCopyToast } from "@/components/ui/copy-toast";
import type { BillingCopy } from "@/lib/i18n-billing";

function downloadJsonBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? null;
}

export function PrivacyDataExport({ copy }: { copy: BillingCopy }) {
  const { showToast } = useCopyToast();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export-data", {
        method: "GET",
        credentials: "same-origin",
      });

      if (!res.ok) {
        let message = copy.dataExportFailed;
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          /* binary or empty body */
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const filename =
        filenameFromContentDisposition(res.headers.get("Content-Disposition")) ??
        "my-data-export.json";
      downloadJsonBlob(blob, filename);
      showToast(copy.dataExportSuccess);
    } catch (err) {
      showToast(err instanceof Error ? err.message : copy.dataExportFailed);
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {copy.privacyDataTitle}
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{copy.privacyDataDescription}</p>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={exporting}
        className="mt-4 cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        {exporting ? copy.dataExportPreparing : copy.dataExportButton}
      </button>
    </section>
  );
}
