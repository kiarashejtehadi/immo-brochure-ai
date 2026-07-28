import { NextResponse } from "next/server";
import { getSupabaseAuthUser } from "@/lib/billing/access";
import { getActiveSubscription } from "@/lib/billing/repository";
import { updateUserBranding } from "@/lib/branding/repository";
import { BRAND_LOGOS_BUCKET } from "@/lib/branding/constants";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export async function POST(request: Request) {
  const user = await getSupabaseAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return NextResponse.json(
      { error: "Custom logo is a Pro feature. Subscribe to upload your agency logo." },
      { status: 403 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use PNG or JPG." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Logo must be under 2 MB." }, { status: 400 });
  }

  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const path = `${user.id}/logo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createSupabaseServiceClient();
  const { error: uploadError } = await supabase.storage
    .from(BRAND_LOGOS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("[branding/logo]", uploadError);
    return NextResponse.json({ error: "Upload failed." }, { status: 502 });
  }

  const { data: publicUrl } = supabase.storage.from(BRAND_LOGOS_BUCKET).getPublicUrl(path);
  const branding = await updateUserBranding(user.id, { logoUrl: publicUrl.publicUrl });
  return NextResponse.json({ logoUrl: publicUrl.publicUrl, branding });
}
