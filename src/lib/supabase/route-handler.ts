import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  applyAuthCookiesToResponse,
  AUTH_COOKIE_DEFAULTS,
  mergeAuthCookieOptions,
} from "@/lib/supabase/cookie-options";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Supabase client that writes session cookies onto the route handler response. */
export function createSupabaseRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error("Supabase env vars are not configured.");
  }

  return createServerClient(url, anon, {
    cookieOptions: AUTH_COOKIE_DEFAULTS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        applyAuthCookiesToResponse(
          (name, value, options) => response.cookies.set(name, value, options),
          cookiesToSet,
        );
      },
    },
  });
}

/** Refresh auth tokens and return JSON plus persistent Set-Cookie headers. */
export async function refreshSupabaseAuthSession(request: NextRequest) {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    return NextResponse.json({ ok: false, email: null }, { status: 503 });
  }

  const pending: CookieToSet[] = [];
  const supabase = createServerClient(url, anon, {
    cookieOptions: AUTH_COOKIE_DEFAULTS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pending.push({ name, value, options: mergeAuthCookieOptions(options) });
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const response = NextResponse.json({
    ok: !error,
    email: user?.email ?? null,
    userId: user?.id ?? null,
  });
  pending.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}
