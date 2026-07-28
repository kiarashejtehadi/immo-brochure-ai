-- Server-side billing writes (checkout, webhooks, generate).
-- Run in Supabase SQL Editor after 001–003.

grant usage on schema public to service_role;

grant select, insert, update, delete on table public.users to service_role;
grant select, insert, update, delete on table public.subscriptions to service_role;
grant select, insert, update, delete on table public.user_credits to service_role;
grant select, insert, update, delete on table public.generation_logs to service_role;

grant select, insert, update, delete on table public.payment_fulfillments to service_role;

-- Idempotent profile + credits row (runs as table owner, not caller).
create or replace function public.ensure_billing_user(p_user_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (p_user_id, p_email)
  on conflict (id) do update set email = excluded.email;

  insert into public.user_credits (user_id, remaining_credits)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.ensure_billing_user(uuid, text) from public;
revoke all on function public.ensure_billing_user(uuid, text) from anon;
revoke all on function public.ensure_billing_user(uuid, text) from authenticated;

grant execute on function public.ensure_billing_user(uuid, text) to service_role;
