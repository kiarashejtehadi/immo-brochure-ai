# Billing setup (Supabase + Lemon Squeezy)

Billing is **off** until `BILLING_ENABLED=true` and all required env vars are set. With billing disabled, `/api/generate` works as before (no login or credits).

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers → Email**: enable Email; configure magic links as you prefer.
3. **Authentication → URL configuration**:
   - **Site URL:** `https://immo-brochure-ai.vercel.app` (not `localhost` — otherwise magic links open locally)
   - **Redirect URLs** (add both):
     - `https://immo-brochure-ai.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (local dev only)
4. **SQL Editor**: run migrations in order:
   - `supabase/migrations/001_billing_schema.sql`
   - `supabase/migrations/002_lemonsqueezy.sql`
   - `supabase/migrations/005_branding_trial.sql` (branding columns, 2 trial credits, logo storage)

   Both scripts are **idempotent** (safe to run more than once). If `001` failed on policies because you already ran it once, either re-run the updated `001` file or run only `002` — your tables from the first run are already in place.

   **Still on `stripe_customer_id`?** Run `002` — it renames that column to `payment_customer_id` and creates `payment_fulfillments`.
5. Copy **Project URL**, **anon key**, and **service role key** into Vercel / `.env.local`.

   **Important:** `SUPABASE_SERVICE_ROLE_KEY` must be the **service_role** secret from **Project Settings → API**, not the anon/public key. Using the anon key causes `permission denied for table users` when creating checkout.

## 2. Lemon Squeezy

1. Create a [Lemon Squeezy](https://app.lemonsqueezy.com) store.
2. Create three **Products / Variants**:
   - **Credit pack** — one-time payment (e.g. 5 generations).
   - **Monthly** — subscription, monthly interval.
   - **Yearly** — subscription, yearly interval.
3. Copy each **Variant ID** (numeric) into:
   - `LEMONSQUEEZY_VARIANT_CREDITS_PACK`
   - `LEMONSQUEEZY_VARIANT_MONTHLY`
   - `LEMONSQUEEZY_VARIANT_YEARLY`
4. Set `LEMONSQUEEZY_CREDITS_PACK_SIZE` to match one credit-pack purchase.
5. **Settings → API**: create API key → `LEMONSQUEEZY_API_KEY`.
6. Note your **Store ID** → `LEMONSQUEEZY_STORE_ID`.
7. **Settings → Webhooks → Add webhook**:
   - URL: `https://your-domain.com/api/webhooks/payment`
   - Signing secret → `LEMONSQUEEZY_WEBHOOK_SECRET` (same value in Vercel)
   - Events:
     - `order_created`
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
8. Enable **Customer portal** for subscriptions (Store → Subscriptions settings) so **Manage subscription** works.

9. **Activate your store** in Lemon Squeezy when you want the hosted billing portal (`[store].lemonsqueezy.com/billing`) to work. Until activation, checkout can work in **test mode**, but customers may see *“This store has not been activated”* on **Manage subscription**. As store owner, cancel or edit test subscriptions in the [Lemon Squeezy dashboard](https://app.lemonsqueezy.com/) → **Subscriptions**.

For local checkout testing, set `LEMONSQUEEZY_TEST_MODE=true` and use Lemon Squeezy test mode.

## 3. App environment

| Variable | Purpose |
|----------|---------|
| `BILLING_ENABLED` | `true` when Supabase + Lemon Squeezy are ready |
| `NEXT_PUBLIC_APP_URL` | Public origin (redirect after checkout, magic links) |
| Supabase vars | Auth + database |
| Lemon Squeezy vars | Checkout, webhooks, variants |
| `OPENAI_API_KEY` | Generation |

Redeploy after changing env vars.

## 4. User flow

1. User signs in via email magic link (`Sign in` → `/auth/callback`).
2. **Pricing** at `/[locale]/checkout` → Lemon Squeezy Checkout (`POST /api/checkout/create`).
3. Webhook grants subscription or adds credits (`custom_data`: `userId`, `planKey`, `creditsToGrant`).
4. **Generate** requires active subscription (including cancelled-until-period-end) or credits.
5. **Manage subscription** opens Lemon Squeezy customer portal URL from the active subscription.

## 5. Beta gate

If the beta gate is enabled (`BETA_GATE_ENABLED=true` and `BETA_PASSWORD` set), `/auth/callback` is allowed without a beta cookie so magic links still work.
