-- Waitlist for sold-out or gender-balanced events
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  gender text check (gender in ('female', 'male', 'diverse', 'not_specified')),
  priority integer not null default 100,
  status text not null default 'waiting' check (status in ('waiting', 'promoted', 'expired', 'cancelled')),
  promoted_at timestamptz,
  promotion_expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
