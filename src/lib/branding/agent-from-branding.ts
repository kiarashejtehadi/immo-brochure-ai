import { isKnownDefaultLegalDisclaimer } from "@/lib/i18n-form";
import type { UserBrandingProfile } from "@/types/branding";
import type { AgentFormData } from "@/types/listing";

export function hasBrandingAgentDefaults(branding: UserBrandingProfile | null): boolean {
  if (!branding) return false;
  return Boolean(
    branding.brokerName?.trim() ||
      branding.agencyName?.trim() ||
      branding.contactPhone?.trim() ||
      branding.contactEmail?.trim() ||
      branding.customLegalImprint?.trim(),
  );
}

/** Map saved account branding → Section 6 agent fields. */
export function agentDefaultsFromBranding(
  branding: UserBrandingProfile | null,
  current: AgentFormData,
  options?: { force?: boolean },
): Partial<AgentFormData> {
  if (!branding) return {};

  const patch: Partial<AgentFormData> = {};
  const force = options?.force === true;

  const apply = (key: keyof AgentFormData, value: string | null | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    const currentValue = current[key].trim();
    if (force || !currentValue) {
      patch[key] = trimmed;
    }
  };

  apply("name", branding.brokerName);
  apply("agency", branding.agencyName);
  apply("phone", branding.contactPhone);
  apply("email", branding.contactEmail);

  const imprint = branding.customLegalImprint?.trim();
  if (imprint) {
    const currentDisclaimer = current.legalDisclaimer.trim();
    if (
      force ||
      !currentDisclaimer ||
      isKnownDefaultLegalDisclaimer(current.legalDisclaimer)
    ) {
      patch.legalDisclaimer = imprint;
    }
  }

  return patch;
}

export function mergeAgentWithBrandingDefaults(
  current: AgentFormData,
  branding: UserBrandingProfile | null,
  options?: { force?: boolean },
): AgentFormData {
  const patch = agentDefaultsFromBranding(branding, current, options);
  return Object.keys(patch).length > 0 ? { ...current, ...patch } : current;
}
