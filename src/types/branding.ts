export type UserBrandingProfile = {
  logoUrl: string | null;
  brandColor: string | null;
  agencyName: string | null;
  brokerName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
};

export type UserBrandingUpdate = Partial<UserBrandingProfile>;

export const DEFAULT_BRAND_COLOR = "#1E293B";
