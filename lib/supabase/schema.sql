create extension if not exists "pgcrypto";

create type user_role as enum ('guest', 'member', 'passport_plus', 'passport_black', 'admin', 'partner', 'sponsor');
create type entity_status as enum ('draft', 'published', 'archived');
create type profile_status as enum ('active', 'paused', 'archived');
create type membership_status as enum ('active', 'trialing', 'cancelled', 'expired');
create type partner_status as enum ('lead', 'active', 'paused', 'archived');
create type visibility_status as enum ('public', 'members_only', 'hidden');
create type ticket_status as enum ('available', 'few_tickets', 'vip_available', 'passport_early_access', 'request', 'sold_out');
create type package_type as enum ('basic', 'travel', 'vip', 'signature');
create type package_availability as enum ('available', 'few_left', 'sold_out', 'request_only');
create type gallery_media_type as enum ('photos', 'video', 'aftermovie');
create type inquiry_type as enum ('package', 'hotel', 'vip_table', 'partner', 'ambassador', 'general');
create type inquiry_status as enum ('new', 'contacted', 'in_progress', 'converted', 'lost', 'archived');
create type redemption_status as enum ('available', 'redeemed', 'expired');

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  role user_role not null default 'member',
  name text not null,
  email text not null unique,
  city text,
  birthday date,
  interests jsonb not null default '[]'::jsonb,
  preferred_cities jsonb not null default '[]'::jsonb,
  avatar_url text,
  newsletter_consent boolean not null default false,
  status profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists membership_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price_monthly numeric(10,2) not null default 0,
  price_yearly numeric(10,2) not null default 0,
  description text not null,
  benefits jsonb not null default '[]'::jsonb,
  event_benefits jsonb not null default '[]'::jsonb,
  hotel_benefits jsonb not null default '[]'::jsonb,
  package_benefits jsonb not null default '[]'::jsonb,
  community_benefits jsonb not null default '[]'::jsonb,
  app_benefits jsonb not null default '[]'::jsonb,
  partner_benefits jsonb not null default '[]'::jsonb,
  badge_label text not null,
  priority integer not null default 0,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  tier_id uuid not null references membership_tiers(id) on delete restrict,
  status membership_status not null default 'active',
  started_at timestamptz not null default now(),
  renews_at timestamptz,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  city text not null,
  venue text not null,
  address text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  doors_open text,
  category text,
  short_description text not null,
  long_description text not null,
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  promo_video text,
  dress_code text,
  lineup jsonb not null default '[]'::jsonb,
  hosts jsonb not null default '[]'::jsonb,
  timetable jsonb not null default '[]'::jsonb,
  ticket_status ticket_status not null default 'available',
  ticket_provider text,
  ticket_url text,
  tickets jsonb not null default '[]'::jsonb,
  vip_available boolean not null default false,
  vip_description text,
  table_service_available boolean not null default false,
  hotel_ids jsonb not null default '[]'::jsonb,
  package_ids jsonb not null default '[]'::jsonb,
  partner_ids jsonb not null default '[]'::jsonb,
  sponsor_ids jsonb not null default '[]'::jsonb,
  membership_access text,
  app_enabled boolean not null default true,
  safety_notes jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'sold_out', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  price_from numeric(10,2) not null default 0,
  benefits jsonb not null default '[]'::jsonb,
  availability text,
  requires_membership boolean not null default false,
  status ticket_status not null default 'available',
  cta_label text not null default 'Tickets ansehen',
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  city text not null,
  address text,
  description text not null,
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  partner_status partner_status not null default 'lead',
  shuttle_active boolean not null default false,
  fast_lane_active boolean not null default false,
  booking_url text,
  membership_benefits jsonb not null default '[]'::jsonb,
  partner_ids jsonb not null default '[]'::jsonb,
  status entity_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  city text not null,
  start_date date not null,
  end_date date not null,
  package_type package_type not null,
  short_description text not null,
  long_description text not null,
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  promo_video text,
  price_from numeric(10,2) not null default 0,
  availability_status package_availability not null default 'available',
  included_items jsonb not null default '[]'::jsonb,
  excluded_items jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  event_ids jsonb not null default '[]'::jsonb,
  hotel_ids jsonb not null default '[]'::jsonb,
  partner_offer_ids jsonb not null default '[]'::jsonb,
  sponsor_ids jsonb not null default '[]'::jsonb,
  membership_benefits jsonb not null default '[]'::jsonb,
  vip_included boolean not null default false,
  shuttle_included boolean not null default false,
  welcome_bag_included boolean not null default false,
  concierge_included boolean not null default false,
  booking_url text,
  inquiry_email text,
  faq jsonb not null default '[]'::jsonb,
  status entity_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  city text not null,
  venue text not null,
  address text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  event_type text not null,
  short_description text not null,
  long_description text not null,
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  member_only boolean not null default false,
  capacity integer not null default 0,
  registration_required boolean not null default false,
  registration_url text,
  partner_ids jsonb not null default '[]'::jsonb,
  sponsor_ids jsonb not null default '[]'::jsonb,
  ambassador_ids jsonb not null default '[]'::jsonb,
  dress_code text,
  safety_notes jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  status entity_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  city text,
  description text not null,
  logo text,
  hero_image text,
  website_url text,
  contact_name text,
  contact_email text,
  partner_type text not null default 'standard' check (partner_type in ('standard', 'premium', 'signature')),
  visibility_level text,
  active_placements jsonb not null default '[]'::jsonb,
  offers jsonb not null default '[]'::jsonb,
  assigned_events jsonb not null default '[]'::jsonb,
  assigned_hotels jsonb not null default '[]'::jsonb,
  assigned_packages jsonb not null default '[]'::jsonb,
  membership_benefits jsonb not null default '[]'::jsonb,
  app_placements jsonb not null default '[]'::jsonb,
  notes text,
  status partner_status not null default 'lead',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists partner_offers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners(id) on delete cascade,
  title text not null,
  description text not null,
  code text,
  valid_from timestamptz,
  valid_until timestamptz,
  tier_required text check (tier_required in ('free', 'plus', 'black')),
  city text,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  city text not null,
  event_id uuid references events(id) on delete set null,
  event_name text,
  event_date date,
  media_type gallery_media_type not null default 'photos',
  cover_image text,
  images jsonb not null default '[]'::jsonb,
  video_url text,
  video_length text,
  description text,
  photographer text,
  partner_ids jsonb not null default '[]'::jsonb,
  sponsor_ids jsonb not null default '[]'::jsonb,
  visibility visibility_status not null default 'public',
  status entity_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_offers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id) on delete set null,
  title text not null,
  city text,
  description text not null,
  code text not null,
  valid_from timestamptz,
  valid_until timestamptz,
  tier_required text not null default 'free' check (tier_required in ('free', 'plus', 'black')),
  status text not null default 'draft' check (status in ('draft', 'active', 'expired', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  type inquiry_type not null,
  related_id uuid,
  subject text not null,
  name text not null,
  email text not null,
  phone text,
  city text,
  message text,
  related_event_id uuid references events(id) on delete set null,
  related_hotel_id uuid references hotels(id) on delete set null,
  related_package_id uuid references packages(id) on delete set null,
  related_partner_id uuid references partners(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  internal_notes text,
  status inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_saved_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'visited', 'recommended')),
  reminder_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, event_id)
);

create table if not exists user_saved_hotels (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'booked', 'recommended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, hotel_id)
);

create table if not exists user_saved_packages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  package_id uuid not null references packages(id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'inquiry', 'booked')),
  vip_interest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, package_id)
);

create table if not exists user_tickets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  ticket_type text not null,
  qr_code text,
  status text not null default 'active' check (status in ('active', 'used', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists benefit_redemptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  benefit_id uuid,
  code text,
  status redemption_status not null default 'available',
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade unique,
  lifecycle_stage text not null default 'registered' check (lifecycle_stage in ('visitor', 'registered', 'attendee', 'repeat_attendee', 'member', 'passport_plus', 'passport_black', 'ambassador', 'vip')),
  loyalty_level text not null default 'member' check (loyalty_level in ('member', 'silver', 'gold', 'black', 'ambassador')),
  loyalty_score integer not null default 0,
  event_score integer not null default 0,
  travel_score integer not null default 0,
  community_score integer not null default 0,
  membership_score integer not null default 0,
  last_activity text,
  last_activity_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade unique,
  points_balance integer not null default 0,
  loyalty_level text not null default 'member' check (loyalty_level in ('member', 'silver', 'gold', 'black', 'ambassador')),
  next_reward_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('registration', 'ticket_purchase', 'event_attendance', 'hotel_booking', 'package_booking', 'membership_upgrade', 'community_attendance', 'referral', 'partner_redemption')),
  points integer not null,
  description text not null,
  related_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  reward_key text not null unique,
  title text not null,
  points_required integer not null default 0,
  level_required text not null default 'member' check (level_required in ('member', 'silver', 'gold', 'black', 'ambassador')),
  description text,
  benefits jsonb not null default '[]'::jsonb,
  status text not null default 'available' check (status in ('available', 'limited', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  code text not null,
  referred_profile_id uuid references profiles(id) on delete set null,
  status text not null default 'invited' check (status in ('invited', 'registered', 'converted', 'expired')),
  reward_granted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  reward_id uuid references rewards(id) on delete set null,
  points integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'granted', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  trigger_key text not null check (trigger_key in ('registration', 'event_purchase', 'hotel_booking', 'event_attended', 'membership_upgrade', 'birthday', 'inactivity', 'referral_success')),
  action_key text not null check (action_key in ('welcome_email', 'hotel_recommendation', 'package_recommendation', 'next_event_recommendation', 'benefits_mail', 'birthday_benefit', 'reactivation', 'bonus_points')),
  provider text,
  enabled boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists revenue_transactions (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('tickets', 'hotels', 'packages', 'memberships', 'partner_offers', 'sponsoring', 'referrals', 'vip_services', 'concierge')),
  source_id text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  city_id text,
  profile_id uuid references profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists commission_rules (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('hotel', 'package', 'referral', 'ambassador', 'partner_revenue_share')),
  percentage numeric(5,2),
  fixed_amount numeric(12,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists commission_payouts (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references commission_rules(id) on delete cascade,
  recipient_id text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'approved', 'scheduled', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sponsor_placements (
  id uuid primary key default gen_random_uuid(),
  sponsor_id text not null,
  placement_type text not null check (placement_type in ('event', 'city', 'package', 'membership', 'app', 'welcome_bag', 'vip_area')),
  city_id text,
  event_id text,
  start_date date not null,
  end_date date not null,
  value numeric(12,2) not null default 0,
  status text not null default 'proposal' check (status in ('proposal', 'active', 'sold', 'archived')),
  visibility text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists referral_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  reward_type text not null default 'points' check (reward_type in ('points', 'hotel_benefit', 'fast_lane', 'partner_offer', 'cash')),
  reward_value numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_slug_idx on events(slug);
create index if not exists events_city_start_idx on events(city, start_date);
create index if not exists hotels_slug_idx on hotels(slug);
create index if not exists packages_slug_idx on packages(slug);
create index if not exists partners_slug_idx on partners(slug);
create index if not exists gallery_items_slug_idx on gallery_items(slug);
create index if not exists profiles_auth_user_idx on profiles(auth_user_id);
create index if not exists customer_profiles_stage_idx on customer_profiles(lifecycle_stage, loyalty_level);
create index if not exists loyalty_transactions_profile_idx on loyalty_transactions(profile_id, created_at);
create index if not exists referrals_code_idx on referrals(code);
create index if not exists automation_rules_trigger_idx on automation_rules(trigger_key, status);
create index if not exists revenue_transactions_source_idx on revenue_transactions(source_type, source_id);
create index if not exists revenue_transactions_created_idx on revenue_transactions(created_at);
create index if not exists commission_payouts_status_idx on commission_payouts(status);
create index if not exists sponsor_placements_sponsor_idx on sponsor_placements(sponsor_id, status);
create index if not exists referral_campaigns_status_idx on referral_campaigns(status);

create table if not exists concierge_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  category text not null default 'general' check (category in ('travel', 'hotel', 'package', 'vip', 'event', 'membership', 'general')),
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'archived')),
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prompt_templates (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  consent_type text not null check (consent_type in ('marketing', 'newsletter', 'analytics', 'cookies')),
  granted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists city_operators (
  id uuid primary key default gen_random_uuid(),
  city_id text not null,
  profile_id uuid references profiles(id) on delete set null,
  role text not null check (role in ('city_operator', 'city_manager', 'city_ambassador_lead', 'community_lead', 'partner_manager')),
  status text not null default 'candidate' check (status in ('candidate', 'active', 'paused', 'archived')),
  started_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  owner_id text,
  status text not null default 'planned' check (status in ('planned', 'prepared', 'active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_id text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'completed')),
  due_date date,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Moderierbarer HOTMESS Mitglieder-Chat
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'direct' check (type in ('direct', 'concierge', 'partner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message text,
  last_message_at timestamptz,
  created_by uuid references profiles(id) on delete set null
);

create table if not exists chat_participants (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'ambassador', 'concierge', 'partner')),
  unread_count integer not null default 0,
  last_read_at timestamptz,
  pinned boolean not null default false,
  muted boolean not null default false,
  deleted_for_user boolean not null default false,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chat_id, user_id)
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete set null,
  content text,
  media_url text,
  media_type text not null default 'text' check (media_type in ('text', 'image', 'video', 'audio', 'file', 'system')),
  file_size integer,
  mime_type text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by_sender boolean not null default false,
  system_flag boolean not null default false
);

create table if not exists chat_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_user_id uuid references profiles(id) on delete set null,
  chat_id uuid not null references chats(id) on delete cascade,
  reason text not null check (reason in ('harassment', 'insult', 'spam', 'threat', 'fake_profile', 'inappropriate_content', 'other')),
  description text,
  status text not null default 'new' check (status in ('new', 'in_review', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  resolution_note text
);

create table if not exists chat_report_messages (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references chat_reports(id) on delete cascade,
  message_id uuid references chat_messages(id) on delete set null,
  message_snapshot text,
  media_snapshot_url text,
  sender_id uuid references profiles(id) on delete set null,
  sent_at timestamptz
);

create table if not exists chat_admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  report_id uuid references chat_reports(id) on delete set null,
  chat_id uuid references chats(id) on delete set null,
  target_user_id uuid references profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists chat_participants_user_idx on chat_participants(user_id, pinned, muted, deleted_for_user);
create index if not exists chat_messages_chat_idx on chat_messages(chat_id, created_at);
create index if not exists chat_reports_status_idx on chat_reports(status, created_at);
create index if not exists chat_admin_audit_report_idx on chat_admin_audit_log(report_id, created_at);
