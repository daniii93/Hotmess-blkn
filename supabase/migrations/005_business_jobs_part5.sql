-- HotMess Teil 5: Business & Jobs.
-- Optional opt-in mode, separated from main profile and dating, connected to events and chat.

alter table public.business_profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists headline text not null default '',
  add column if not exists company text,
  add column if not exists position text,
  add column if not exists industry text,
  add column if not exists experience_years integer,
  add column if not exists bio text check (char_length(bio) <= 600),
  add column if not exists photo_url text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists languages text[] not null default '{}',
  add column if not exists website_url text,
  add column if not exists linkedin_url text,
  add column if not exists looking_for_tags text[] not null default '{}',
  add column if not exists offering_tags text[] not null default '{}',
  add column if not exists open_to_work boolean not null default false,
  add column if not exists open_to_hire boolean not null default false,
  add column if not exists tier text not null default 'free' check (tier in ('free','plus')),
  add column if not exists premium_until timestamptz,
  add column if not exists is_verified_business boolean not null default false,
  add column if not exists daily_suggestions_seen integer not null default 0,
  add column if not exists suggestions_reset_at date,
  add column if not exists connection_requests_today integer not null default 0;

update public.business_profiles
set
  headline = coalesce(nullif(headline, ''), concat_ws(' · ', nullif(role_title, ''), nullif(company, ''))),
  position = coalesce(position, role_title),
  looking_for_tags = case
    when cardinality(looking_for_tags) = 0 and looking_for is not null then array[looking_for]
    else looking_for_tags
  end,
  offering_tags = case
    when cardinality(offering_tags) = 0 and offering is not null then array[offering]
    else offering_tags
  end,
  is_verified_business = coalesce(is_verified_business, verified_business);

alter table public.business_swipes
  add column if not exists swiped_id uuid references public.profiles(id) on delete cascade,
  add column if not exists direction text check (direction in ('skip','interested','priority')),
  add column if not exists context_note text;

update public.business_swipes
set swiped_id = coalesce(swiped_id, target_id),
    direction = coalesce(
      direction,
      case action when 'priority_connect' then 'priority' when 'interest' then 'interested' else 'skip' end
    )
where swiped_id is null or direction is null;

create index if not exists idx_business_swipes_swiped on public.business_swipes(swiped_id, direction);

alter table public.business_matches
  add column if not exists user_a_id uuid references public.profiles(id) on delete cascade,
  add column if not exists user_b_id uuid references public.profiles(id) on delete cascade,
  add column if not exists matched_via_event_id uuid references public.events(id) on delete set null,
  add column if not exists match_reason text,
  add column if not exists matched_at timestamptz not null default now(),
  add column if not exists is_active boolean not null default true;

update public.business_matches
set user_a_id = coalesce(user_a_id, user_a),
    user_b_id = coalesce(user_b_id, user_b);

alter table public.coffee_chats
  add column if not exists match_id uuid references public.business_matches(id) on delete cascade,
  add column if not exists proposed_by uuid references public.profiles(id) on delete cascade,
  add column if not exists recipient_id uuid references public.profiles(id) on delete cascade,
  add column if not exists mode text check (mode in ('in_person','video')),
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists proposed_times timestamptz[] not null default '{}',
  add column if not exists confirmed_time timestamptz,
  add column if not exists location text,
  add column if not exists status text not null default 'proposed' check (status in ('proposed','confirmed','completed','declined','cancelled')),
  add column if not exists feedback_a integer check (feedback_a between 1 and 5),
  add column if not exists feedback_b integer check (feedback_b between 1 and 5);

update public.coffee_chats
set proposed_by = coalesce(proposed_by, requester_id),
    recipient_id = coalesce(recipient_id, target_id),
    mode = coalesce(mode, format),
    confirmed_time = coalesce(confirmed_time, scheduled_at);

alter table public.business_groups
  add column if not exists description text,
  add column if not exists cover_url text,
  add column if not exists conversation_id uuid references public.conversations(id) on delete set null,
  add column if not exists is_private boolean not null default false,
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists member_count integer not null default 0,
  add column if not exists requires_plus_to_create boolean not null default true;

update public.business_groups
set created_by = coalesce(created_by, owner_id);

alter table public.business_group_members
  add column if not exists role text not null default 'member' check (role in ('member','moderator','admin')),
  add column if not exists joined_at timestamptz not null default now();

alter table public.job_listings
  add column if not exists posted_by uuid references public.profiles(id) on delete cascade,
  add column if not exists company_logo_url text,
  add column if not exists employment_type text check (employment_type in ('fulltime','parttime','freelance','internship','gig')),
  add column if not exists requirements text,
  add column if not exists location text,
  add column if not exists is_remote boolean not null default false,
  add column if not exists salary_min_cents integer,
  add column if not exists salary_max_cents integer,
  add column if not exists salary_period text check (salary_period in ('hour','day','month','year','project')),
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists application_method text not null default 'chat' check (application_method in ('chat','external')),
  add column if not exists external_url text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists status text not null default 'open' check (status in ('open','paused','filled','closed')),
  add column if not exists views_count integer not null default 0,
  add column if not exists applications_count integer not null default 0,
  add column if not exists expires_at timestamptz;

update public.job_listings
set posted_by = coalesce(posted_by, owner_id),
    employment_type = coalesce(employment_type, type::text),
    status = case when active = false then 'closed' else status end;

create index if not exists idx_jobs_category_status on public.job_listings(category, status, created_at desc);
create index if not exists idx_jobs_city_status on public.job_listings(city, status);

alter table public.job_applications
  add column if not exists cover_message text,
  add column if not exists status text not null default 'applied' check (status in ('applied','viewed','shortlisted','rejected','hired')),
  add column if not exists applied_at timestamptz not null default now();

alter table public.job_alerts
  add column if not exists categories text[] not null default '{}',
  add column if not exists cities text[] not null default '{}',
  add column if not exists employment_types text[] not null default '{}',
  add column if not exists is_active boolean not null default true;

update public.job_alerts
set categories = case when cardinality(categories) = 0 and category is not null then array[category] else categories end,
    cities = case when cardinality(cities) = 0 and city is not null then array[city] else cities end;

create table if not exists public.saved_jobs (
  user_id uuid references public.profiles(id) on delete cascade,
  job_id uuid references public.job_listings(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create table if not exists public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('1month','12months')),
  price_cents integer not null,
  payment_method text check (payment_method in ('stripe','paypal')),
  payment_id text,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  auto_renew boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.business_recommendations
  add column if not exists from_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists to_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists text text,
  add column if not exists relationship text,
  add column if not exists is_approved boolean not null default false;

update public.business_recommendations
set from_user_id = coalesce(from_user_id, user_id),
    to_user_id = coalesce(to_user_id, target_id),
    text = coalesce(text, 'Empfehlung vorbereitet');

create table if not exists public.business_profile_views (
  viewed_user_id uuid references public.profiles(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (viewed_user_id, viewer_id, viewed_at)
);

create table if not exists public.business_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  detail text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.saved_jobs enable row level security;
alter table public.business_subscriptions enable row level security;
alter table public.business_profile_views enable row level security;
alter table public.business_reports enable row level security;

drop policy if exists "business opt in own profile" on public.business_profiles;
create policy "read business profiles" on public.business_profiles
for select using (
  (select business_enabled from public.profiles where id = auth.uid()) = true
  and is_active = true
  and not exists (
    select 1 from public.blocks
    where (blocker_id = auth.uid() and blocked_id = business_profiles.user_id)
       or (blocker_id = business_profiles.user_id and blocked_id = auth.uid())
  )
);

create policy "manage own business profile" on public.business_profiles
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "own business swipes" on public.business_swipes
for select using (swiper_id = auth.uid() or public.is_admin());

create policy "create own business swipe" on public.business_swipes
for insert with check (swiper_id = auth.uid());

create policy "own business matches" on public.business_matches
for select using (user_a_id = auth.uid() or user_b_id = auth.uid() or user_a = auth.uid() or user_b = auth.uid() or public.is_admin());

create policy "own coffee chats" on public.coffee_chats
for select using (proposed_by = auth.uid() or recipient_id = auth.uid() or requester_id = auth.uid() or target_id = auth.uid() or public.is_admin());

create policy "read open business jobs" on public.job_listings
for select using (
  status = 'open'
  or posted_by = auth.uid()
  or owner_id = auth.uid()
  or public.is_admin()
);

create policy "manage own business jobs" on public.job_listings
for all using (posted_by = auth.uid() or owner_id = auth.uid() or public.is_admin())
with check (posted_by = auth.uid() or owner_id = auth.uid() or public.is_admin());

create policy "read relevant job applications" on public.job_applications
for select using (
  applicant_id = auth.uid()
  or exists (
    select 1 from public.job_listings j
    where j.id = job_applications.job_id
      and (j.posted_by = auth.uid() or j.owner_id = auth.uid())
  )
  or public.is_admin()
);

create policy "create own job application" on public.job_applications
for insert with check (applicant_id = auth.uid());

create policy "read business groups" on public.business_groups
for select using (
  is_private = false
  or exists (
    select 1 from public.business_group_members bgm
    where bgm.group_id = business_groups.id and bgm.user_id = auth.uid()
  )
  or public.is_admin()
);

create policy "own business group memberships" on public.business_group_members
for select using (user_id = auth.uid() or public.is_admin());

create policy "own business subscriptions" on public.business_subscriptions
for select using (user_id = auth.uid() or public.is_admin());

create policy "own saved jobs" on public.saved_jobs
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "own business profile views" on public.business_profile_views
for select using (viewed_user_id = auth.uid() or public.is_admin());

create policy "create business report" on public.business_reports
for insert with check (reporter_id = auth.uid());

create or replace function public.apply_business_subscription(
  p_user_id uuid,
  p_plan text,
  p_price_cents integer,
  p_payment_method text,
  p_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_until timestamptz;
begin
  v_until := case p_plan
    when '12months' then now() + interval '12 months'
    else now() + interval '1 month'
  end;

  insert into public.business_subscriptions (
    user_id, plan, price_cents, payment_method, payment_id, expires_at, is_active
  )
  values (p_user_id, p_plan, p_price_cents, p_payment_method, p_payment_id, v_until, true);

  update public.business_profiles
  set tier = 'plus',
      premium_until = v_until,
      updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object('tier', 'plus', 'premium_until', v_until);
end;
$$;

create or replace function public.reset_business_limits()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.business_profiles
  set daily_suggestions_seen = 0,
      connection_requests_today = 0,
      suggestions_reset_at = current_date
  where coalesce(suggestions_reset_at, date '1900-01-01') < current_date;

  update public.business_profiles
  set tier = 'free',
      premium_until = null
  where premium_until is not null
    and premium_until < now();

  return jsonb_build_object('reset', true);
end;
$$;

create or replace function public.sync_event_business_network()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return jsonb_build_object(
    'synced', true,
    'source', 'event_attendees',
    'note', 'Business event filtering reads event_attendees and business_enabled directly.'
  );
end;
$$;

create or replace function public.increment_job_applications(p_job_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.job_listings
  set applications_count = coalesce(applications_count, 0) + 1
  where id = p_job_id;
end;
$$;
