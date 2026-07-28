# Magic links: Supabase built-in email vs Send Email hook

## What you use today (no hook)

Emails from **Supabase Auth** `<noreply@mail.app.supabase.io>` are sent by Supabase’s **built-in** mailer.

| Limit | Effect |
|--------|--------|
| **~2 emails / hour** | “email rate limit exceeded” after a few tries |
| **PKCE magic links** | The link must be opened in the **same browser** where you clicked **Sign in** (same device; not iPhone Mail if you requested on laptop) |

The app expects Supabase to redirect back to:

`https://immo-brochure-ai.vercel.app/auth/callback?code=…&next=/de`

### Supabase settings (required for built-in mail)

**Authentication → URL configuration**

| Field | Value |
|--------|--------|
| **Site URL** | `https://immo-brochure-ai.vercel.app` |
| **Redirect URLs** | `https://immo-brochure-ai.vercel.app/auth/callback` |

Save, then request a **new** magic link.

### Test without hook

1. On **https://immo-brochure-ai.vercel.app/de**, click **Sign in**.
2. On the **same machine and browser**, open the email and click the link **once**.
3. You should see “Signing you in…”, then `/de` with your email in the header.

If you see `?auth=error&reason=…`, read `reason` — often PKCE / wrong browser.

---

## Recommended for production: Send Email hook + Resend

Built-in mail is for testing. For real users, use the hook so links work from any mail app and limits are higher.

See **[AUTH_EMAIL_HOOK.md](./AUTH_EMAIL_HOOK.md)** — enable **Authentication → Hooks → Send Email** and Vercel env vars (`RESEND_API_KEY`, etc.).

You do **not** need custom SMTP in Supabase if the hook is enabled.

---

## Vercel

`NEXT_PUBLIC_APP_URL=https://immo-brochure-ai.vercel.app`

Redeploy after env or Supabase URL changes.
