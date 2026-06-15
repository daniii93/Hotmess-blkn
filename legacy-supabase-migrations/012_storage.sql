-- Storage metadata for R2/Supabase/local media providers
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_provider text not null default 'local' check (storage_provider in ('local', 'r2', 'supabase')),
  bucket text,
  folder text not null,
  path text not null,
  public_url text,
  media_type text not null,
  mime_type text not null,
  file_size integer not null default 0,
  width integer,
  height integer,
  duration numeric,
  thumbnail_url text,
  uploaded_by uuid references public.users(id) on delete set null,
  related_module text,
  related_id uuid,
  status text not null default 'active' check (status in ('active', 'processing', 'failed', 'archived', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('verification', 'verification', false),
  ('event-covers', 'event-covers', true),
  ('chat-media', 'chat-media', false)
on conflict (id) do nothing;

create policy "Avatar files are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload own avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Verification files are admin readable"
on storage.objects for select
using (bucket_id = 'verification' and public.is_admin());

create policy "Users can upload own verification files"
on storage.objects for insert
with check (
  bucket_id = 'verification'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Event covers are public"
on storage.objects for select
using (bucket_id = 'event-covers');

create policy "Admins upload event covers"
on storage.objects for insert
with check (bucket_id = 'event-covers' and public.is_admin());

create policy "Chat media is readable by participants"
on storage.objects for select
using (
  bucket_id = 'chat-media'
  and exists (
    select 1 from public.chat_participants cp
    where cp.chat_id::text = (storage.foldername(name))[1]
      and cp.user_id = auth.uid()
      and cp.deleted_for_user = false
  )
);

create policy "Chat participants upload chat media"
on storage.objects for insert
with check (
  bucket_id = 'chat-media'
  and exists (
    select 1 from public.chat_participants cp
    where cp.chat_id::text = (storage.foldername(name))[1]
      and cp.user_id = auth.uid()
      and cp.blocked = false
  )
);
