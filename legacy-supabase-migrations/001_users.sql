-- HOTMESS Masterplan v5.0 - users, profiles and account safety
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique not null,
  first_name text not null,
  last_name text not null,
  password_hash text,
  avatar_url text,
  bio text,
  birthdate date,
  gender text check (gender in ('female', 'male', 'diverse', 'not_specified')),
  email_verified boolean not null default false,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  verified_at timestamptz,
  verification_provider text check (verification_provider in ('stripe_identity', 'manual_review')),
  role text not null default 'user' check (role in ('user', 'scanner', 'admin')),
  safety_status text not null default 'clear' check (safety_status in ('clear', 'warned', 'restricted', 'suspended', 'banned')),
  chat_status text not null default 'active' check (chat_status in ('active', 'read_only', 'blocked', 'suspended')),
  suspended_until timestamptz,
  warning_count integer not null default 0,
  last_warning_at timestamptz,
  banned_at timestamptz,
  ban_reason text,
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  city text,
  country text,
  interests jsonb not null default '[]'::jsonb,
  preferred_languages text[] not null default array['de'],
  onboarding_completed boolean not null default false,
  profile_completed_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  admin_id uuid references public.users(id) on delete set null,
  report_id uuid,
  action text not null,
  reason text,
  previous_status jsonb not null default '{}'::jsonb,
  new_status jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
