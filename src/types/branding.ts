export type BrandFontFamily = "modern" | "classic" | "minimal";

export type UserBrandingProfile = {
  logoUrl: string | null;
  brandColor: string | null;
  accentColor: string | null;
  agentAvatarUrl: string | null;
  fontFamily: BrandFontFamily | null;
  customLegalImprint: string | null;
  agencyName: string | null;
  brokerName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
};

export type UserBrandingUpdate = Partial<UserBrandingProfile>;

export const DEFAULT_PRIMARY_COLOR = "#1E3A8A";
export const DEFAULT_ACCENT_COLOR = "#3B82F6";
/** @deprecated Use DEFAULT_PRIMARY_COLOR */
export const DEFAULT_BRAND_COLOR = DEFAULT_PRIMARY_COLOR;

export type PDFBrandingProps = {
  primaryColor?: string;
  accentColor?: string;
  agencyLogoUrl?: string;
  agentAvatarUrl?: string;
  fontFamily?: BrandFontFamily | string;
};
