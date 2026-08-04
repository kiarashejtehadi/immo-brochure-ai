import type { OutputLanguage } from "@/lib/i18n";

export type FormattedDistance = {
  text: string;
  minutes: number;
};

/** Normalize raw meters into German real-estate-friendly walking-time phrasing. */
export function formatDistance(meters: number): FormattedDistance {
  const m = Math.max(0, Math.round(meters));
  const minutes = Math.max(1, Math.round(m / 80));

  if (minutes <= 1) {
    return { text: "direkt vor der Haustür", minutes };
  }
  if (minutes <= 12) {
    return { text: `ca. ${minutes} Gehminuten`, minutes };
  }

  const roundedMeters = Math.round(m / 50) * 50;
  return { text: `ca. ${roundedMeters} m`, minutes };
}

function formatDistanceEnglish(meters: number): FormattedDistance {
  const m = Math.max(0, Math.round(meters));
  const minutes = Math.max(1, Math.round(m / 80));

  if (minutes <= 1) {
    return { text: "directly at your doorstep", minutes };
  }
  if (minutes <= 12) {
    return { text: `approx. ${minutes}-minute walk`, minutes };
  }

  const roundedMeters = Math.round(m / 50) * 50;
  return { text: `approx. ${roundedMeters} m`, minutes };
}

export function formatDistanceForLanguage(
  meters: number,
  language: OutputLanguage,
): FormattedDistance {
  if (language === "German") {
    return formatDistance(meters);
  }
  return formatDistanceEnglish(meters);
}

/** Humanize POI distance for AI prompt context (locale-aware). */
export function humanizeDistanceForPrompt(
  meters: number,
  language: OutputLanguage = "English",
): string {
  return formatDistanceForLanguage(meters, language).text;
}

export function distanceFormattingRules(language: OutputLanguage): string {
  const example =
    language === "German"
      ? "Schlosspark Charlottenburg (ca. 5 Gehminuten)"
      : "Charlottenburg Palace Park (approx. 5-minute walk)";

  return `DISTANCE FORMATTING RULES (MANDATORY):
- All POI and landmark distances are pre-normalized in locationContext as proximityText and walkingMinutes.
- You MUST use these exact proximityText phrases when mentioning distances in locationDescription.
- You MUST pair each named landmark with its proximityText at least once (e.g. "${example}").
- NEVER write raw, exact meters like "298 meters", "564 meters", or "25 meters".
- NEVER invent walking times or meter values that differ from the provided proximityText / walkingMinutes fields.
- Average walking speed assumed: ~80 m per minute (~4.8 km/h).`;
}

/** @deprecated Use distanceFormattingRules(language) for locale-aware copy. */
export const DISTANCE_FORMATTING_RULES = distanceFormattingRules("English");
