-- Venues, events and event media
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  city text not null,
  country text not null default 'AT',
  address text,
  latitude numeric,
  longitude numeric,
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete set null,
  title text not null,
  slug text unique not null,
  city text not null,
  category text not null default 'signature',
  short_description text not null,
  long_description text,
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb,
  start_at timestamptz not null,
  end_at timestamptz,
  doors_open_at timestamptz,
  dress_code text,
  lineup jsonb not null default '[]'::jsonb,
  hosts jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  safety_notes jsonb not null default '[]'::jsonb,
  app_enabled boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published', 'sold_out', 'cancelled', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
