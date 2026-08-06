import { createSupabaseBrowserClient } from "@/lib/supabase/client";

async function syncServerAuthSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean; email?: string | null };
    return Boolean(data.ok && data.email);
  } catch {
    return false;
  }
}

/** Email from browser session when API status has not loaded yet. */
export async function getBrowserAuthEmail(): Promise<string | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!error && user?.email) return user.email;

    await syncServerAuthSession();
    const {
      data: { user: refreshedUser },
    } = await supabase.auth.getUser();
    return refreshedUser?.email ?? null;
  } catch {
    return null;
  }
}

/** True when the browser Supabase client has a session. */
export async function hasBrowserAuthSession(): Promise<boolean> {
  const email = await getBrowserAuthEmail();
  return Boolean(email);
}

/** Refresh tokens so HttpOnly auth cookies stay in sync with the browser client. */
export async function refreshBrowserAuthSession(): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.refreshSession();
    const browserOk = !error && Boolean(data.session?.user?.email);
    const serverOk = await syncServerAuthSession();
    return browserOk || serverOk;
  } catch {
    return syncServerAuthSession();
  }
}

export { syncServerAuthSession };
