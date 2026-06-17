-- HotMess Teil 4: Dating.
-- Optional opt-in mode, separated from the main profile and connected to events and chat.

alter table public.dating_profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists display_name text not null default '',
  add column if not exists photos text[] not null default '{}',
  add column if not exists show_event_history boolean not null default false,
  add column if not exists looking_for text[] not null default array['everyone'],
  add column if not exists pref_age_min integer not null default 18,
  add column if not exists pref_age_max integer not null default 99,
  add column if not exists pref_distance_km integer not null default 50,
  add column if not exists pref_only_event_attendees boolean not null default false,
  add column if not exists pref_only_verified boolean not null default true,
  add column if not exists tier text not null default 'free' check (tier in ('free','plus','gold','platinum')),
  add column if not exists premium_until timestamptz,
  add column if not exists superlikes_remaining integer not null default 1,
  add column if not exists superlikes_reset_at date,
  add column if not exists swipes_today integer not null default 0,
  add column if not exists swipes_reset_at date,
  add column if not exists boosts_remaining integer not null default 0,
  add column if not exists rewinds_remaining integer not null default 1,
  add column if not exists first_impressions_remaining integer not null default 0;

update public.dating_profiles dp
set
  display_name = coalesce(nullif(display_name, ''), p.first_name),
  photos = case when cardinality(dp.photos) = 0 then dp.photo_urls else dp.photos end
from public.profiles p
where p.id = dp.user_id;

alter table public.dating_swipes
  add column if not exists swiped_id uuid references public.profiles(id) on delete cascade,
  add column if not exists direction text check (direction in ('left','right','super')),
  add column if not exists note text,
  add column if not exists is_first_impression boolean not null default false;

update public.dating_swipes
set swiped_id = coalesce(swiped_id, target_id),
    direction = coalesce(direction, case action when 'like' then 'right' when 'superlike' then 'super' else 'left' end)
where swiped_id is null or direction is null;

create index if not exists idx_swipes_swiped on public.dating_swipes(swiped_id, direction);

alter table public.dating_matches
  add column if not exists user_a_id uuid references public.profiles(id) on delete cascade,
  add column if not exists user_b_id uuid references public.profiles(id) on delete cascade,
  add column if not exists matched_via_event_id uuid references public.events(id) on delete set null,
  add column if not exists matched_at timestamptz not null default now(),
  add column if not exists is_active boolean not null default true,
  add column if not exists unmatched_by uuid references public.profiles(id) on delete set null,
  add column if not exists unmatched_at timestamptz;

update public.dating_matches
set user_a_id = coalesce(user_a_id, user_a),
    user_b_id = coalesce(user_b_id, user_b)
where user_a_id is null or user_b_id is null;

alter table public.dating_boosts
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists expires_at timestamptz,
  add column if not exists impressions integer not null default 0;

update public.dating_boosts
set started_at = coalesce(started_at, starts_at),
    expires_at = coalesce(expires_at, ends_at);

alter table public.dating_top_picks
  add column if not exists picked_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists generated_date date not null default current_date,
  add column if not exists is_premium_pick boolean not null default false,
  add column if not exists expires_at timestamptz;

update public.dating_top_picks
set picked_user_id = coalesce(picked_user_id, target_id),
    expires_at = coalesce(expires_at, now() + interval '24 hours');

alter table public.event_dating_pool
  add column if not exists is_visible boolean not null default true,
  add column if not exists show_hometown boolean not null default true,
  add column if not exists show_hotel_booked boolean not null default false,
  add column if not exists event_comment text check (char_length(event_comment) <= 100),
  add column if not exists has_hotel boolean not null default false,
  add column if not exists joined_at timestamptz not null default now();

alter table public.event_match_meetups
  add column if not exists match_id uuid references public.dating_matches(id) on delete cascade,
  add column if not exists user_a_confirmed boolean not null default false,
  add column if not exists user_b_confirmed boolean not null default false,
  add column if not exists shared_photo_url text,
  add column if not exists post_id uuid references public.posts(id) on delete set null;

update public.event_match_meetups
set match_id = coalesce(match_id, dating_match_id),
    user_a_confirmed = coalesce(user_a_confirmed, both_consented),
    user_b_confirmed = coalesce(user_b_confirmed, both_consented);

alter table public.dating_subscriptions
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists plan text check (plan in ('1week','1month','6months','12months')),
  add column if not exists price_cents integer not null default 0,
  add column if not exists payment_method text check (payment_method in ('stripe','paypal')),
  add column if not exists payment_id text,
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists expires_at timestamptz,
  add column if not exists auto_renew boolean not null default true,
  add column if not exists is_active boolean not null default true;

update public.dating_subscriptions
set is_active = coalesce(is_active, active),
    expires_at = coalesce(expires_at, now() + interval '1 month'),
    plan = coalesce(plan, '1month');

create table if not exists public.dating_consumable_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item text not null check (item in ('boost_1','boost_5','boost_10','superlike_5','superlike_25')),
  quantity integer not null,
  price_cents integer not null,
  payment_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.dating_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  detail text,
  status text not null default 'open' check (status in ('open','reviewed','actioned')),
  created_at timestamptz not null default now()
);

create table if not exists public.dating_room_consents (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.dating_matches(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid not null references public.profiles(id) on delete cascade,
  user_a_status text not null default 'pending' check (user_a_status in ('pending','accepted','declined','later')),
  user_b_status text not null default 'pending' check (user_b_status in ('pending','accepted','declined','later')),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now()
);

alter table public.dating_consumable_purchases enable row level security;
alter table public.dating_reports enable row level security;
alter table public.dating_room_consents enable row level security;

drop policy if exists "dating opt in own profile" on public.dating_profiles;
drop policy if exists "read dating profiles" on public.dating_profiles;
create policy "read dating profiles" on public.dating_profiles
for select using (
  (select dating_enabled from public.profiles where id = auth.uid()) = true
  and is_active = true
  and not exists (
    select 1 from public.blocks
    where (blocker_id = auth.uid() and blocked_id = dating_profiles.user_id)
       or (blocker_id = dating_profiles.user_id and blocked_id = auth.uid())
  )
);

drop policy if exists "manage own dating profile" on public.dating_profiles;
create policy "manage own dating profile" on public.dating_profiles
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "own swipes" on public.dating_swipes;
create policy "own swipes" on public.dating_swipes
for select using (swiper_id = auth.uid() or public.is_admin());

drop policy if exists "create own swipe" on public.dating_swipes;
create policy "create own swipe" on public.dating_swipes
for insert with check (swiper_id = auth.uid());

drop policy if exists "own matches" on public.dating_matches;
create policy "own matches" on public.dating_matches
for select using (user_a_id = auth.uid() or user_b_id = auth.uid() or user_a = auth.uid() or user_b = auth.uid() or public.is_admin());

drop policy if exists "read event dating pool" on public.event_dating_pool;
create policy "read event dating pool" on public.event_dating_pool
for select using (
  is_visible = true
  and exists (
    select 1 from public.event_dating_pool e2
    where e2.event_id = event_dating_pool.event_id
      and e2.user_id = auth.uid()
  )
);

drop policy if exists "own dating subs" on public.dating_subscriptions;
create policy "own dating subs" on public.dating_subscriptions
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "own dating purchases" on public.dating_consumable_purchases;
create policy "own dating purchases" on public.dating_consumable_purchases
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "create own dating report" on public.dating_reports;
create policy "create own dating report" on public.dating_reports
for insert with check (reporter_id = auth.uid());

drop policy if exists "own room consents" on public.dating_room_consents;
create policy "own room consents" on public.dating_room_consents
for select using (user_a_id = auth.uid() or user_b_id = auth.uid() or public.is_admin());

create or replace function public.apply_dating_subscription(
  p_user_id uuid,
  p_tier text,
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
    when '1week' then now() + interval '7 days'
    when '6months' then now() + interval '6 months'
    when '12months' then now() + interval '12 months'
    else now() + interval '1 month'
  end;

  insert into public.dating_subscriptions (
    user_id, tier, plan, price_cents, payment_method, payment_id, expires_at, is_active
  )
  values (p_user_id, p_tier::public.dating_tier, p_plan, p_price_cents, p_payment_method, p_payment_id, v_until, true)
  on conflict (user_id) do update
    set tier = excluded.tier,
        plan = excluded.plan,
        price_cents = excluded.price_cents,
        payment_method = excluded.payment_method,
        payment_id = excluded.payment_id,
        expires_at = excluded.expires_at,
        is_active = true;

  update public.dating_profiles
  set tier = p_tier::public.dating_tier,
      premium_until = v_until,
      updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object('tier', p_tier, 'premium_until', v_until);
end;
$$;

create or replace function public.reset_dating_limits()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dating_profiles
  set swipes_today = 0,
      swipes_reset_at = current_date,
      superlikes_remaining = case when tier = 'free' then 1 else 5 end,
      superlikes_reset_at = current_date
  where coalesce(swipes_reset_at, date '1900-01-01') < current_date
     or coalesce(superlikes_reset_at, date '1900-01-01') < current_date;

  update public.dating_profiles
  set tier = 'free',
      premium_until = null
  where premium_until is not null
    and premium_until < now();

  return jsonb_build_object('reset', true);
end;
$$;

create or replace function public.sync_event_dating_pool()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.event_dating_pool (event_id, user_id)
  select ea.event_id, ea.user_id
  from public.event_attendees ea
  join public.profiles p on p.id = ea.user_id
  join public.dating_profiles dp on dp.user_id = ea.user_id
  where p.dating_enabled = true
    and dp.is_active = true
    and ea.status = 'going'
  on conflict (event_id, user_id) do nothing;

  return jsonb_build_object('synced', true);
end;
$$;
