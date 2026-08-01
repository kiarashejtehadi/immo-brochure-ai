import type { UserBrandingProfile } from "@/types/branding";
import type { GenerateRequestPayload } from "@/types/listing";
import { DEFAULT_BRAND_COLOR } from "@/types/branding";

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
  return {
    ...agent,
    name: agent.name.trim() || branding?.brokerName?.trim() || "",
    agency: agent.agency.trim() || branding?.agencyName?.trim() || "",
    phone: agent.phone.trim() || branding?.contactPhone?.trim() || "",
    email: agent.email.trim() || branding?.contactEmail?.trim() || "",
  };
}

export function pdfBrandingFromProfile(
  branding: UserBrandingProfile | null,
  isPro: boolean,
): {
  brandColor: string;
  logoUrl?: string;
  website?: string;
} {
  if (!isPro || !branding) {
    return { brandColor: DEFAULT_BRAND_COLOR };
  }
  return {
    brandColor: branding.brandColor?.trim() || DEFAULT_BRAND_COLOR,
    logoUrl: branding.logoUrl ?? undefined,
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
