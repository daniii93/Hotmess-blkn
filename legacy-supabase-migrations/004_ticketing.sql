-- Ticket types, reservations and issued tickets
create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',
  capacity integer not null check (capacity >= 0),
  sold_count integer not null default 0,
  reserved_count integer not null default 0,
  benefits jsonb not null default '[]'::jsonb,
  requires_membership boolean not null default false,
  status text not null default 'active' check (status in ('active', 'hidden', 'sold_out', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, slug)
);

create table if not exists public.ticket_reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  status text not null default 'reserved' check (status in ('reserved', 'expired', 'converted', 'cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  qr_payload text unique not null,
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete cascade,
  order_id uuid,
  status text not null default 'valid' check (status in ('valid', 'checked_in', 'cancelled', 'expired')),
  checked_in_at timestamptz,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
