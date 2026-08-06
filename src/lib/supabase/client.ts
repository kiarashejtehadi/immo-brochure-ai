import { createBrowserClient } from "@supabase/ssr";
import { AUTH_COOKIE_DEFAULTS } from "@/lib/supabase/cookie-options";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error("Supabase env vars are not configured.");
  }

  return createBrowserClient(url, anon, {
    cookieOptions: AUTH_COOKIE_DEFAULTS,
  });
}
