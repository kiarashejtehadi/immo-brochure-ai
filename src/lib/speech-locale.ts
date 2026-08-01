import type { UiLocale } from "@/lib/i18n";

const SPEECH_LOCALE: Record<UiLocale, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  fa: "fa-IR",
  ar: "ar-SA",
};

export function speechRecognitionLangForUi(uiLocale: UiLocale): string {
  return SPEECH_LOCALE[uiLocale] ?? "en-US";
}
