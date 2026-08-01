/** Humanize POI distance for AI prompt context (avoids raw exact meter figures). */
export function humanizeDistanceForPrompt(meters: number): string {
  const m = Math.max(0, Math.round(meters));

  if (m < 50) {
    return "just steps away / directly outside";
  }

  if (m <= 500) {
    const rounded = Math.round(m / 50) * 50;
    const walkMin = Math.max(1, Math.round(m / 80));
    return `short ~${walkMin}-minute walk (~${rounded} m)`;
  }

  if (m <= 1500) {
    const rounded = Math.round(m / 100) * 100;
    const walkMin = Math.max(2, Math.round(m / 80));
    return `approx. ${rounded} m / under a ${walkMin}-minute walk`;
  }

  const km = (m / 1000).toFixed(1).replace(/\.0$/, "");
  return `approx. ${km} km`;
}

export const DISTANCE_FORMATTING_RULES = `DISTANCE FORMATTING RULES:
- NEVER write raw, exact meters like '298 meters', '564 meters', or '25 meters'.
- Convert distances into humanized walking times or rounded figures:
  * Under 50m: Use phrases like 'just steps away' or 'directly outside'.
  * 50m to 500m: Round to the nearest 50m OR express as a short walk (e.g., 'a short 4-minute walk (~300m)').
  * 500m to 1500m: Round to the nearest 100m or 5-minute interval (e.g., 'approx. 600m away' or 'under a 10-minute walk').`;
