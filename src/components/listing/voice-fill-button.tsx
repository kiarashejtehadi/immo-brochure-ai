"use client";

import { Mic, Square } from "lucide-react";
import { useVoiceFill } from "@/hooks/use-voice-fill";
import type { WorkflowUiCopy } from "@/lib/i18n-workflow";
import type { TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";
import { cn } from "@/lib/utils";

type VoiceFillButtonProps = {
  copy: Pick<
    WorkflowUiCopy,
    | "voiceFillButton"
    | "voiceFillListening"
    | "voiceFillProcessing"
    | "voiceFillUnsupported"
  >;
  currentListingType: TransactionType;
  onParsed: (fields: VoiceParseResult) => void;
  className?: string;
};

export function VoiceFillButton({
  copy,
  currentListingType,
  onParsed,
  className,
}: VoiceFillButtonProps) {
  const { error, supported, toggle, isRecording, isProcessing } =
    useVoiceFill(currentListingType);

  const label = isProcessing
    ? copy.voiceFillProcessing
    : isRecording
      ? copy.voiceFillListening
      : copy.voiceFillButton;

  if (!supported) {
    return (
      <p
        className={cn(
          "rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-400",
          className,
        )}
        role="note"
      >
        {copy.voiceFillUnsupported}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col items-end gap-2", className)}>
      <button
        type="button"
        onClick={() => void toggle(onParsed)}
        disabled={isProcessing}
        aria-pressed={isRecording}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-lg transition",
          isRecording
            ? "border-red-300 bg-red-50 text-red-700 animate-pulse dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
            : isProcessing
              ? "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-zinc-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40",
        )}
      >
        {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
        {label}
      </button>
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
