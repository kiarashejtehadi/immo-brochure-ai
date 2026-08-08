import { NextResponse } from "next/server";
import { getSupabaseAuthUser } from "@/lib/billing/access";
import { getActiveSubscription } from "@/lib/billing/repository";
import { deleteBrandingStorageAsset } from "@/lib/branding/delete-storage-asset";
import { versionedBrandingAssetUrl } from "@/lib/branding/asset-url";
import { updateUserBranding } from "@/lib/branding/repository";
import { BRAND_LOGOS_BUCKET } from "@/lib/branding/constants";
import { fileExtensionForMime, inferImageMimeType } from "@/lib/branding/upload-mime";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export async function POST(request: Request) {
  try {
    const user = await getSupabaseAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const subscription = await getActiveSubscription(user.id);
    if (!subscription) {
      return NextResponse.json(
        { error: "Agent avatar is a Pro feature. Subscribe to upload your photo." },
        { status: 403 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const mime = inferImageMimeType(file);
    if (!ALLOWED.has(mime)) {
      return NextResponse.json({ error: "Use JPEG or PNG." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Avatar must be under 2 MB." }, { status: 400 });
    }

    const ext = fileExtensionForMime(mime);
    const path = `${user.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await deleteBrandingStorageAsset(user.id, "avatar");

    const supabase = createSupabaseServiceClient();
    const { error: uploadError } = await supabase.storage
      .from(BRAND_LOGOS_BUCKET)
      .upload(path, buffer, { contentType: mime, upsert: true, cacheControl: "3600" });

    if (uploadError) {
      console.error("[branding/avatar]", uploadError);
      return NextResponse.json({ error: "Upload failed." }, { status: 502 });
    }

    const { data: publicUrl } = supabase.storage.from(BRAND_LOGOS_BUCKET).getPublicUrl(path);
    const agentAvatarUrl = versionedBrandingAssetUrl(publicUrl.publicUrl);
    const branding = await updateUserBranding(user.id, { agentAvatarUrl });
    return NextResponse.json({ agentAvatarUrl, branding });
  } catch (err) {
    console.error("[branding/avatar]", err);
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE() {
  try {
    const user = await getSupabaseAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const subscription = await getActiveSubscription(user.id);
    if (!subscription) {
      return NextResponse.json(
        { error: "Agent avatar is a Pro feature." },
        { status: 403 },
      );
    }

    await deleteBrandingStorageAsset(user.id, "avatar");
    const branding = await updateUserBranding(user.id, { agentAvatarUrl: null });
    return NextResponse.json({ agentAvatarUrl: null, branding });
  } catch (err) {
    console.error("[branding/avatar DELETE]", err);
    const message = err instanceof Error ? err.message : "Remove failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
