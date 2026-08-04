"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormCopy } from "@/lib/i18n-form";

export type OpenImmoImportDropzoneProps = {
  copy: FormCopy;
  disabled?: boolean;
  onImport: (file: File) => Promise<void>;
};

export function OpenImmoImportDropzone({
  copy,
  disabled,
  onImport,
}: OpenImmoImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || disabled || busy) return;
    setBusy(true);
    try {
      await onImport(file);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function openPicker() {
    if (disabled || busy) return;
    inputRef.current?.click();
  }

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="file"
        accept=".xml,.zip,application/xml,text/xml,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || busy) return;
          const file = e.dataTransfer.files[0];
          void handleFile(file);
        }}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition",
          dragOver
            ? "border-indigo-400 bg-indigo-50/80 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-100"
            : "border-zinc-300 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-indigo-700",
          (disabled || busy) && "cursor-not-allowed opacity-60",
        )}
      >
        <Upload className="h-4 w-4 shrink-0" aria-hidden />
        {busy ? copy.openImmoImporting : copy.openImmoImportLabel}
      </button>
      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{copy.openImmoImportHint}</p>
    </div>
  );
}
