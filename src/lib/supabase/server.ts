import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  applyAuthCookiesToResponse,
  AUTH_COOKIE_DEFAULTS,
} from "@/lib/supabase/cookie-options";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function setCookiesOnStore(
  setCookie: (name: string, value: string, options: CookieOptions) => void,
  cookiesToSet: CookieToSet[],
) {
  applyAuthCookiesToResponse(setCookie, cookiesToSet);
}

export async function createSupabaseServerClient() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error("Supabase env vars are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookieOptions: AUTH_COOKIE_DEFAULTS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          setCookiesOnStore(
            (name, value, options) => cookieStore.set(name, value, options),
            cookiesToSet,
          );
        } catch {
          // Called from a Server Component — session refresh happens in middleware/API routes.
        }
      },
    },
  });
}

export function createSupabaseServiceClient() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) {
    throw new Error("Supabase service role is not configured.");
  }

  return createServerClient(url, serviceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });
}
