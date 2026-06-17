-- HotMess platform rule: no active access without verified identity.
-- Unverified users may only register, complete their profile, verify, change settings, and contact support.

update public.profiles
set verification_status = 'pending'
where verification_status = 'unverified';

alter table public.profiles
  alter column verification_status set default 'pending';

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%verification_status%'
  loop
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_verification_status_check
  check (verification_status in ('pending','verified','rejected','suspended'));

create or replace function public.is_verified_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.verification_status = 'verified'
      and coalesce(p.is_banned, false) = false
  );
$$;

alter table public.business_profiles
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists owner_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists legal_name text,
  add column if not exists display_name text,
  add column if not exists legal_form text,
  add column if not exists company_register_number text,
  add column if not exists vat_id text,
  add column if not exists business_address text,
  add column if not exists country text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists authorized_representative text,
  add column if not exists iban_encrypted text,
  add column if not exists verification_status text default 'pending'
    check (verification_status in ('pending','verified','rejected','suspended')),
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.profiles(id);

update public.business_profiles
set owner_user_id = coalesce(owner_user_id, user_id),
    legal_name = coalesce(legal_name, company, headline, 'HotMess Business'),
    display_name = coalesce(display_name, company, headline),
    verification_status = case
      when coalesce(is_verified_business, verified_business, false) = true then 'verified'
      else coalesce(verification_status, 'pending')
    end;

update public.business_profiles
set id = gen_random_uuid()
where id is null;

create unique index if not exists idx_business_profiles_id
  on public.business_profiles(id);

create index if not exists idx_business_profiles_owner_verification
  on public.business_profiles(owner_user_id, verification_status);

create table if not exists public.business_profile_modules (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid references public.business_profiles(id) on delete cascade,
  module_key text not null check (module_key in (
    'business',
    'dating_entrepreneur',
    'creator_business',
    'local_services',
    'ai_marketplace',
    'eat_restaurant',
    'event_vendor'
  )),
  is_active boolean not null default true,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (business_profile_id, module_key)
);

alter table public.business_profile_modules enable row level security;

create or replace function public.has_verified_business_module(
  p_module_key text,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_profiles bp
    join public.business_profile_modules bpm
      on bpm.business_profile_id = bp.id
    where coalesce(bp.owner_user_id, bp.user_id) = p_user_id
      and bp.verification_status = 'verified'
      and bpm.module_key = p_module_key
      and bpm.is_active = true
  );
$$;

drop policy if exists "verified business can use assigned module" on public.business_profile_modules;
create policy "verified business can use assigned module" on public.business_profile_modules
for select using (
  public.is_admin()
  or exists (
    select 1
    from public.business_profiles bp
    where bp.id = business_profile_modules.business_profile_id
      and coalesce(bp.owner_user_id, bp.user_id) = auth.uid()
      and bp.verification_status = 'verified'
  )
);

create policy "admin manages business modules" on public.business_profile_modules
for all using (public.is_admin())
with check (public.is_admin());

-- Core visibility: non-verified users and non-verified profile owners stay invisible.
drop policy if exists "profiles own full and public basics" on public.profiles;
create policy "profiles own full and verified visible" on public.profiles
for select using (
  id = auth.uid()
  or public.is_admin()
  or (
    public.is_verified_user(auth.uid())
    and verification_status = 'verified'
    and (is_private = false or public.is_following(id))
  )
);

drop policy if exists "published events readable by logged in users" on public.events;
create policy "published events readable by verified users" on public.events
for select using (
  public.is_admin()
  or (published = true and public.is_verified_user(auth.uid()))
);

drop policy if exists "visible posts" on public.posts;
create policy "visible posts from verified users" on public.posts
for select using (
  public.is_admin()
  or (author_id = auth.uid() and public.is_verified_user(auth.uid()))
  or (
    public.is_verified_user(auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = posts.author_id
        and p.verification_status = 'verified'
        and (p.is_private = false or public.is_following(p.id))
    )
  )
);

drop policy if exists "insert own posts" on public.posts;
create policy "insert own posts verified only" on public.posts
for insert with check (author_id = auth.uid() and public.is_verified_user(auth.uid()));

drop policy if exists "comments visible with post" on public.comments;
create policy "comments visible with verified post access" on public.comments
for select using (
  public.is_admin()
  or (
    public.is_verified_user(auth.uid())
    and (
      author_id = auth.uid()
      or exists (select 1 from public.posts p where p.id = comments.post_id)
    )
  )
);

drop policy if exists "insert own comments" on public.comments;
create policy "insert own comments verified only" on public.comments
for insert with check (author_id = auth.uid() and public.is_verified_user(auth.uid()));

drop policy if exists "likes visible logged in" on public.likes;
create policy "likes visible verified only" on public.likes
for select using (public.is_admin() or public.is_verified_user(auth.uid()));

drop policy if exists "like as self" on public.likes;
create policy "like as self verified only" on public.likes
for insert with check (user_id = auth.uid() and public.is_verified_user(auth.uid()));

drop policy if exists "conversation members read conversations" on public.conversations;
create policy "verified conversation members read conversations" on public.conversations
for select using (public.is_admin() or (public.is_verified_user(auth.uid()) and public.is_conversation_member(id)));

drop policy if exists "conversation members read messages" on public.messages;
create policy "verified conversation members read messages" on public.messages
for select using (public.is_verified_user(auth.uid()) and public.is_conversation_member(conversation_id));

drop policy if exists "conversation members insert messages" on public.messages;
create policy "verified conversation members insert messages" on public.messages
for insert with check (sender_id = auth.uid() and public.is_verified_user(auth.uid()) and public.is_conversation_member(conversation_id));

drop policy if exists "create own follow" on public.follows;
create policy "create own follow verified only" on public.follows
for insert with check (follower_id = auth.uid() and public.is_verified_user(auth.uid()));

drop policy if exists "create follow request" on public.follow_requests;
create policy "create follow request verified only" on public.follow_requests
for insert with check (from_user_id = auth.uid() and public.is_verified_user(auth.uid()));

drop policy if exists "read dating profiles" on public.dating_profiles;
create policy "read dating profiles verified only" on public.dating_profiles
for select using (
  public.is_verified_user(auth.uid())
  and (select dating_enabled from public.profiles where id = auth.uid()) = true
  and is_active = true
  and exists (
    select 1 from public.profiles p
    where p.id = dating_profiles.user_id
      and p.verification_status = 'verified'
  )
  and not exists (
    select 1 from public.blocks
    where (blocker_id = auth.uid() and blocked_id = dating_profiles.user_id)
       or (blocker_id = dating_profiles.user_id and blocked_id = auth.uid())
  )
);

drop policy if exists "read business profiles" on public.business_profiles;
create policy "read verified business profiles" on public.business_profiles
for select using (
  public.is_admin()
  or user_id = auth.uid()
  or (
    public.is_verified_user(auth.uid())
    and (select business_enabled from public.profiles where id = auth.uid()) = true
    and is_active = true
    and verification_status = 'verified'
    and not exists (
      select 1 from public.blocks
      where (blocker_id = auth.uid() and blocked_id = business_profiles.user_id)
         or (blocker_id = business_profiles.user_id and blocked_id = auth.uid())
    )
  )
);
