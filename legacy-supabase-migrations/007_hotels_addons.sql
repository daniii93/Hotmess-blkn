-- Hotels, add-ons and concierge package inventory
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  city text not null,
  address text,
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  description text,
  partner_status text not null default 'standard' check (partner_status in ('standard', 'premium', 'signature')),
  booking_url text,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  addon_type text not null check (addon_type in ('drink_package', 'fruit_platter', 'fast_lane', 'table', 'birthday', 'hotel')),
  description text,
  price_cents integer not null default 0,
  currency text not null default 'EUR',
  inventory integer,
  status text not null default 'active' check (status in ('active', 'hidden', 'sold_out', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_addons (
  event_id uuid not null references public.events(id) on delete cascade,
  addon_id uuid not null references public.addons(id) on delete cascade,
  primary key (event_id, addon_id)
);
