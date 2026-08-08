"use client";

import { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { useVoiceFill } from "@/hooks/use-voice-fill";
import { BILLING_REFRESH_EVENT, useBillingStatus } from "@/hooks/use-billing-status";
import { isBillingEnabled } from "@/lib/billing/config";
import { isProTier } from "@/lib/billing/tier";
import { getBillingCopy, interpolate } from "@/lib/i18n-billing";
import type { FormCopy } from "@/lib/i18n-form";
import type { WorkflowUiCopy } from "@/lib/i18n-workflow";
import type { UiLocale } from "@/lib/i18n";
import type { TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";
import { cn } from "@/lib/utils";

type VoiceAutofillPanelProps = {
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
  currentListingType: TransactionType;
  onParsed: (result: { fields: VoiceParseResult; transcript?: string }) => void;
  disabled?: boolean;
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceAutofillPanel({
  copy,
  locale,
  currentListingType,
  onParsed,
  disabled,
}: VoiceAutofillPanelProps) {
  const billingCopy = getBillingCopy(locale);
  const { status, refresh } = useBillingStatus();
  const {
    error,
    supported,
    toggle,
    cancel,
    isRecording,
    isProcessing,
    transcript,
    recordingSeconds,
  } = useVoiceFill(currentListingType);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const billingActive = isBillingEnabled();
  const tier = status?.tier ?? "trial";
  const isPro = !billingActive || isProTier(tier);
  const audioLimit = status?.audioCreditsLimit ?? 2;
  const audioUsed = status?.audioCreditsUsed ?? 0;
  const creditsLeft = isPro ? null : Math.max(0, audioLimit - audioUsed);
  const trialExhausted = billingActive && !isPro && creditsLeft === 0;
  const needsSignIn = billingActive && !status?.email;

  const label = isProcessing
    ? copy.voiceFillProcessing
    : isRecording
      ? copy.voiceFillListening
      : copy.quickAutofillVoiceCta;

  async function handleToggle() {
    if (disabled || isProcessing) return;
    if (needsSignIn) {
      setAuthOpen(true);
      return;
    }
    if (trialExhausted) {
      setUpgradeOpen(true);
      return;
    }

    await toggle(async (result) => {
      onParsed(result);
      if (billingActive) {
        window.dispatchEvent(new Event(BILLING_REFRESH_EVENT));
        await refresh();
      }
    });
  }

  useEffect(() => {
    if (!isRecording) return;
    return () => cancel();
  }, [cancel, isRecording]);

  if (!supported) {
    return (
      <div className="flex h-full min-h-[140px] flex-col justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-600 dark:bg-zinc-950">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{copy.voiceFillUnsupported}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full min-h-[140px] flex-col rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => void handleToggle()}
          disabled={disabled || isProcessing}
          aria-pressed={isRecording}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition",
            trialExhausted
              ? "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              : isRecording
                ? "border-red-300 bg-red-50 text-red-700 animate-pulse dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
                : isProcessing
                  ? "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  : "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/60",
          )}
        >
          {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
          {label}
        </button>

        {!isPro && creditsLeft !== null && !isRecording && !isProcessing ? (
          <p className="mt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
            {interpolate(copy.voiceFillButtonTrial, { count: creditsLeft })}
          </p>
        ) : null}

        {isRecording ? (
          <p className="mt-3 text-center font-mono text-sm tabular-nums text-red-600 dark:text-red-400">
            {formatElapsed(recordingSeconds)}
          </p>
        ) : null}

        {transcript ? (
          <div className="mt-3 flex-1 rounded-lg border border-zinc-100 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {copy.quickAutofillTranscriptLabel}
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              {transcript}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {copy.quickAutofillVoiceHint}
          </p>
        )}

        {error ? (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <UpgradeProModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        locale={locale}
        subscriptionOnly
        title={billingCopy.voiceUpgradeTitle}
        body={billingCopy.voiceUpgradeBody}
      />

      <AuthEmailModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSent={() => {
          setAuthOpen(false);
          void refresh();
        }}
      />
    </>
  );
}
