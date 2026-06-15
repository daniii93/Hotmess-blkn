-- Section 7 core: checkout, bookings, split payments, discounts and revenue analytics
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (
    status in ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'expired')
  );

alter table public.orders
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded')),
  add column if not exists order_number text unique,
  add column if not exists invoice_number text unique,
  add column if not exists tax_cents integer not null default 0,
  add column if not exists discount_cents integer not null default 0;

alter table public.addons
  drop constraint if exists addons_addon_type_check;

alter table public.addons
  add constraint addons_addon_type_check check (
    addon_type in ('drink_package', 'fruit_platter', 'fast_lane', 'table', 'birthday', 'hotel', 'bottle_service')
  );

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percent', 'fixed', 'vip_unlock')),
  value integer not null default 0,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  max_uses integer,
  used_count integer not null default 0,
  active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_hotel_inventories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  room_type text not null check (room_type in ('single', 'double', 'twin', 'suite')),
  total_rooms integer not null default 0 check (total_rooms >= 0),
  reserved_rooms integer not null default 0 check (reserved_rooms >= 0),
  confirmed_rooms integer not null default 0 check (confirmed_rooms >= 0),
  price_cents integer not null default 0,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, hotel_id, room_type)
);

create table if not exists public.hotel_bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete restrict,
  inventory_id uuid not null references public.event_hotel_inventories(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete cascade,
  room_type text not null check (room_type in ('single', 'double', 'twin', 'suite')),
  options jsonb not null default '[]'::jsonb,
  status text not null default 'reserved' check (status in ('reserved', 'confirmed', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  table_type text not null check (table_type in ('standard', 'vip', 'premium')),
  table_number text not null,
  capacity integer not null check (capacity > 0),
  minimum_spend_cents integer not null default 0,
  price_cents integer not null default 0,
  status text not null default 'available' check (status in ('available', 'reserved', 'confirmed', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, table_number)
);

create table if not exists public.table_bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  table_id uuid not null references public.event_tables(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'reserved' check (status in ('reserved', 'confirmed', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addon_bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  addon_id uuid not null references public.addons(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  status text not null default 'reserved' check (status in ('reserved', 'confirmed', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider text not null check (provider in ('stripe', 'paypal')),
  provider_event_id text unique,
  event_type text not null,
  payment_status text not null check (payment_status in ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.create_platform_order(
  p_user_id uuid,
  p_event_id uuid,
  p_items jsonb,
  p_discount_code text default null,
  p_tax_country text default 'AT'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users%rowtype;
  v_order_id uuid;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_tax integer := 0;
  v_total integer := 0;
  v_order_number text;
  v_invoice_number text;
begin
  select * into v_user from public.users where id = p_user_id for update;
  if not found or v_user.verification_status <> 'verified' then
    raise exception 'Verified user is required';
  end if;

  if not exists (
    select 1 from public.ticket_reservations
    where user_id = p_user_id
      and event_id = p_event_id
      and status = 'reserved'
      and expires_at > now()
  ) then
    raise exception 'Active ticket reservation is required';
  end if;

  select coalesce(sum((item->>'quantity')::integer * (item->>'unitPriceCents')::integer), 0)
  into v_subtotal
  from jsonb_array_elements(p_items) item;

  if p_discount_code is not null then
    v_discount := public.preview_discount_cents(p_discount_code, v_subtotal);
  end if;

  v_total := greatest(v_subtotal - v_discount, 0);
  v_tax := case p_tax_country
    when 'DE' then round(v_total - (v_total / 1.19))::integer
    when 'CH' then round(v_total - (v_total / 1.081))::integer
    when 'IT' then round(v_total - (v_total / 1.22))::integer
    else round(v_total - (v_total / 1.20))::integer
  end;

  insert into public.orders (
    user_id,
    event_id,
    total_cents,
    currency,
    status,
    payment_status,
    tax_cents,
    discount_cents,
    metadata
  )
  values (
    p_user_id,
    p_event_id,
    v_total,
    'EUR',
    'pending',
    'pending',
    v_tax,
    v_discount,
    jsonb_build_object('items', p_items, 'taxCountry', p_tax_country, 'discountCode', p_discount_code)
  )
  returning id into v_order_id;

  v_order_number := 'HM-' || to_char(now(), 'YYYYMMDD') || '-' || upper(left(v_order_id::text, 8));
  v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(left(v_order_id::text, 8));

  update public.orders
  set order_number = v_order_number,
      invoice_number = v_invoice_number
  where id = v_order_id;

  insert into public.order_items (order_id, item_type, item_id, title, quantity, unit_price_cents, total_cents)
  select
    v_order_id,
    item->>'itemType',
    nullif(item->>'itemId', '')::uuid,
    item->>'title',
    (item->>'quantity')::integer,
    (item->>'unitPriceCents')::integer,
    (item->>'quantity')::integer * (item->>'unitPriceCents')::integer
  from jsonb_array_elements(p_items) item;

  return v_order_id;
end;
$$;

create or replace function public.preview_discount_cents(
  p_code text,
  p_subtotal_cents integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.discount_codes%rowtype;
begin
  select * into v_code
  from public.discount_codes
  where lower(code) = lower(p_code)
    and active = true
    and valid_from <= now()
    and valid_until >= now()
  for update;

  if not found then
    return 0;
  end if;

  if v_code.max_uses is not null and v_code.used_count >= v_code.max_uses then
    return 0;
  end if;

  if v_code.discount_type = 'fixed' then
    return least(p_subtotal_cents, v_code.value);
  end if;

  if v_code.discount_type = 'percent' then
    return round(p_subtotal_cents * (v_code.value / 100.0))::integer;
  end if;

  return 0;
end;
$$;

create or replace function public.confirm_order_payment(
  p_order_id uuid,
  p_provider text,
  p_provider_event_id text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_reservation public.ticket_reservations%rowtype;
  v_ticket_id uuid;
  v_user public.users%rowtype;
begin
  if exists (select 1 from public.payment_events where provider_event_id = p_provider_event_id) then
    return jsonb_build_object('status', 'duplicate');
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;

  insert into public.payment_events (order_id, provider, provider_event_id, event_type, payment_status, payload)
  values (p_order_id, p_provider, p_provider_event_id, 'payment_confirmed', 'paid', p_payload);

  update public.orders
  set status = 'paid',
      payment_status = 'paid',
      updated_at = now()
  where id = p_order_id;

  for v_reservation in
    select * from public.ticket_reservations
    where user_id = v_order.user_id
      and event_id = v_order.event_id
      and status = 'reserved'
    for update
  loop
    select * into v_user from public.users where id = v_order.user_id;

    insert into public.tickets (
      ticket_number,
      qr_payload,
      event_id,
      ticket_type_id,
      user_id,
      order_id,
      status,
      holder_name,
      holder_gender
    )
    values (
      'T-' || upper(left(gen_random_uuid()::text, 10)),
      'signed:' || gen_random_uuid()::text,
      v_reservation.event_id,
      v_reservation.ticket_type_id,
      v_order.user_id,
      p_order_id,
      'valid',
      trim(v_user.first_name || ' ' || v_user.last_name),
      v_user.gender
    )
    returning id into v_ticket_id;

    update public.ticket_reservations set status = 'converted' where id = v_reservation.id;
    update public.ticket_types
      set sold_count = sold_count + v_reservation.quantity,
          reserved_count = greatest(reserved_count - v_reservation.quantity, 0)
      where id = v_reservation.ticket_type_id;
    update public.event_gender_counters
      set paid_count = paid_count + v_reservation.quantity,
          reserved_count = greatest(reserved_count - v_reservation.quantity, 0)
      where event_id = v_reservation.event_id and gender = v_user.gender;

    insert into public.event_attendees (event_id, user_id, ticket_id, ticket_type_id, gender)
    values (v_reservation.event_id, v_order.user_id, v_ticket_id, v_reservation.ticket_type_id, v_user.gender)
    on conflict do nothing;
  end loop;

  update public.hotel_bookings set status = 'confirmed', updated_at = now() where order_id = p_order_id;
  update public.table_bookings set status = 'confirmed', updated_at = now() where order_id = p_order_id;
  update public.addon_bookings set status = 'confirmed', updated_at = now() where order_id = p_order_id;

  insert into public.revenue_transactions (event_id, source_type, source_id, amount_cents, currency, user_id, payment_status)
  values (v_order.event_id, 'ticket', p_order_id, v_order.total_cents, v_order.currency, v_order.user_id, 'paid');

  return jsonb_build_object('status', 'paid', 'orderId', p_order_id);
end;
$$;

create or replace function public.confirm_hotel_booking(p_hotel_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.hotel_bookings%rowtype;
begin
  select * into v_booking from public.hotel_bookings where id = p_hotel_booking_id for update;
  if not found then
    return false;
  end if;

  update public.hotel_bookings set status = 'confirmed', updated_at = now() where id = p_hotel_booking_id;
  update public.event_hotel_inventories
    set confirmed_rooms = confirmed_rooms + 1,
        reserved_rooms = greatest(reserved_rooms - 1, 0)
    where id = v_booking.inventory_id;

  return true;
end;
$$;

create or replace function public.confirm_table_booking(p_table_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.table_bookings%rowtype;
begin
  select * into v_booking from public.table_bookings where id = p_table_booking_id for update;
  if not found then
    return false;
  end if;

  update public.table_bookings set status = 'confirmed', updated_at = now() where id = p_table_booking_id;
  update public.event_tables set status = 'confirmed', updated_at = now() where id = v_booking.table_id;

  return true;
end;
$$;

create or replace view public.checkout_analytics_summary as
select
  count(o.id) filter (where o.payment_status = 'paid') as paid_orders,
  coalesce(avg(o.total_cents) filter (where o.payment_status = 'paid'), 0)::integer as average_cart_cents,
  count(ab.id) filter (where ab.status = 'confirmed') as confirmed_addons,
  count(hb.id) filter (where hb.status = 'confirmed') as confirmed_hotels,
  count(sp.id) filter (where sp.status = 'paid') as paid_split_payments,
  count(sp.id) as total_split_payments
from public.orders o
left join public.addon_bookings ab on ab.order_id = o.id
left join public.hotel_bookings hb on hb.order_id = o.id
left join public.split_payments sp on sp.order_id = o.id;

create or replace view public.event_sales_summary as
select
  e.id as event_id,
  e.title,
  e.city,
  count(t.id) filter (where t.status in ('valid', 'used')) as valid_tickets,
  count(t.id) filter (where t.status = 'used') as used_tickets
from public.events e
left join public.tickets t on t.event_id = e.id
group by e.id, e.title, e.city;

alter table public.discount_codes enable row level security;
alter table public.event_hotel_inventories enable row level security;
alter table public.hotel_bookings enable row level security;
alter table public.event_tables enable row level security;
alter table public.table_bookings enable row level security;
alter table public.addon_bookings enable row level security;
alter table public.payment_events enable row level security;

create policy "Admins manage discounts"
on public.discount_codes for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users read own hotel bookings"
on public.hotel_bookings for select
using (auth.uid() = user_id or public.is_admin());

create policy "Users read own table bookings"
on public.table_bookings for select
using (auth.uid() = user_id or public.is_admin());

create policy "Users read own addon bookings"
on public.addon_bookings for select
using (auth.uid() = user_id or public.is_admin());

create policy "Public reads active hotel inventory"
on public.event_hotel_inventories for select
using (true);

create policy "Public reads available event tables"
on public.event_tables for select
using (status in ('available', 'reserved', 'confirmed'));

create index if not exists idx_orders_event_payment on public.orders(event_id, payment_status, created_at);
create index if not exists idx_discount_codes_code on public.discount_codes(lower(code));
create index if not exists idx_hotel_inventory_event on public.event_hotel_inventories(event_id, hotel_id, room_type);
create index if not exists idx_payment_events_provider on public.payment_events(provider, provider_event_id);
