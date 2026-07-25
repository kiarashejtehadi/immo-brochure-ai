import type { OutputLanguage } from "@/lib/i18n";

const CAPTION_HASHTAGS: Record<OutputLanguage, string[]> = {
  English: ["#RealEstate", "#HomeForSale"],
  German: ["#Immobilien", "#WohnungKaufen"],
  French: ["#Immobilier", "#Appartement"],
  Spanish: ["#Inmobiliaria", "#Vivienda"],
  Italian: ["#Immobiliare", "#Casa"],
  Dutch: ["#Vastgoed", "#Woning"],
  Persian: ["#املاک", "#مسکن"],
  Arabic: ["#عقارات", "#شقة_للبيع"],
  Polish: ["#Nieruchomosci", "#Mieszkanie"],
};

export function getCaptionHashtags(language: OutputLanguage): string[] {
  return CAPTION_HASHTAGS[language] ?? CAPTION_HASHTAGS.English;
}

export function isOutputLanguage(value: string): value is OutputLanguage {
  return value in CAPTION_HASHTAGS;
}

export function normalizeOutputLanguage(value: string | undefined): OutputLanguage {
  if (value && isOutputLanguage(value)) return value;
  return "English";
}
