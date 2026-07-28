-- Restrict credit RPC to server (service role) only.
-- Without this, any client with the anon key could call decrement_user_credit for any user id.

revoke all on function public.decrement_user_credit(uuid) from public;
revoke all on function public.decrement_user_credit(uuid) from anon;
revoke all on function public.decrement_user_credit(uuid) from authenticated;

grant execute on function public.decrement_user_credit(uuid) to service_role;
