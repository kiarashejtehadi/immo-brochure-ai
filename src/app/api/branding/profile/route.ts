import { NextResponse } from "next/server";
import { getSupabaseAuthUser } from "@/lib/billing/access";
import { getUserBranding, updateUserBranding } from "@/lib/branding/repository";
import type { UserBrandingUpdate } from "@/types/branding";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSupabaseAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const branding = await getUserBranding(user.id);
  return NextResponse.json({ branding: branding ?? {} });
}

export async function PATCH(request: Request) {
  const user = await getSupabaseAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: UserBrandingUpdate;
  try {
    body = (await request.json()) as UserBrandingUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.brandColor && !/^#[0-9A-Fa-f]{6}$/.test(body.brandColor)) {
    return NextResponse.json({ error: "brandColor must be a hex code like #1E293B." }, { status: 400 });
  }

  try {
    const branding = await updateUserBranding(user.id, body);
    return NextResponse.json({ branding });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
