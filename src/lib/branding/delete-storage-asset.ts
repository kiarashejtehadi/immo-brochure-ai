import { BRAND_LOGOS_BUCKET } from "@/lib/branding/constants";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const ASSET_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"] as const;

/** Best-effort removal of uploaded logo/avatar files for a user. */
export async function deleteBrandingStorageAsset(
  userId: string,
  asset: "logo" | "avatar",
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const paths = ASSET_EXTENSIONS.map((ext) => `${userId}/${asset}.${ext}`);
  const { error } = await supabase.storage.from(BRAND_LOGOS_BUCKET).remove(paths);
  if (error) {
    console.warn(`[branding/${asset}] storage delete`, error.message);
  }
}
