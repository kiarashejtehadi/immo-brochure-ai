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

const LEGACY_BRANDING_SELECT =
  "logo_url, brand_color, agency_name, broker_name, contact_phone, contact_email, website";

const EXTENDED_BRANDING_SELECT =
  "accent_color, agent_avatar_url, font_family, custom_legal_imprint";

const FULL_BRANDING_SELECT = `${LEGACY_BRANDING_SELECT}, ${EXTENDED_BRANDING_SELECT}`;

const EXTENDED_DB_KEYS = new Set([
  "accent_color",
  "agent_avatar_url",
  "font_family",
  "custom_legal_imprint",
]);

export const BRAND_KIT_MIGRATION_HINT =
  "Brand Kit database columns are missing. Run supabase/migrations/007_brand_kit.sql in the Supabase SQL Editor, then try again.";

function isMissingColumnError(message: string | undefined): boolean {
  if (!message) return false;
  return /column|does not exist|unknown|schema cache/i.test(message);
}

function mapRow(row: Partial<DbUserBrandingRow>): UserBrandingProfile {
  return {
    logoUrl: row.logo_url ?? null,
    brandColor: row.brand_color ?? null,
    accentColor: row.accent_color ?? null,
    agentAvatarUrl: row.agent_avatar_url ?? null,
    fontFamily: isBrandFontFamily(row.font_family) ? row.font_family : null,
    customLegalImprint: row.custom_legal_imprint ?? null,
    agencyName: row.agency_name ?? null,
    brokerName: row.broker_name ?? null,
    contactPhone: row.contact_phone ?? null,
    contactEmail: row.contact_email ?? null,
    website: row.website ?? null,
  };
}

function buildPayload(patch: UserBrandingUpdate): Record<string, string | null> {
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
  return payload;
}

async function selectBrandingRow(userId: string, select: string) {
  const supabase = createSupabaseServiceClient();
  return supabase.from("users").select(select).eq("id", userId).maybeSingle();
}

export async function getUserBranding(userId: string): Promise<UserBrandingProfile | null> {
  let { data, error } = await selectBrandingRow(userId, FULL_BRANDING_SELECT);

  if (error && isMissingColumnError(error.message)) {
    ({ data, error } = await selectBrandingRow(userId, LEGACY_BRANDING_SELECT));
  }

  if (error || !data) return null;
  return mapRow(data as unknown as DbUserBrandingRow);
}

export async function updateUserBranding(
  userId: string,
  patch: UserBrandingUpdate,
): Promise<UserBrandingProfile> {
  const supabase = createSupabaseServiceClient();
  const payload = buildPayload(patch);

  if (Object.keys(payload).length === 0) {
    const existing = await getUserBranding(userId);
    if (!existing) throw new Error("User not found.");
    return existing;
  }

  const touchesExtended = Object.keys(payload).some((key) => EXTENDED_DB_KEYS.has(key));

  let { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select(FULL_BRANDING_SELECT)
    .single();

  if (error && isMissingColumnError(error.message)) {
    if (touchesExtended) {
      throw new Error(BRAND_KIT_MIGRATION_HINT);
    }

    const legacyPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => !EXTENDED_DB_KEYS.has(key)),
    );

    ({ data, error } = await supabase
      .from("users")
      .update(legacyPayload)
      .eq("id", userId)
      .select(LEGACY_BRANDING_SELECT)
      .single());
  }

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update branding.");
  }

  return mapRow(data as unknown as DbUserBrandingRow);
}
