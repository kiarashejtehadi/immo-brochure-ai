-- =============================================================================
-- RUN THIS FILE ONLY if migration 001 already succeeded (you have users, etc.)
-- Do NOT re-run 001_billing_schema.sql — it will error on existing policies.
-- =============================================================================

-- Rename legacy Stripe column if present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'stripe_customer_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'payment_customer_id'
  ) then
    alter table public.users rename column stripe_customer_id to payment_customer_id;
  end if;
end $$;

-- Ensure payment_customer_id exists (if users table predates this column)
alter table public.users add column if not exists payment_customer_id text;

create table if not exists public.payment_fulfillments (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  user_id uuid not null references public.users (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now(),
  unique (provider, external_id)
);

create index if not exists payment_fulfillments_user_id_idx on public.payment_fulfillments (user_id);

alter table public.payment_fulfillments enable row level security;

-- No client policies: server (service role) only.
