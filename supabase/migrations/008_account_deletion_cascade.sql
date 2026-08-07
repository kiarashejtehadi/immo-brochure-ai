-- GDPR account deletion: ensure auth.users removal cascades to all app data.
-- Safe to re-run in Supabase SQL Editor.

-- public.users (profile / billing) -> auth.users
alter table if exists public.users drop constraint if exists users_id_fkey;
alter table public.users
  add constraint users_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- Billing & usage tables -> public.users
alter table if exists public.subscriptions drop constraint if exists subscriptions_user_id_fkey;
alter table public.subscriptions
  add constraint subscriptions_user_id_fkey
  foreign key (user_id) references public.users (id) on delete cascade;

alter table if exists public.user_credits drop constraint if exists user_credits_user_id_fkey;
alter table public.user_credits
  add constraint user_credits_user_id_fkey
  foreign key (user_id) references public.users (id) on delete cascade;

alter table if exists public.generation_logs drop constraint if exists generation_logs_user_id_fkey;
alter table public.generation_logs
  add constraint generation_logs_user_id_fkey
  foreign key (user_id) references public.users (id) on delete cascade;

alter table if exists public.payment_fulfillments drop constraint if exists payment_fulfillments_user_id_fkey;
alter table public.payment_fulfillments
  add constraint payment_fulfillments_user_id_fkey
  foreign key (user_id) references public.users (id) on delete cascade;

-- Deleting auth.users cascades: auth.users -> public.users -> subscriptions, credits, logs, fulfillments.
