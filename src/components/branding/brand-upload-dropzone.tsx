"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type BrandUploadDropzoneProps = {
  variant: "logo" | "avatar";
  imageUrl?: string | null;
  alt: string;
  hint: string;
  dropLabel: string;
  uploadingLabel: string;
  disabled?: boolean;
  uploading?: boolean;
  accept: string;
  onFile: (file: File) => void;
  onDisabledClick?: () => void;
};

export function BrandUploadDropzone({
  variant,
  imageUrl,
  alt,
  hint,
  dropLabel,
  uploadingLabel,
  disabled,
  uploading,
  accept,
  onFile,
  onDisabledClick,
}: BrandUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | File[] | null | undefined) {
    const file = files instanceof FileList ? files[0] : files?.[0];
    if (file) onFile(file);
  }

  function openPicker() {
    if (disabled) {
      onDisabledClick?.();
      return;
    }
    inputRef.current?.click();
  }

  const isAvatar = variant === "avatar";

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || uploading) return;
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed transition",
          isAvatar ? "aspect-square max-w-[140px] rounded-full p-3" : "min-h-[120px] rounded-xl p-4",
          dragOver
            ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30"
            : "border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-900/40",
          (disabled || uploading) && "cursor-not-allowed opacity-60",
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
              className={cn(
                "text-zinc-400",
                isAvatar ? "h-6 w-6" : "h-8 w-8",
              )}
              aria-hidden
            />
            <span className="mt-2 text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {uploading ? uploadingLabel : dropLabel}
            </span>
          </>
        )}
      </button>
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
