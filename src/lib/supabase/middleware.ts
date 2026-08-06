import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  applyAuthCookiesToResponse,
  AUTH_COOKIE_DEFAULTS,
} from "@/lib/supabase/cookie-options";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Refresh Supabase auth cookies on the given response (e.g. from next-intl middleware). */
export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookieOptions: AUTH_COOKIE_DEFAULTS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        applyAuthCookiesToResponse(
          (name, value, options) => response.cookies.set(name, value, options),
          cookiesToSet,
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
