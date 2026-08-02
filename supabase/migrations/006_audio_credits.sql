-- Trial voice dictation usage (2 free parses for non-Pro users).
alter table public.user_credits add column if not exists audio_credits_used integer not null default 0;
alter table public.user_credits drop constraint if exists user_credits_audio_credits_used_check;
alter table public.user_credits add constraint user_credits_audio_credits_used_check check (audio_credits_used >= 0);
