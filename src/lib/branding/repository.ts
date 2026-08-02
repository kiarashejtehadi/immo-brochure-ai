import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { isBrandFontFamily } from "@/lib/branding/font-family";
import type { UserBrandingProfile, UserBrandingUpdate } from "@/types/branding";

type DbUserBrandingRow = {
  logo_url: string | null;
  brand_color: string | null;
  accent_color: string | null;
  agent_avatar_url: string | null;
  font_family: string | null;
  custom_legal_imprint: string | null;
  agency_name: string | null;
  broker_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
};

const BRANDING_SELECT =
  "logo_url, brand_color, accent_color, agent_avatar_url, font_family, custom_legal_imprint, agency_name, broker_name, contact_phone, contact_email, website";

function mapRow(row: DbUserBrandingRow): UserBrandingProfile {
  return {
    logoUrl: row.logo_url,
    brandColor: row.brand_color,
    accentColor: row.accent_color,
    agentAvatarUrl: row.agent_avatar_url,
    fontFamily: isBrandFontFamily(row.font_family) ? row.font_family : null,
    customLegalImprint: row.custom_legal_imprint,
    agencyName: row.agency_name,
    brokerName: row.broker_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    website: row.website,
  };
}

export async function getUserBranding(userId: string): Promise<UserBrandingProfile | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select(BRANDING_SELECT)
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as DbUserBrandingRow);
}

export async function updateUserBranding(
  userId: string,
  patch: UserBrandingUpdate,
): Promise<UserBrandingProfile> {
  const supabase = createSupabaseServiceClient();
  const payload: Record<string, string | null> = {};
  if (patch.logoUrl !== undefined) payload.logo_url = patch.logoUrl;
  if (patch.brandColor !== undefined) payload.brand_color = patch.brandColor;
  if (patch.accentColor !== undefined) payload.accent_color = patch.accentColor;
  if (patch.agentAvatarUrl !== undefined) payload.agent_avatar_url = patch.agentAvatarUrl;
  if (patch.fontFamily !== undefined) payload.font_family = patch.fontFamily;
  if (patch.customLegalImprint !== undefined) payload.custom_legal_imprint = patch.customLegalImprint;
  if (patch.agencyName !== undefined) payload.agency_name = patch.agencyName;
  if (patch.brokerName !== undefined) payload.broker_name = patch.brokerName;
  if (patch.contactPhone !== undefined) payload.contact_phone = patch.contactPhone;
  if (patch.contactEmail !== undefined) payload.contact_email = patch.contactEmail;
  if (patch.website !== undefined) payload.website = patch.website;

  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select(BRANDING_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update branding.");
  }
  return mapRow(data as DbUserBrandingRow);
}
