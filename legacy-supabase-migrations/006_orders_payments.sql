-- Orders, payments and split payments
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  total_cents integer not null default 0,
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'paid', 'partially_refunded', 'cancelled', 'expired')),
  payment_provider text not null default 'stripe',
  payment_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null check (item_type in ('ticket', 'addon', 'hotel', 'package', 'membership')),
  item_id uuid,
  title text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null default 0,
  total_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.split_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
