"use client";

import { useRef, useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { VoiceAutofillPanel } from "@/components/listing/voice-autofill-panel";
import type { FormCopy } from "@/lib/i18n-form";
import type { WorkflowUiCopy } from "@/lib/i18n-workflow";
import type { UiLocale } from "@/lib/i18n";
import type { TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";
import { cn } from "@/lib/utils";

export type QuickAutofillBannerProps = {
  copy: FormCopy &
    Pick<
      WorkflowUiCopy,
      | "voiceFillButton"
      | "voiceFillButtonTrial"
      | "voiceFillListening"
      | "voiceFillProcessing"
      | "voiceFillUnsupported"
    >;
  locale: UiLocale;
  transactionType: TransactionType;
  autofillCount: number | null;
  onOpenImmoImport?: (file: File) => Promise<void>;
  onVoiceParsed: (result: { fields: VoiceParseResult; transcript?: string }) => void;
};

export function QuickAutofillBanner({
  copy,
  locale,
  transactionType,
  autofillCount,
  onOpenImmoImport,
  onVoiceParsed,
}: QuickAutofillBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || !onOpenImmoImport || busy) return;
    setBusy(true);
    try {
      await onOpenImmoImport(file);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function openPicker() {
    if (!onOpenImmoImport || busy) return;
    inputRef.current?.click();
  }

  return (
    <section
      aria-label={copy.quickAutofillTitle}
      className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40"
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {copy.quickAutofillTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{copy.quickAutofillSubtitle}</p>
      </div>

      {autofillCount != null && autofillCount > 0 ? (
        <div
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
        >
          {copy.quickAutofillSuccessBadge.replace("{count}", String(autofillCount))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".xml,.zip,application/xml,text/xml,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openPicker();
            }}
            onClick={openPicker}
            onDragOver={(e) => {
              e.preventDefault();
              if (!busy && onOpenImmoImport) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (busy || !onOpenImmoImport) return;
              void handleFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition",
              dragOver
                ? "border-indigo-400 bg-indigo-50/80 dark:border-indigo-500 dark:bg-indigo-950/30"
                : "border-zinc-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:border-indigo-700",
              (busy || !onOpenImmoImport) && "cursor-not-allowed opacity-60",
            )}
          >
            <Upload className="mb-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {busy ? copy.openImmoImporting : copy.quickAutofillDropLabel}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPicker();
              }}
              disabled={busy || !onOpenImmoImport}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <FileUp className="h-3.5 w-3.5" aria-hidden />
              {copy.quickAutofillBrowse}
            </button>
          </div>
        </div>

        <VoiceAutofillPanel
          copy={copy}
          locale={locale}
          currentListingType={transactionType}
          onParsed={onVoiceParsed}
          disabled={busy}
        />
      </div>
    </section>
  );
}
