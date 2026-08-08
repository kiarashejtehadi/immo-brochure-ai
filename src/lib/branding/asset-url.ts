/** Bump when branding assets change — busts CDN/browser cache for Supabase public URLs. */
export function versionedBrandingAssetUrl(
  publicUrl: string,
  versionMs = Date.now(),
): string {
  try {
    const url = new URL(publicUrl);
    url.searchParams.set("v", String(versionMs));
    return url.toString();
  } catch {
    const separator = publicUrl.includes("?") ? "&" : "?";
    return `${publicUrl}${separator}v=${versionMs}`;
  }
}

export const BRANDING_REFRESH_EVENT = "immo:branding-refresh";
