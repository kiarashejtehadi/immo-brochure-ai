import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

function otpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null;
  const allowed: EmailOtpType[] = [
    "magiclink",
    "signup",
    "invite",
    "recovery",
    "email_change",
    "email",
  ];
  if (allowed.includes(raw as EmailOtpType)) return raw as EmailOtpType;
  if (raw === "email_change_new") return "email_change";
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = searchParams.get("next") ?? "/en";
  const target = next.startsWith("/") ? next : "/en";
  const successUrl = `${origin}${target}`;
  const errorUrl = `${origin}/en?auth=error`;

  if (searchParams.get("error")) {
    console.error("[auth/callback] provider error", searchParams.get("error_description"));
    return NextResponse.redirect(errorUrl);
  }

  const response = NextResponse.redirect(successUrl);
  const supabase = createSupabaseRouteHandlerClient(request, response);

  const tokenHash = searchParams.get("token_hash");
  const type = otpType(searchParams.get("type"));
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      console.error("[auth/callback] verifyOtp", error.message);
      return NextResponse.redirect(errorUrl);
    }
    return response;
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession", error.message);
      return NextResponse.redirect(errorUrl);
    }
    return response;
  }

  return NextResponse.redirect(errorUrl);
}
