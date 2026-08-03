"use client";

import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type BrandUploadDropzoneProps = {
  variant: "logo" | "avatar";
  imageUrl?: string | null;
  alt: string;
  hint: string;
  dropLabel: string;
  uploadingLabel: string;
  removeLabel?: string;
  removingLabel?: string;
  disabled?: boolean;
  uploading?: boolean;
  removing?: boolean;
  accept: string;
  onFile: (file: File) => void;
  onRemove?: () => void;
  onDisabledClick?: () => void;
};

export function BrandUploadDropzone({
  variant,
  imageUrl,
  alt,
  hint,
  dropLabel,
  uploadingLabel,
  removeLabel = "Remove",
  removingLabel = "Removing…",
  disabled,
  uploading,
  removing,
  accept,
  onFile,
  onRemove,
  onDisabledClick,
}: BrandUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | File[] | null | undefined) {
    const file = files instanceof FileList ? files[0] : files?.[0];
    if (file) onFile(file);
  }

  function openPicker() {
    if (disabled || uploading || removing) {
      if (disabled) onDisabledClick?.();
      return;
    }
    inputRef.current?.click();
  }

  const isAvatar = variant === "avatar";
  const busy = uploading || removing;

  return (
    <div className="space-y-2">
      <div className="relative inline-block w-full max-w-full">
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
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed transition",
            isAvatar ? "aspect-square max-w-[140px] rounded-full p-3" : "min-h-[120px] rounded-xl p-4",
            dragOver
              ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30"
              : "border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-900/40",
            (disabled || busy) && "cursor-not-allowed opacity-60",
          )}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={alt}
              className={cn(
                "object-contain",
                isAvatar ? "h-full w-full rounded-full object-cover" : "max-h-14 max-w-[160px]",
              )}
            />
          ) : (
            <>
              <Upload
                className={cn("text-zinc-400", isAvatar ? "h-6 w-6" : "h-8 w-8")}
                aria-hidden
              />
              <span className="mt-2 text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {uploading ? uploadingLabel : dropLabel}
              </span>
            </>
          )}
        </button>

        {imageUrl && onRemove ? (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) {
                onDisabledClick?.();
                return;
              }
              onRemove();
            }}
            className={cn(
              "absolute -right-1 -top-1 inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-red-50 hover:text-red-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-red-950/40 dark:hover:text-red-300",
              isAvatar && "-right-0.5 top-0",
              (disabled || busy) && "cursor-not-allowed opacity-60",
            )}
            aria-label={removeLabel}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {removing ? removingLabel : removeLabel}
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
