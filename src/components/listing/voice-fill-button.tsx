"use client";

import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { useVoiceFill } from "@/hooks/use-voice-fill";
import { BILLING_REFRESH_EVENT, useBillingStatus } from "@/hooks/use-billing-status";
import { isBillingEnabled } from "@/lib/billing/config";
import { isProTier } from "@/lib/billing/tier";
import { getBillingCopy, interpolate } from "@/lib/i18n-billing";
import type { WorkflowUiCopy } from "@/lib/i18n-workflow";
import type { TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";
import type { UiLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type VoiceFillButtonProps = {
  copy: Pick<
    WorkflowUiCopy,
    | "voiceFillButton"
    | "voiceFillButtonTrial"
    | "voiceFillListening"
    | "voiceFillProcessing"
    | "voiceFillUnsupported"
  >;
  locale: UiLocale;
  currentListingType: TransactionType;
  onParsed: (fields: VoiceParseResult) => void;
  className?: string;
};

export function VoiceFillButton({
  copy,
  locale,
  currentListingType,
  onParsed,
  className,
}: VoiceFillButtonProps) {
  const billingCopy = getBillingCopy(locale);
  const { status, refresh } = useBillingStatus();
  const { error, supported, toggle, isRecording, isProcessing } =
    useVoiceFill(currentListingType);
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
      : isPro || creditsLeft === null
        ? copy.voiceFillButton
        : interpolate(copy.voiceFillButtonTrial, { count: creditsLeft });

  async function handleToggle() {
    if (needsSignIn) {
      setAuthOpen(true);
      return;
    }
    if (trialExhausted) {
      setUpgradeOpen(true);
      return;
    }

    await toggle(async (result) => {
      onParsed(result.fields);
      if (billingActive) {
        window.dispatchEvent(new Event(BILLING_REFRESH_EVENT));
        await refresh();
      }
    });
  }

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
    <>
      <div className={cn("flex flex-col items-end gap-2", className)}>
        <button
          type="button"
          onClick={() => void handleToggle()}
          disabled={isProcessing}
          aria-pressed={isRecording}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-lg transition",
            trialExhausted
              ? "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              : isRecording
                ? "border-red-300 bg-red-50 text-red-700 animate-pulse dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
                : isProcessing
                  ? "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-zinc-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40",
          )}
        >
          {isRecording ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {label}
        </button>
        {error ? (
          <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400" role="alert">
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

/** Global alias for the voice dictation control. */
export const FillWithVoiceButton = VoiceFillButton;
