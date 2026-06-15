-- HotMess rebuild schema: exact platform base for public, app, dating, business, scanner and admin.
create extension if not exists "pgcrypto";

create type public.profile_role as enum ('user', 'scanner', 'admin');
create type public.gender_type as enum ('female', 'male', 'diverse');
create type public.ticket_status as enum ('reserved', 'valid', 'used', 'cancelled', 'expired');
create type public.order_status as enum ('pending', 'paid', 'failed', 'cancelled', 'expired');
create type public.follow_status as enum ('pending', 'accepted', 'declined');
create type public.message_type as enum ('text', 'image', 'voice', 'event_card', 'location');
create type public.conversation_type as enum ('direct', 'group', 'event');
create type public.privacy_level as enum ('public', 'followers_only', 'private');
create type public.dating_tier as enum ('plus', 'gold', 'platinum');
create type public.job_type as enum ('fulltime', 'parttime', 'freelance', 'internship', 'gig');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  first_name text not null,
  last_name text not null,
  username text unique not null check (username ~ '^[a-z0-9._]{3,30}$'),
  role public.profile_role not null default 'user',
  gender public.gender_type not null,
  avatar_url text,
  cover_image_url text,
  bio text check (char_length(bio) <= 150),
  city text,
  country text check (country in ('AT', 'DE', 'CH', 'IT')),
  language text not null default 'de' check (language in ('de', 'sr', 'it')),
  date_of_birth date not null check (date_of_birth <= (current_date - interval '18 years')),
  profile_music_url text,
  profile_music_title text,
  profile_music_artist text,
  is_private boolean not null default true,
  show_followers boolean not null default true,
  show_following boolean not null default true,
  show_event_count boolean not null default true,
  show_online_status boolean not null default true,
  show_last_active boolean not null default true,
  show_profile_visits boolean not null default true,
  events_visited integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_event_date date,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  stripe_identity_session_id text,
  onboarding_completed boolean not null default false,
  dating_enabled boolean not null default false,
  business_enabled boolean not null default false,
  last_active_at timestamptz not null default now(),
  is_active boolean not null default true,
  is_banned boolean not null default false,
  banned_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_username on public.profiles(username);
create index idx_profiles_verification on public.profiles(verification_status);

create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_label text,
  ip_hash text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.account_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  detail jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  city text not null,
  country text not null,
  address text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete set null,
  title text not null,
  slug text unique not null,
  city text not null,
  category text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  hero_image_url text,
  preview_text text,
  description text,
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_gender_config (
  event_id uuid primary key references public.events(id) on delete cascade,
  female_capacity integer not null default 0,
  male_capacity integer not null default 0,
  diverse_capacity integer not null default 0,
  sold_female integer not null default 0,
  sold_male integer not null default 0,
  sold_diverse integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',
  capacity integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  status public.order_status not null default 'pending',
  provider text check (provider in ('stripe', 'paypal')),
  provider_session_id text,
  items jsonb not null default '[]'::jsonb,
  amount_cents integer not null default 0,
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  status public.ticket_status not null default 'reserved',
  gender public.gender_type not null,
  qr_token text unique,
  reserved_until timestamptz,
  scanned_at timestamptz,
  scanned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  gender public.gender_type not null,
  position integer not null,
  status text not null default 'waiting' check (status in ('waiting', 'promoted', 'expired', 'converted', 'cancelled')),
  promoted_until timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table public.order_split_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payer_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null,
  status public.order_status not null default 'pending',
  payment_link_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  code text unique not null,
  type text not null check (type in ('percent', 'fixed')),
  value integer not null,
  active boolean not null default true,
  user_id uuid references public.profiles(id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.event_tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  min_persons integer not null default 1,
  max_persons integer not null default 1,
  price_cents integer not null default 0,
  active boolean not null default true
);

create table public.table_bookings (
  id uuid primary key default gen_random_uuid(),
  event_table_id uuid not null references public.event_tables(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  booked_by uuid not null references public.profiles(id) on delete cascade,
  member_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.drink_packages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  price_cents integer not null default 0,
  requires_table boolean not null default true,
  hotmess_girls_service_available boolean not null default false,
  active boolean not null default true
);

create table public.drink_package_bookings (
  id uuid primary key default gen_random_uuid(),
  drink_package_id uuid not null references public.drink_packages(id) on delete cascade,
  table_booking_id uuid references public.table_bookings(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  hotmess_girls_service boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.birthday_packages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  price_cents integer not null default 0,
  active boolean not null default true
);

create table public.hotel_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  external_url text not null,
  commission_percent numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.hotel_codes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  hotel_partner_id uuid not null references public.hotel_partners(id) on delete cascade,
  code text unique not null,
  created_at timestamptz not null default now()
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.follow_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.follow_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_user_id, to_user_id)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('text', 'image', 'event', 'announcement')),
  body text,
  image_url text,
  event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.friend_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  event_id uuid references public.events(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.activity_privacy_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  show_ticket_purchase boolean not null default true,
  show_follow_activity boolean not null default true,
  show_event_attendance boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  caption text,
  poll jsonb,
  question jsonb,
  expires_at timestamptz not null default now() + interval '24 hours',
  created_at timestamptz not null default now()
);

create table public.story_views (
  story_id uuid not null references public.stories(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);

create table public.story_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  story_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.saved_posts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  type public.conversation_type not null,
  event_id uuid references public.events(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  unread_count integer not null default 0,
  muted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  type public.message_type not null default 'text',
  body text,
  media_url text,
  reply_to_id uuid references public.messages(id) on delete set null,
  reactions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.message_requests (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  status public.follow_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notification_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  likes boolean not null default true,
  comments boolean not null default true,
  follows boolean not null default true,
  follow_requests boolean not null default true,
  chat boolean not null default true,
  event_updates boolean not null default true,
  email_enabled boolean not null default true,
  push_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.scanner_access (
  scanner_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (scanner_id, event_id)
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null,
  awarded_at timestamptz not null default now()
);

create table public.user_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  milestone_key text not null,
  reached_at timestamptz not null default now()
);

create table public.profile_visits (
  id uuid primary key default gen_random_uuid(),
  visited_user_id uuid not null references public.profiles(id) on delete cascade,
  visitor_user_id uuid not null references public.profiles(id) on delete cascade,
  is_anonymous boolean not null default false,
  visited_at timestamptz not null default now(),
  expires_at timestamptz generated always as (visited_at + interval '24 hours') stored
);

create index idx_visits_visited on public.profile_visits(visited_user_id, visited_at desc);

create table public.dating_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  relationship_goal text,
  interests text[] not null default '{}',
  languages text[] not null default '{}',
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dating_swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('like', 'nope', 'superlike')),
  created_at timestamptz not null default now(),
  unique (swiper_id, target_id)
);

create table public.dating_matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.dating_boosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null
);

create table public.dating_subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tier public.dating_tier not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.dating_top_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.event_dating_pool (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.event_match_meetups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  dating_match_id uuid not null references public.dating_matches(id) on delete cascade,
  both_consented boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.business_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  company text,
  role_title text,
  industry text,
  looking_for text,
  offering text,
  career_status text not null,
  verified_business boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('interest', 'skip', 'priority_connect')),
  created_at timestamptz not null default now(),
  unique (swiper_id, target_id)
);

create table public.business_matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.coffee_chats (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  format text not null check (format in ('in_person', 'video')),
  scheduled_at timestamptz,
  feedback jsonb,
  created_at timestamptz not null default now()
);

create table public.business_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  city text,
  industry text,
  created_at timestamptz not null default now()
);

create table public.business_group_members (
  group_id uuid not null references public.business_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.business_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  score numeric not null default 0,
  created_at timestamptz not null default now()
);

create table public.job_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  company text not null,
  type public.job_type not null,
  category text not null,
  city text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_listings(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  cv_url text,
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text,
  city text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_following(target_user uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.follows
    where follower_id = auth.uid() and following_id = target_user
  );
$$;

create or replace function public.is_conversation_member(target_conversation uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = target_conversation and user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, first_name, last_name, date_of_birth, gender)
  values (
    new.id,
    new.email,
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)), '[^a-z0-9._]', '', 'g')),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'date_of_birth')::date, date '2000-01-01'),
    coalesce((new.raw_user_meta_data->>'gender')::public.gender_type, 'diverse'::public.gender_type)
  )
  on conflict (id) do nothing;

  insert into public.notification_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.activity_privacy_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.protect_sensitive_profile_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = new.id and not public.is_admin() then
    new.role = old.role;
    new.verification_status = old.verification_status;
    new.stripe_identity_session_id = old.stripe_identity_session_id;
    new.is_banned = old.is_banned;
    new.banned_reason = old.banned_reason;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_sensitive_fields
before update on public.profiles
for each row execute function public.protect_sensitive_profile_fields();

alter table public.profiles enable row level security;
alter table public.user_sessions enable row level security;
alter table public.account_audit enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.event_gender_config enable row level security;
alter table public.ticket_types enable row level security;
alter table public.tickets enable row level security;
alter table public.waitlist enable row level security;
alter table public.orders enable row level security;
alter table public.order_split_payments enable row level security;
alter table public.discount_codes enable row level security;
alter table public.event_tables enable row level security;
alter table public.table_bookings enable row level security;
alter table public.drink_packages enable row level security;
alter table public.drink_package_bookings enable row level security;
alter table public.birthday_packages enable row level security;
alter table public.hotel_partners enable row level security;
alter table public.hotel_codes enable row level security;
alter table public.follows enable row level security;
alter table public.follow_requests enable row level security;
alter table public.blocks enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.event_attendees enable row level security;
alter table public.friend_activity enable row level security;
alter table public.activity_privacy_settings enable row level security;
alter table public.stories enable row level security;
alter table public.story_views enable row level security;
alter table public.story_highlights enable row level security;
alter table public.saved_posts enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_settings enable row level security;
alter table public.scanner_access enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_milestones enable row level security;
alter table public.profile_visits enable row level security;
alter table public.dating_profiles enable row level security;
alter table public.dating_swipes enable row level security;
alter table public.dating_matches enable row level security;
alter table public.dating_boosts enable row level security;
alter table public.dating_subscriptions enable row level security;
alter table public.dating_top_picks enable row level security;
alter table public.event_dating_pool enable row level security;
alter table public.event_match_meetups enable row level security;
alter table public.business_profiles enable row level security;
alter table public.business_swipes enable row level security;
alter table public.business_matches enable row level security;
alter table public.coffee_chats enable row level security;
alter table public.business_groups enable row level security;
alter table public.business_group_members enable row level security;
alter table public.business_recommendations enable row level security;
alter table public.job_listings enable row level security;
alter table public.job_applications enable row level security;
alter table public.job_alerts enable row level security;

create policy "profiles own full and public basics" on public.profiles
for select using (id = auth.uid() or public.is_admin() or is_private = false or public.is_following(id));
create policy "profiles update own or admin" on public.profiles
for update using (id = auth.uid() or public.is_admin());

create policy "own sessions" on public.user_sessions
for select using (user_id = auth.uid() or public.is_admin());
create policy "own session inserts" on public.user_sessions
for insert with check (user_id = auth.uid());
create policy "own session deletes" on public.user_sessions
for delete using (user_id = auth.uid() or public.is_admin());

create policy "own account audit" on public.account_audit
for select using (user_id = auth.uid() or public.is_admin());

create policy "see own follows" on public.follows
for select using (follower_id = auth.uid() or following_id = auth.uid() or public.is_admin());
create policy "create own follow" on public.follows
for insert with check (follower_id = auth.uid());
create policy "delete own follow" on public.follows
for delete using (follower_id = auth.uid() or public.is_admin());

create policy "see relevant requests" on public.follow_requests
for select using (from_user_id = auth.uid() or to_user_id = auth.uid() or public.is_admin());
create policy "create follow request" on public.follow_requests
for insert with check (from_user_id = auth.uid());
create policy "respond to follow request" on public.follow_requests
for update using (to_user_id = auth.uid() or public.is_admin());

create policy "see relevant blocks" on public.blocks
for select using (blocker_id = auth.uid() or public.is_admin());
create policy "block as self" on public.blocks
for insert with check (blocker_id = auth.uid());
create policy "unblock as self" on public.blocks
for delete using (blocker_id = auth.uid() or public.is_admin());

create policy "published events readable by logged in users" on public.events
for select using (published = true and auth.uid() is not null or public.is_admin());
create policy "admin writes events" on public.events
for all using (public.is_admin()) with check (public.is_admin());

create policy "own tickets only" on public.tickets
for select using (user_id = auth.uid() or public.is_admin());
create policy "own orders only" on public.orders
for select using (user_id = auth.uid() or public.is_admin());

create policy "visible posts" on public.posts
for select using (
  public.is_admin()
  or author_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = posts.author_id
      and (p.is_private = false or public.is_following(p.id))
  )
);
create policy "insert own posts" on public.posts
for insert with check (author_id = auth.uid());
create policy "delete own posts or admin" on public.posts
for delete using (author_id = auth.uid() or public.is_admin());

create policy "comments visible with post" on public.comments
for select using (public.is_admin() or author_id = auth.uid() or exists (select 1 from public.posts p where p.id = comments.post_id));
create policy "insert own comments" on public.comments
for insert with check (author_id = auth.uid());
create policy "delete own comments or admin" on public.comments
for delete using (author_id = auth.uid() or public.is_admin());

create policy "likes visible logged in" on public.likes
for select using (auth.uid() is not null);
create policy "like as self" on public.likes
for insert with check (user_id = auth.uid());
create policy "unlike as self" on public.likes
for delete using (user_id = auth.uid());

create policy "conversation members read conversations" on public.conversations
for select using (public.is_admin() or public.is_conversation_member(id));
create policy "conversation members read messages" on public.messages
for select using (public.is_conversation_member(conversation_id));
create policy "conversation members insert messages" on public.messages
for insert with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));

create policy "own notifications" on public.notifications
for select using (user_id = auth.uid() or public.is_admin());
create policy "own notification settings" on public.notification_settings
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "see my profile visits" on public.profile_visits
for select using (visited_user_id = auth.uid() or public.is_admin());
create policy "log profile visit" on public.profile_visits
for insert with check (visitor_user_id = auth.uid());

create policy "dating opt in own profile" on public.dating_profiles
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "business opt in own profile" on public.business_profiles
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "scanner access own or admin" on public.scanner_access
for select using (scanner_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('posts', 'posts', false),
  ('chat', 'chat', false)
on conflict (id) do nothing;

create policy "own avatar uploads"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "own avatar reads"
on storage.objects for select
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "own post media uploads"
on storage.objects for insert
with check (bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "post media owner reads"
on storage.objects for select
using (bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "conversation chat media uploads"
on storage.objects for insert
with check (
  bucket_id = 'chat'
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
  )
);

create policy "conversation chat media reads"
on storage.objects for select
using (
  bucket_id = 'chat'
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
  )
);
