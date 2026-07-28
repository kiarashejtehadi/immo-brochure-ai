import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Email from browser session when API status has not loaded yet. */
export async function getBrowserAuthEmail(): Promise<string | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.email ?? null;
  } catch {
    return null;
  }
}

/** True when the browser Supabase client has a session (may lag server cookies). */
export async function hasBrowserAuthSession(): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return Boolean(session?.user?.email);
  } catch {
    return false;
  }
}

/** Refresh tokens so HttpOnly auth cookies stay in sync with the browser client. */
export async function refreshBrowserAuthSession(): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.refreshSession();
    return !error && Boolean(data.session?.user?.email);
  } catch {
    return false;
  }
}
