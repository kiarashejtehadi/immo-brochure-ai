-- Brand Kit: accent color, agent avatar, typography, custom legal imprint.
-- Run after 006 in Supabase SQL Editor.

alter table public.users add column if not exists accent_color text;
alter table public.users add column if not exists agent_avatar_url text;
alter table public.users add column if not exists font_family text;
alter table public.users add column if not exists custom_legal_imprint text;

-- Allow SVG logos in brand-logos bucket.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
where id = 'brand-logos';
