-- HotMess profile edit screen fields and profile link management.

alter table public.profiles
  add column if not exists pronouns text[] default '{}',
  add column if not exists ai_creator_label boolean not null default false,
  add column if not exists name_changed_at timestamptz,
  add column if not exists username_changed_at timestamptz,
  add column if not exists gender_changed_at timestamptz;

alter table public.posts
  add column if not exists grid_position integer;

create table if not exists public.profile_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_profile_links_user on public.profile_links(user_id, sort_order);

alter table public.profile_links enable row level security;

drop policy if exists "manage own links" on public.profile_links;
create policy "manage own links" on public.profile_links
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "read visible profile links" on public.profile_links;
create policy "read visible profile links" on public.profile_links
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_links.user_id
      and (
        p.id = auth.uid()
        or p.is_private = false
        or public.is_admin()
        or public.is_following(p.id)
      )
  )
);
