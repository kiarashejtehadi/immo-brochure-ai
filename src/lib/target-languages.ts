import {
  OUTPUT_LANGUAGE_OPTIONS,
  type OutputLanguage,
  type UiLocale,
} from "@/lib/i18n";

/** Target language selector (UI locale + AI output). */
export const TARGET_LANGUAGE_OPTIONS = OUTPUT_LANGUAGE_OPTIONS;

/** All UI locales available as exposé output languages. */
export const EXPOSE_LANGUAGE_OPTIONS = OUTPUT_LANGUAGE_OPTIONS;

export function localeFromTargetLanguage(lang: OutputLanguage): UiLocale {
  return (
    OUTPUT_LANGUAGE_OPTIONS.find((o) => o.value === lang)?.locale ?? "en"
  );
}

export function outputLanguageFromLocale(locale: UiLocale): OutputLanguage {
  return (
    OUTPUT_LANGUAGE_OPTIONS.find((o) => o.locale === locale)?.value ?? "English"
  );
}

export const EXPOSE_LANGUAGE_SHORT: Record<OutputLanguage, string> = {
  English: "EN",
  German: "DE",
  French: "FR",
  Spanish: "ES",
  Italian: "IT",
  Dutch: "NL",
  Polish: "PL",
};
