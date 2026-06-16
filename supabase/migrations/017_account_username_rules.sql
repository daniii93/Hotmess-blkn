-- HotMess account creation and username lifecycle rules.

create table if not exists public.contact_verifications (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  contact_type text not null check (contact_type in ('email','phone')),
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_verifications_contact
  on public.contact_verifications(contact, contact_type, created_at desc);

alter table public.profiles
  add column if not exists username_changed_at timestamptz,
  add column if not exists is_official_partner boolean not null default false,
  add column if not exists suggestible boolean not null default true;

create table if not exists public.released_usernames (
  username text primary key,
  released_at timestamptz not null default now(),
  cooldown_until timestamptz
);

create table if not exists public.username_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  old_username text,
  new_username text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','auto')),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_username_change_requests_user
  on public.username_change_requests(user_id, created_at desc);

alter table public.contact_verifications enable row level security;
alter table public.released_usernames enable row level security;
alter table public.username_change_requests enable row level security;

drop policy if exists "service role contact verifications" on public.contact_verifications;
create policy "service role contact verifications" on public.contact_verifications
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "read own username requests" on public.username_change_requests;
create policy "read own username requests" on public.username_change_requests
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin username requests" on public.username_change_requests;
create policy "admin username requests" on public.username_change_requests
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin released usernames" on public.released_usernames;
create policy "admin released usernames" on public.released_usernames
for all
using (public.is_admin())
with check (public.is_admin());
