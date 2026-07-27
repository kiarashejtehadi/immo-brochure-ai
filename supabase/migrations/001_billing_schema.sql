-- Run in Supabase SQL Editor (Dashboard → SQL) or via Supabase CLI.

create extension if not exists "pgcrypto";

-- Profile row synced from Supabase Auth on first sign-in.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  payment_customer_id text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  provider_subscription_id text not null unique,
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  plan_id text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

create table if not exists public.user_credits (
  user_id uuid primary key references public.users (id) on delete cascade,
  remaining_credits integer not null default 0 check (remaining_credits >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  used_credit boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists generation_logs_user_id_idx on public.generation_logs (user_id);

-- Atomic credit decrement (returns new balance or null if insufficient).
create or replace function public.decrement_user_credit(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  update public.user_credits
  set remaining_credits = remaining_credits - 1,
      updated_at = now()
  where user_id = p_user_id
    and remaining_credits > 0
  returning remaining_credits into new_balance;

  return new_balance;
end;
$$;

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_credits enable row level security;
alter table public.generation_logs enable row level security;

-- Users can read their own billing rows (writes go through service role on server).
-- Safe to re-run: only creates each policy if it does not exist yet.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'users_select_own'
  ) then
    create policy "users_select_own" on public.users
      for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'subscriptions_select_own'
  ) then
    create policy "subscriptions_select_own" on public.subscriptions
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_credits' and policyname = 'credits_select_own'
  ) then
    create policy "credits_select_own" on public.user_credits
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'generation_logs' and policyname = 'logs_select_own'
  ) then
    create policy "logs_select_own" on public.generation_logs
      for select using (auth.uid() = user_id);
  end if;
end $$;
