-- HotMess Teil 3b: hotel codes, add-on operations and event settlement runtime.

alter table public.hotel_partners
  add column if not exists stars integer,
  add column if not exists distance_label text,
  add column if not exists perks text[],
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists status text not null default 'active'
    check (status in ('active','paused','archived'));

alter table public.hotel_codes
  add column if not exists event_id uuid references public.events(id) on delete cascade,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists status text not null default 'issued'
    check (status in ('issued','viewed','redeemed','void')),
  add column if not exists redeemed_at timestamptz,
  add column if not exists commission_cents integer not null default 0,
  add column if not exists booking_reference text,
  add column if not exists notes text;

create index if not exists idx_hotel_codes_event on public.hotel_codes(event_id, status);
create index if not exists idx_hotel_codes_user on public.hotel_codes(user_id, created_at desc);

create table if not exists public.addon_operation_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  booking_type text not null check (booking_type in ('table','drink_package','birthday','hotel_code','fastlane','hotmess_time')),
  booking_id uuid,
  status text not null,
  note text,
  handled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_addon_ops_event on public.addon_operation_logs(event_id, booking_type, created_at desc);

create table if not exists public.hotmess_time_blocks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  label text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  gross_sales_cents integer not null default 0,
  hotmess_share_cents integer not null default 0,
  partner_share_cents integer not null default 0,
  status text not null default 'open' check (status in ('open','locked','paid')),
  created_at timestamptz not null default now()
);

create index if not exists idx_hotmess_time_event on public.hotmess_time_blocks(event_id, starts_at);

create table if not exists public.event_settlements (
  event_id uuid primary key references public.events(id) on delete cascade,
  ticket_revenue_cents integer not null default 0,
  addon_revenue_cents integer not null default 0,
  hotel_commission_cents integer not null default 0,
  hotmess_time_revenue_cents integer not null default 0,
  other_revenue_cents integer not null default 0,
  cost_cents integer not null default 0,
  net_profit_cents integer generated always as (
    ticket_revenue_cents + addon_revenue_cents + hotel_commission_cents + hotmess_time_revenue_cents + other_revenue_cents - cost_cents
  ) stored,
  status text not null default 'draft' check (status in ('draft','review','closed')),
  notes text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.addon_operation_logs enable row level security;
alter table public.hotmess_time_blocks enable row level security;
alter table public.event_settlements enable row level security;

drop policy if exists "admin addon ops" on public.addon_operation_logs;
create policy "admin addon ops" on public.addon_operation_logs
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin hotmess time" on public.hotmess_time_blocks;
create policy "admin hotmess time" on public.hotmess_time_blocks
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin settlements" on public.event_settlements;
create policy "admin settlements" on public.event_settlements
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "own hotel codes" on public.hotel_codes;
create policy "own hotel codes" on public.hotel_codes
for select using (user_id = auth.uid() or public.is_admin());

create or replace function public.mark_hotel_code_redeemed(
  p_code text,
  p_booking_reference text default null,
  p_commission_cents integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.hotel_codes%rowtype;
begin
  update public.hotel_codes
  set status = 'redeemed',
      redeemed_at = now(),
      booking_reference = coalesce(p_booking_reference, booking_reference),
      commission_cents = greatest(commission_cents, p_commission_cents)
  where code = p_code and status in ('issued','viewed')
  returning * into v_code;

  if not found then
    return jsonb_build_object('redeemed', false, 'reason', 'not_found_or_not_redeemable');
  end if;

  insert into public.addon_operation_logs(event_id, order_id, booking_type, booking_id, status, note)
  values (v_code.event_id, v_code.order_id, 'hotel_code', v_code.id, 'redeemed', p_booking_reference);

  return jsonb_build_object('redeemed', true, 'hotel_code_id', v_code.id, 'event_id', v_code.event_id);
end;
$$;

create or replace function public.recalculate_event_settlement(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket integer := 0;
  v_addon integer := 0;
  v_hotel integer := 0;
  v_time integer := 0;
  v_cost integer := 0;
begin
  select coalesce(sum(total_cents), 0)::integer into v_ticket
  from public.orders
  where event_id = p_event_id and status in ('paid','partially_paid');

  select coalesce(sum(commission_cents), 0)::integer into v_hotel
  from public.hotel_codes
  where event_id = p_event_id and status = 'redeemed';

  select coalesce(sum(hotmess_share_cents), 0)::integer into v_time
  from public.hotmess_time_blocks
  where event_id = p_event_id and status in ('locked','paid');

  -- Add-on revenue is stored inside orders.items in current runtime; keep this conservative
  -- until line-item accounting is split into a dedicated transaction ledger.
  v_addon := 0;

  select coalesce(cost_cents, 0) into v_cost
  from public.event_settlements
  where event_id = p_event_id;

  insert into public.event_settlements(event_id, ticket_revenue_cents, addon_revenue_cents, hotel_commission_cents, hotmess_time_revenue_cents, cost_cents, status)
  values (p_event_id, v_ticket, v_addon, v_hotel, v_time, v_cost, 'draft')
  on conflict (event_id) do update
    set ticket_revenue_cents = excluded.ticket_revenue_cents,
        addon_revenue_cents = excluded.addon_revenue_cents,
        hotel_commission_cents = excluded.hotel_commission_cents,
        hotmess_time_revenue_cents = excluded.hotmess_time_revenue_cents,
        updated_at = now();

  return jsonb_build_object('event_id', p_event_id, 'ticket_cents', v_ticket, 'hotel_cents', v_hotel, 'hotmess_time_cents', v_time);
end;
$$;
