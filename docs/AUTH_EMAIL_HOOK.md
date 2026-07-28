# Magic links without Supabase SMTP (Send Email Hook + Resend)

Supabase **free** built-in mail is capped at **2 emails/hour**. Custom SMTP needs a **verified domain**. This hook sends auth emails via **Resend** instead.

## 1. Resend (no domain yet)

1. Sign up at [resend.com](https://resend.com).
2. **API Keys** → create key → copy `re_…`.
3. **Without a domain**, you can only send **from** `onboarding@resend.dev` **to the email address you used for Resend** (fine for solo testing).
4. Later: add your domain in Resend, verify DNS, then set  
   `RESEND_FROM=Immo Brochure AI <noreply@yourdomain.com>` on Vercel.

## 2. Deploy the hook endpoint

Push the app so this URL exists:

`https://immo-brochure-ai.vercel.app/api/auth/hook/send-email`

## 3. Vercel env vars

| Variable | Value |
|----------|--------|
| `RESEND_API_KEY` | `re_…` from Resend |
| `RESEND_FROM` | `Immo Brochure AI <onboarding@resend.dev>` (until you have a domain) |
| `SEND_EMAIL_HOOK_SECRET` | From Supabase step 4 (full string including `v1,whsec_…`) |

Redeploy after adding vars.

## 4. Supabase — enable Send Email hook

1. **Authentication** → **Hooks** (or **Auth Hooks**).
2. **Send Email** → enable.
3. **HTTP endpoint URL:**  
   `https://immo-brochure-ai.vercel.app/api/auth/hook/send-email`
4. Generate / copy the **hook secret** → same value as `SEND_EMAIL_HOOK_SECRET` on Vercel.
5. Save.

Supabase will **stop** using built-in email for auth; all magic links go through your hook.

You can leave **Custom SMTP** off if the hook is enabled.

## 5. Supabase URL settings (still required)

- **Site URL:** `https://immo-brochure-ai.vercel.app`
- **Redirect URLs:** `https://immo-brochure-ai.vercel.app/auth/callback`

## 6. Test

1. Wait if you still hit old rate limits (~1 hour).
2. Open production → **Sign in** → one magic link request.
3. Check inbox (and spam). Magic links in the email now point **directly** to `/auth/callback?token_hash=…` (not Supabase `/auth/v1/verify`). That works when you open the mail on another device or browser — no PKCE cookie required.

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Resend “validation_error” / domain | Use `onboarding@resend.dev` and send **to** your Resend account email only |
| 401 on hook | `SEND_EMAIL_HOOK_SECRET` must match Supabase exactly |
| Still localhost in link | Fix **Site URL** in Supabase |
| Rate limit | Hook bypasses Supabase’s 2/h built-in cap; Resend has its own free tier limits |

When you buy a domain, verify it in Resend and update `RESEND_FROM` — no code change needed.
