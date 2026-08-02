import { NextResponse } from "next/server";
import { getSupabaseAuthUser } from "@/lib/billing/access";
import { getUserBranding, updateUserBranding } from "@/lib/branding/repository";
import { isBrandFontFamily } from "@/lib/branding/font-family";
import type { UserBrandingUpdate } from "@/types/branding";

export const runtime = "nodejs";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function validateHexColor(value: string | null | undefined, field: string): string | null {
  if (value == null) return null;
  if (!HEX_COLOR.test(value)) {
    return `${field} must be a hex code like #1E3A8A.`;
  }
  return null;
}

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

  const colorError =
    validateHexColor(body.brandColor, "brandColor") ??
    validateHexColor(body.accentColor, "accentColor");
  if (colorError) {
    return NextResponse.json({ error: colorError }, { status: 400 });
  }

  if (body.fontFamily != null && !isBrandFontFamily(body.fontFamily)) {
    return NextResponse.json(
      { error: "fontFamily must be modern, classic, or minimal." },
      { status: 400 },
    );
  }

  try {
    const branding = await updateUserBranding(user.id, body);
    return NextResponse.json({ branding });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
