import type { UiLocale } from "@/lib/i18n";
import { inputClassName, labelClassName } from "@/components/listing/form-ui";
import { VoiceInputButton } from "@/components/listing/voice-input-button";
import { cn } from "@/lib/utils";

export type VoiceFieldLabels = {
  uiLocale: UiLocale;
  ariaLabel: string;
  listeningLabel: string;
  unsupportedLabel: string;
};

export function appendVoiceTranscript(current: string, text: string): string {
  const chunk = text.trim();
  if (!chunk) return current;
  const base = current.trim();
  return base ? `${base} ${chunk}` : chunk;
}

export function VoiceInputRow({
  voice,
  onTranscript,
  children,
  className,
}: {
  voice: VoiceFieldLabels;
  onTranscript: (text: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div className="min-w-0 flex-1">{children}</div>
      <VoiceInputButton
        uiLocale={voice.uiLocale}
        ariaLabel={voice.ariaLabel}
        listeningLabel={voice.listeningLabel}
        unsupportedLabel={voice.unsupportedLabel}
        onTranscript={onTranscript}
        className="shrink-0"
      />
    </div>
  );
}

export function VoiceTextInput({
  id,
  label,
  value,
  onChange,
  voice,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  voice: VoiceFieldLabels;
  placeholder?: string;
  type?: "text" | "tel" | "email";
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName()}>
        {label}
      </label>
      <VoiceInputRow
        voice={voice}
        onTranscript={(text) => onChange(appendVoiceTranscript(value, text))}
      >
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClassName(), "min-w-0 flex-1")}
        />
      </VoiceInputRow>
    </div>
  );
}

export function VoiceTextarea({
  id,
  label,
  value,
  onChange,
  voice,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  voice: VoiceFieldLabels;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName()}>
        {label}
      </label>
      <VoiceInputRow
        voice={voice}
        onTranscript={(text) => onChange(appendVoiceTranscript(value, text))}
      >
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClassName(), "min-w-0 flex-1 resize-y")}
        />
      </VoiceInputRow>
    </div>
  );
}
