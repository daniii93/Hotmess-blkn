-- HotMess Teil 2 finalization: payments, add-on bookings, cancellation and waitlist helpers.

create table if not exists public.birthday_package_bookings (
  id uuid primary key default gen_random_uuid(),
  birthday_package_id uuid references public.birthday_packages(id) on delete set null,
  event_id uuid references public.events(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  table_booking_id uuid references public.table_bookings(id) on delete set null,
  booked_by uuid references public.profiles(id) on delete cascade,
  birthday_person_id uuid references public.profiles(id) on delete set null,
  is_surprise boolean not null default false,
  announcement_time time,
  internal_notes text,
  status text not null default 'confirmed' check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  provider text not null check (provider in ('stripe','paypal','manual')),
  provider_refund_id text,
  amount_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending','succeeded','failed','manual_required')),
  reason text,
  error_message text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists cancelled_at timestamptz,
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_status text,
  add column if not exists provider_order_id text;

alter table public.waitlist
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_orders_provider_session on public.orders(provider, provider_session_id);
create index if not exists idx_orders_payment_id on public.orders(payment_id);
create index if not exists idx_birthday_bookings_order on public.birthday_package_bookings(order_id);

drop policy if exists "admin reads refunds" on public.order_refunds;
create policy "admin reads refunds" on public.order_refunds
for select using (public.is_admin());

drop policy if exists "own birthday bookings" on public.birthday_package_bookings;
create policy "own birthday bookings" on public.birthday_package_bookings
for select using (booked_by = auth.uid() or public.is_admin());

create or replace function public.expire_ticket_reservations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expired_tickets integer := 0;
  v_expired_promotions integer := 0;
begin
  with expired as (
    update public.tickets
    set status = 'expired',
        updated_at = now()
    where status = 'reserved'
      and reserved_until < now()
    returning event_id, gender
  ),
  counts as (
    select
      event_id,
      count(*) filter (where gender = 'female')::integer as female_count,
      count(*) filter (where gender = 'male')::integer as male_count,
      count(*) filter (where gender = 'diverse')::integer as diverse_count,
      count(*)::integer as total_count
    from expired
    group by event_id
  )
  update public.event_gender_config cfg
  set
    sold_female = greatest(0, sold_female - counts.female_count),
    sold_male = greatest(0, sold_male - counts.male_count),
    sold_diverse = greatest(0, sold_diverse - counts.diverse_count),
    updated_at = now()
  from counts
  where cfg.event_id = counts.event_id;

  select count(*) into v_expired_tickets
  from public.tickets
  where status = 'expired'
    and updated_at > now() - interval '2 minutes';

  update public.waitlist
  set status = 'expired',
      updated_at = now()
  where status = 'promoted'
    and promoted_until < now();

  get diagnostics v_expired_promotions = row_count;

  return jsonb_build_object(
    'expired_tickets', v_expired_tickets,
    'expired_promotions', v_expired_promotions
  );
end;
$$;

create or replace function public.promote_waitlist_for_event(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cfg public.event_gender_config%rowtype;
  v_promoted integer := 0;
  v_gender public.gender_type;
  v_free integer;
  v_waitlist_id uuid;
begin
  select * into v_cfg
  from public.event_gender_config
  where event_id = p_event_id
  for update;

  if not found then
    return jsonb_build_object('event_id', p_event_id, 'promoted', 0, 'reason', 'missing_config');
  end if;

  foreach v_gender in array array['female'::public.gender_type, 'male'::public.gender_type, 'diverse'::public.gender_type]
  loop
    if v_gender = 'female' then
      v_free := greatest(0, (v_cfg.capacity_female + v_cfg.tolerance) - v_cfg.sold_female);
    elsif v_gender = 'male' then
      v_free := greatest(0, (v_cfg.capacity_male + v_cfg.tolerance) - v_cfg.sold_male);
    else
      v_free := greatest(0, (v_cfg.capacity_diverse + v_cfg.tolerance) - v_cfg.sold_diverse);
    end if;

    while v_free > 0 loop
      select id into v_waitlist_id
      from public.waitlist
      where event_id = p_event_id
        and gender = v_gender
        and status = 'waiting'
      order by position asc, created_at asc
      limit 1
      for update skip locked;

      exit when v_waitlist_id is null;

      update public.waitlist
      set status = 'promoted',
          promoted_at = now(),
          promoted_until = now() + interval '20 minutes',
          updated_at = now()
      where id = v_waitlist_id;

      v_promoted := v_promoted + 1;
      v_free := v_free - 1;
      v_waitlist_id := null;
    end loop;
  end loop;

  return jsonb_build_object('event_id', p_event_id, 'promoted', v_promoted);
end;
$$;
