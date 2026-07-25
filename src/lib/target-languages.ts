import {
  OUTPUT_LANGUAGE_OPTIONS,
  type OutputLanguage,
  type UiLocale,
} from "@/lib/i18n";

/** Target language selector (UI locale + AI output). */
export const TARGET_LANGUAGE_OPTIONS = OUTPUT_LANGUAGE_OPTIONS;

export function localeFromTargetLanguage(lang: OutputLanguage): UiLocale {
  return (
    OUTPUT_LANGUAGE_OPTIONS.find((o) => o.value === lang)?.locale ?? "en"
  );
}
