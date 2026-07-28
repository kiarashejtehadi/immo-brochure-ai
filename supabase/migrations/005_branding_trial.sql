-- Branding fields + free trial credits for new accounts.
-- Run after 004 in Supabase SQL Editor.

alter table public.users add column if not exists logo_url text;
alter table public.users add column if not exists brand_color text;
alter table public.users add column if not exists agency_name text;
alter table public.users add column if not exists broker_name text;
alter table public.users add column if not exists contact_phone text;
alter table public.users add column if not exists contact_email text;
alter table public.users add column if not exists website text;

alter table public.user_credits add column if not exists trial_credits integer not null default 0;
alter table public.user_credits drop constraint if exists user_credits_trial_credits_check;
alter table public.user_credits add constraint user_credits_trial_credits_check check (trial_credits >= 0);

-- New sign-ups: 2 free trial credits (watermarked PDFs until Pro subscription).
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

  insert into public.user_credits (user_id, remaining_credits, trial_credits)
  values (p_user_id, 2, 2)
  on conflict (user_id) do nothing;
end;
$$;

-- Public logo bucket (user id prefix in object path).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-logos',
  'brand-logos',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_public_read' and tablename = 'objects'
  ) then
    create policy "brand_logos_public_read"
      on storage.objects for select
      using (bucket_id = 'brand-logos');
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_auth_upload_own' and tablename = 'objects'
  ) then
    create policy "brand_logos_auth_upload_own"
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'brand-logos'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_auth_update_own' and tablename = 'objects'
  ) then
    create policy "brand_logos_auth_update_own"
      on storage.objects for update
      to authenticated
      using (
        bucket_id = 'brand-logos'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_auth_delete_own' and tablename = 'objects'
  ) then
    create policy "brand_logos_auth_delete_own"
      on storage.objects for delete
      to authenticated
      using (
        bucket_id = 'brand-logos'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;
