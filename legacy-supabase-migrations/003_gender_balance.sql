-- Gender-balance engine configuration and counters
create table if not exists public.event_gender_balance_configs (
  event_id uuid primary key references public.events(id) on delete cascade,
  enabled boolean not null default true,
  female_quota_percent integer not null default 45 check (female_quota_percent between 0 and 100),
  male_quota_percent integer not null default 45 check (male_quota_percent between 0 and 100),
  diverse_quota_percent integer not null default 10 check (diverse_quota_percent between 0 and 100),
  waitlist_when_full boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.event_gender_counters (
  event_id uuid not null references public.events(id) on delete cascade,
  gender text not null check (gender in ('female', 'male', 'diverse', 'not_specified')),
  reserved_count integer not null default 0,
  paid_count integer not null default 0,
  waitlist_count integer not null default 0,
  primary key (event_id, gender)
);
