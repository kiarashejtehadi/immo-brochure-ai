"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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

export function VoiceFillProvider({ children }: { children: ReactNode }) {
  const [config, setVoiceFillConfig] = useState<VoiceFillConfig | null>(null);
  const value = useMemo(
    () => ({ config, setVoiceFillConfig }),
    [config],
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

  useEffect(() => {
    setVoiceFillConfig(config);
    return () => setVoiceFillConfig(null);
  }, [config, setVoiceFillConfig]);
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
