"use client";

import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { speechRecognitionLangForUi } from "@/lib/speech-locale";
import type { UiLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type VoiceInputButtonProps = {
  uiLocale: UiLocale;
  onTranscript: (text: string) => void;
  listeningLabel: string;
  unsupportedLabel: string;
  ariaLabel: string;
  className?: string;
};

export function VoiceInputButton({
  uiLocale,
  onTranscript,
  listeningLabel,
  unsupportedLabel,
  ariaLabel,
  className,
}: VoiceInputButtonProps) {
  const lang = speechRecognitionLangForUi(uiLocale);
  const { listening, supported, start, stop } = useSpeechRecognition(lang);

  function handleClick() {
    if (!supported) return;
    if (listening) {
      stop();
      return;
    }
    start((text) => {
      onTranscript(text);
    });
  }

  if (!supported) {
    return (
      <span
        title={unsupportedLabel}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 dark:border-zinc-700",
          className,
        )}
        aria-hidden
      >
        <MicOff className="h-4 w-4" />
      </span>
    );
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-pressed={listening}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
          listening
            ? "border-red-300 bg-red-50 text-red-600 animate-pulse dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
        )}
      >
        <Mic className="h-4 w-4" />
      </button>
      {listening ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden />
          {listeningLabel}
        </span>
      ) : null}
    </div>
  );
}
