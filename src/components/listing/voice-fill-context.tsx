"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FillWithVoiceButton } from "@/components/listing/voice-fill-button";
import type { WorkflowUiCopy } from "@/lib/i18n-workflow";
import type { UiLocale } from "@/lib/i18n";
import type { TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";

export type VoiceFillConfig = {
  locale: UiLocale;
  copy: Pick<
    WorkflowUiCopy,
    | "voiceFillButton"
    | "voiceFillButtonTrial"
    | "voiceFillListening"
    | "voiceFillProcessing"
    | "voiceFillUnsupported"
  >;
  transactionType: TransactionType;
  onParsed: (fields: VoiceParseResult) => void;
};

type VoiceFillContextValue = {
  config: VoiceFillConfig | null;
  setVoiceFillConfig: (config: VoiceFillConfig | null) => void;
};

const VoiceFillContext = createContext<VoiceFillContextValue | null>(null);

function voiceFillConfigsEqual(
  a: VoiceFillConfig | null,
  b: VoiceFillConfig | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.locale === b.locale &&
    a.transactionType === b.transactionType &&
    a.onParsed === b.onParsed &&
    a.copy.voiceFillButton === b.copy.voiceFillButton &&
    a.copy.voiceFillButtonTrial === b.copy.voiceFillButtonTrial &&
    a.copy.voiceFillListening === b.copy.voiceFillListening &&
    a.copy.voiceFillProcessing === b.copy.voiceFillProcessing &&
    a.copy.voiceFillUnsupported === b.copy.voiceFillUnsupported
  );
}

export function VoiceFillProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<VoiceFillConfig | null>(null);
  const setVoiceFillConfig = useCallback((next: VoiceFillConfig | null) => {
    setConfigState((prev) => (voiceFillConfigsEqual(prev, next) ? prev : next));
  }, []);
  const value = useMemo(
    () => ({ config, setVoiceFillConfig }),
    [config, setVoiceFillConfig],
  );

  return (
    <VoiceFillContext.Provider value={value}>{children}</VoiceFillContext.Provider>
  );
}

export function useVoiceFillRegistration() {
  const context = useContext(VoiceFillContext);
  if (!context) {
    throw new Error("useVoiceFillRegistration must be used within VoiceFillProvider");
  }
  return context;
}

export function useRegisterVoiceFill(config: VoiceFillConfig) {
  const { setVoiceFillConfig } = useVoiceFillRegistration();
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    setVoiceFillConfig(configRef.current);
    return () => setVoiceFillConfig(null);
  }, [
    setVoiceFillConfig,
    config.locale,
    config.transactionType,
    config.onParsed,
    config.copy.voiceFillButton,
    config.copy.voiceFillButtonTrial,
    config.copy.voiceFillListening,
    config.copy.voiceFillProcessing,
    config.copy.voiceFillUnsupported,
  ]);
}

/** Fixed global mount — renders only when the create workspace registers voice fill. */
export function VoiceFillGlobalMount() {
  const context = useContext(VoiceFillContext);
  const config = context?.config;
  if (!config) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <FillWithVoiceButton
        copy={config.copy}
        locale={config.locale}
        currentListingType={config.transactionType}
        onParsed={config.onParsed}
      />
    </div>
  );
}
