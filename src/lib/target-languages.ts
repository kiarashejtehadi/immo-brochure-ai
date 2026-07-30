import {
  OUTPUT_LANGUAGE_OPTIONS,
  type OutputLanguage,
  type UiLocale,
} from "@/lib/i18n";

/** Target language selector (UI locale + AI output). */
export const TARGET_LANGUAGE_OPTIONS = OUTPUT_LANGUAGE_OPTIONS;

/** Primary exposé output languages shown in the listing form. */
export const EXPOSE_LANGUAGE_OPTIONS = OUTPUT_LANGUAGE_OPTIONS.filter((o) =>
  (["en", "de", "fr"] as UiLocale[]).includes(o.locale),
);

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
