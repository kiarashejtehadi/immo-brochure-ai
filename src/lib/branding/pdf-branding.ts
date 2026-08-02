import type { UserBrandingProfile } from "@/types/branding";
import type { GenerateRequestPayload } from "@/types/listing";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  type PDFBrandingProps,
} from "@/types/branding";
import { isBrandFontFamily } from "@/lib/branding/font-family";

export function mergeAgentWithBranding(
  agent: GenerateRequestPayload["agent"],
  branding: UserBrandingProfile | null,
): GenerateRequestPayload["agent"] {
  if (!branding) return agent;
  return {
    ...agent,
    name: branding.brokerName?.trim() || agent.name,
    agency: branding.agencyName?.trim() || agent.agency,
    phone: branding.contactPhone?.trim() || agent.phone,
    email: branding.contactEmail?.trim() || agent.email,
  };
}

/** PDF contact block prefers listing form values; branding fills gaps only. */
export function resolvePdfAgentContact(
  agent: GenerateRequestPayload["agent"],
  branding: UserBrandingProfile | null,
): GenerateRequestPayload["agent"] {
  const legalDisclaimer =
    branding?.customLegalImprint?.trim() ||
    agent.legalDisclaimer.trim() ||
    "";

  return {
    ...agent,
    name: agent.name.trim() || branding?.brokerName?.trim() || "",
    agency: agent.agency.trim() || branding?.agencyName?.trim() || "",
    phone: agent.phone.trim() || branding?.contactPhone?.trim() || "",
    email: agent.email.trim() || branding?.contactEmail?.trim() || "",
    legalDisclaimer,
  };
}

export type ResolvedPdfBranding = PDFBrandingProps & {
  logoUrl?: string;
  avatarUrl?: string;
  website?: string;
  /** @deprecated Prefer primaryColor */
  brandColor: string;
};

export function pdfBrandingFromProfile(
  branding: UserBrandingProfile | null,
  isPro: boolean,
): ResolvedPdfBranding {
  if (!isPro || !branding) {
    return {
      primaryColor: DEFAULT_PRIMARY_COLOR,
      accentColor: DEFAULT_ACCENT_COLOR,
      brandColor: DEFAULT_PRIMARY_COLOR,
    };
  }

  const primaryColor = branding.brandColor?.trim() || DEFAULT_PRIMARY_COLOR;
  const accentColor = branding.accentColor?.trim() || DEFAULT_ACCENT_COLOR;

  return {
    primaryColor,
    accentColor,
    brandColor: primaryColor,
    agencyLogoUrl: branding.logoUrl ?? undefined,
    agentAvatarUrl: branding.agentAvatarUrl ?? undefined,
    logoUrl: branding.logoUrl ?? undefined,
    avatarUrl: branding.agentAvatarUrl ?? undefined,
    fontFamily: isBrandFontFamily(branding.fontFamily) ? branding.fontFamily : "modern",
    website: branding.website?.trim() || undefined,
  };
}

export async function logoUrlToDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : undefined);
      reader.onerror = () => reject(new Error("logo read failed"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export const avatarUrlToDataUrl = logoUrlToDataUrl;
