"use client";

import { useEffect, useState, type RefObject } from "react";
import { VoiceFillButton } from "@/components/listing/voice-fill-button";
import type { WorkflowUiCopy } from "@/lib/i18n-workflow";
import type { UiLocale } from "@/lib/i18n";
import type { TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";

type VoiceFillFloatingAssistantProps = {
  formSectionRef: RefObject<HTMLElement | null>;
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
};

export function VoiceFillFloatingAssistant({
  formSectionRef,
  copy,
  locale,
  currentListingType,
  onParsed,
}: VoiceFillFloatingAssistantProps) {
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const element = formSectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { rootMargin: "-8% 0px", threshold: 0.05 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [formSectionRef]);

  if (!formInView) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <VoiceFillButton
        copy={copy}
        locale={locale}
        currentListingType={currentListingType}
        onParsed={onParsed}
      />
    </div>
  );
}
