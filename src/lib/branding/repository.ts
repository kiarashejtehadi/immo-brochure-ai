import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { UserBrandingProfile, UserBrandingUpdate } from "@/types/branding";

type DbUserBrandingRow = {
  logo_url: string | null;
  brand_color: string | null;
  agency_name: string | null;
  broker_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
};

function mapRow(row: DbUserBrandingRow): UserBrandingProfile {
  return {
    logoUrl: row.logo_url,
    brandColor: row.brand_color,
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
    .select(
      "logo_url, brand_color, agency_name, broker_name, contact_phone, contact_email, website",
    )
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
  if (patch.agencyName !== undefined) payload.agency_name = patch.agencyName;
  if (patch.brokerName !== undefined) payload.broker_name = patch.brokerName;
  if (patch.contactPhone !== undefined) payload.contact_phone = patch.contactPhone;
  if (patch.contactEmail !== undefined) payload.contact_email = patch.contactEmail;
  if (patch.website !== undefined) payload.website = patch.website;

  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select(
      "logo_url, brand_color, agency_name, broker_name, contact_phone, contact_email, website",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update branding.");
  }
  return mapRow(data as DbUserBrandingRow);
}
