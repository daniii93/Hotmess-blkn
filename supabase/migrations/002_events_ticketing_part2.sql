-- HotMess Teil 2: Events & Ticketing.
-- This migration extends the base rebuild schema without replacing existing tables.

alter type public.ticket_status add value if not exists 'paid';
alter type public.order_status add value if not exists 'partially_paid';
alter type public.order_status add value if not exists 'refunded';

alter table public.venues
  add column if not exists capacity integer,
  add column if not exists maps_url text;

alter table public.events
  add column if not exists subtitle text,
  add column if not exists description_secondary text,
  add column if not exists date_start timestamptz,
  add column if not exists date_end timestamptz,
  add column if not exists doors_open timestamptz,
  add column if not exists cover_image_url text,
  add column if not exists gallery_urls text[] default '{}',
  add column if not exists lineup jsonb default '[]'::jsonb,
  add column if not exists hotel_partner_id uuid references public.hotel_partners(id) on delete set null,
  add column if not exists status text not null default 'draft'
    check (status in ('draft','published','sold_out','cancelled','completed')),
  add column if not exists capacity_total integer not null default 0,
  add column if not exists min_age integer not null default 18,
  add column if not exists published_at timestamptz;

update public.events
set
  date_start = coalesce(date_start, starts_at),
  date_end = coalesce(date_end, ends_at),
  cover_image_url = coalesce(cover_image_url, hero_image_url),
  status = case
    when published = true and status = 'draft' then 'published'
    else status
  end,
  published_at = case
    when published = true and published_at is null then created_at
    else published_at
  end
where date_start is null
   or date_end is null
   or cover_image_url is null
   or published_at is null;

create index if not exists idx_events_status_date on public.events(status, date_start);

alter table public.event_gender_config
  add column if not exists ratio_female numeric(3,2) not null default 0.50,
  add column if not exists ratio_male numeric(3,2) not null default 0.50,
  add column if not exists capacity_female integer,
  add column if not exists capacity_male integer,
  add column if not exists capacity_diverse integer,
  add column if not exists tolerance integer not null default 0;

update public.event_gender_config
set
  capacity_female = coalesce(capacity_female, female_capacity, 0),
  capacity_male = coalesce(capacity_male, male_capacity, 0),
  capacity_diverse = coalesce(capacity_diverse, diverse_capacity, 0);

alter table public.event_gender_config
  alter column capacity_female set not null,
  alter column capacity_male set not null,
  alter column capacity_diverse set not null;

alter table public.ticket_types
  add column if not exists description text,
  add column if not exists quantity_total integer,
  add column if not exists quantity_sold integer not null default 0,
  add column if not exists sale_start timestamptz,
  add column if not exists sale_end timestamptz,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true;

alter table public.tickets
  add column if not exists holder_name text,
  add column if not exists holder_gender text,
  add column if not exists holder_photo_url text,
  add column if not exists has_fastlane boolean not null default false,
  add column if not exists scan_gate text,
  add column if not exists purchased_at timestamptz;

create unique index if not exists idx_tickets_qr on public.tickets(qr_token);
create index if not exists idx_tickets_event_status on public.tickets(event_id, status);
create index if not exists idx_tickets_user_created on public.tickets(user_id, created_at desc);

alter table public.waitlist
  add column if not exists ticket_type_id uuid references public.ticket_types(id) on delete set null,
  add column if not exists promoted_at timestamptz;

create index if not exists idx_waitlist_queue
  on public.waitlist(event_id, gender, position)
  where status = 'waiting';

alter table public.orders
  add column if not exists subtotal_cents integer not null default 0,
  add column if not exists discount_cents integer not null default 0,
  add column if not exists discount_code text,
  add column if not exists total_cents integer not null default 0,
  add column if not exists payment_method text check (payment_method in ('stripe','paypal')),
  add column if not exists payment_id text,
  add column if not exists is_group_order boolean not null default false,
  add column if not exists payment_split boolean not null default false,
  add column if not exists paid_at timestamptz;

alter table public.order_split_payments
  add column if not exists covers_user_ids uuid[] not null default '{}',
  add column if not exists assigned_by uuid references public.profiles(id) on delete set null,
  add column if not exists payment_method text,
  add column if not exists payment_id text,
  add column if not exists payment_link text,
  add column if not exists paid_at timestamptz;

alter table public.discount_codes
  add column if not exists discount_type text check (discount_type in ('percent','fixed','free')),
  add column if not exists discount_value numeric(10,2),
  add column if not exists max_tickets integer not null default 1,
  add column if not exists assigned_to_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists assigned_to_email text,
  add column if not exists used_by_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists used_at timestamptz,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

alter table public.event_tables
  add column if not exists table_type text check (table_type in ('2er','4er','6er','8er')),
  add column if not exists label text,
  add column if not exists min_spend_cents integer not null default 0,
  add column if not exists quantity_total integer not null default 0,
  add column if not exists quantity_sold integer not null default 0,
  add column if not exists is_vip boolean not null default false;

alter table public.table_bookings
  add column if not exists event_id uuid references public.events(id) on delete cascade,
  add column if not exists table_id uuid references public.event_tables(id) on delete set null,
  add column if not exists persons_count integer not null default 1,
  add column if not exists includes_fruit_plate boolean not null default false,
  add column if not exists status text not null default 'confirmed'
    check (status in ('confirmed','cancelled','completed'));

alter table public.drink_packages
  add column if not exists description text,
  add column if not exists includes_fruit_plate boolean not null default false,
  add column if not exists allows_girls_service boolean not null default false,
  add column if not exists quantity_available integer,
  add column if not exists quantity_sold integer not null default 0,
  add column if not exists booking_deadline timestamptz;

alter table public.drink_package_bookings
  add column if not exists package_id uuid references public.drink_packages(id) on delete cascade,
  add column if not exists event_id uuid references public.events(id) on delete cascade,
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists service_type text not null default 'discreet'
    check (service_type in ('discreet','hotmess_girls')),
  add column if not exists preferred_time time,
  add column if not exists status text not null default 'confirmed'
    check (status in ('confirmed','delivered','cancelled'));

alter table public.birthday_packages
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists table_booking_id uuid references public.table_bookings(id) on delete set null,
  add column if not exists booked_by uuid references public.profiles(id) on delete cascade,
  add column if not exists birthday_person_id uuid references public.profiles(id) on delete set null,
  add column if not exists is_surprise boolean not null default false,
  add column if not exists announcement_time time,
  add column if not exists internal_notes text,
  add column if not exists status text not null default 'confirmed'
    check (status in ('confirmed','completed','cancelled'));

alter table public.event_attendees
  add column if not exists status text not null default 'going'
    check (status in ('going','interested'));

alter table public.scanner_access rename column scanner_id to scanner_user_id;
alter table public.scanner_access
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists gate text not null default 'Haupteingang',
  add column if not exists valid_until timestamptz not null default (now() + interval '1 day'),
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

drop policy if exists "scanner access own or admin" on public.scanner_access;
create policy "scanner access own or admin" on public.scanner_access
for select using (scanner_user_id = auth.uid() or public.is_admin());

create policy "admin writes scanner access" on public.scanner_access
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published events readable by logged in users" on public.events;
create policy "read published events" on public.events
for select using (
  status in ('published','sold_out','completed')
  or (published = true and auth.uid() is not null)
  or public.is_admin()
);

drop policy if exists "own tickets only" on public.tickets;
create policy "read own tickets" on public.tickets
for select using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.scanner_access s
    where s.scanner_user_id = auth.uid()
      and s.event_id = tickets.event_id
      and s.valid_until > now()
  )
);

create policy "read own waitlist" on public.waitlist
for select using (user_id = auth.uid() or public.is_admin());

create policy "read attendees" on public.event_attendees
for select using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.follows
    where follower_id = auth.uid()
      and following_id = event_attendees.user_id
  )
  or (select is_private from public.profiles where id = event_attendees.user_id) = false
);

create or replace function public.reserve_ticket_transaction(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_user_id uuid,
  p_gender public.gender_type,
  p_holder_name text,
  p_holder_photo_url text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_config public.event_gender_config%rowtype;
  v_ticket_id uuid;
  v_position integer;
  v_top text;
  v_sold integer;
  v_capacity integer;
begin
  select * into v_config
  from public.event_gender_config
  where event_id = p_event_id
  for update;

  if not found then
    raise exception 'Gender-Konfiguration fehlt.';
  end if;

  if p_gender = 'female' then
    v_top := 'female';
    v_sold := v_config.sold_female;
    v_capacity := v_config.capacity_female;
  elsif p_gender = 'male' then
    v_top := 'male';
    v_sold := v_config.sold_male;
    v_capacity := v_config.capacity_male;
  elsif v_config.capacity_diverse > 0 then
    v_top := 'diverse';
    v_sold := v_config.sold_diverse;
    v_capacity := v_config.capacity_diverse;
  elsif (v_config.sold_female::numeric / greatest(v_config.capacity_female, 1)) <=
        (v_config.sold_male::numeric / greatest(v_config.capacity_male, 1)) then
    v_top := 'female';
    v_sold := v_config.sold_female;
    v_capacity := v_config.capacity_female;
  else
    v_top := 'male';
    v_sold := v_config.sold_male;
    v_capacity := v_config.capacity_male;
  end if;

  if v_sold < (v_capacity + v_config.tolerance) then
    insert into public.tickets (
      event_id,
      ticket_type_id,
      user_id,
      gender,
      holder_name,
      holder_gender,
      holder_photo_url,
      status,
      reserved_until
    )
    values (
      p_event_id,
      p_ticket_type_id,
      p_user_id,
      p_gender,
      p_holder_name,
      p_gender::text,
      coalesce(p_holder_photo_url, ''),
      'reserved',
      now() + interval '20 minutes'
    )
    returning id into v_ticket_id;

    update public.event_gender_config
    set
      sold_female = sold_female + case when v_top = 'female' then 1 else 0 end,
      sold_male = sold_male + case when v_top = 'male' then 1 else 0 end,
      sold_diverse = sold_diverse + case when v_top = 'diverse' then 1 else 0 end,
      updated_at = now()
    where event_id = p_event_id;

    return jsonb_build_object(
      'reserved', true,
      'ticket_id', v_ticket_id,
      'reserved_until', now() + interval '20 minutes',
      'gender_bucket', v_top
    );
  end if;

  select coalesce(max(position), 0) + 1 into v_position
  from public.waitlist
  where event_id = p_event_id and gender = p_gender and status = 'waiting';

  insert into public.waitlist (event_id, user_id, gender, ticket_type_id, position, status)
  values (p_event_id, p_user_id, p_gender, p_ticket_type_id, v_position, 'waiting')
  on conflict (event_id, user_id) do update
    set ticket_type_id = excluded.ticket_type_id,
        status = 'waiting';

  return jsonb_build_object(
    'waitlisted', true,
    'position', v_position,
    'gender_bucket', v_top
  );
end;
$$;

create or replace function public.expire_ticket_reservations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expired_count integer := 0;
begin
  with expired as (
    update public.tickets
    set status = 'expired',
        updated_at = now()
    where status = 'reserved'
      and reserved_until < now()
    returning event_id, gender
  )
  update public.event_gender_config cfg
  set
    sold_female = greatest(0, sold_female - counts.female_count),
    sold_male = greatest(0, sold_male - counts.male_count),
    sold_diverse = greatest(0, sold_diverse - counts.diverse_count),
    updated_at = now()
  from (
    select
      event_id,
      count(*) filter (where gender = 'female')::integer as female_count,
      count(*) filter (where gender = 'male')::integer as male_count,
      count(*) filter (where gender = 'diverse')::integer as diverse_count,
      count(*)::integer as total_count
    from expired
    group by event_id
  ) counts
  where cfg.event_id = counts.event_id;

  get diagnostics v_expired_count = row_count;

  update public.waitlist
  set status = 'expired'
  where status = 'promoted'
    and promoted_until < now();

  return jsonb_build_object('expired_batches', v_expired_count);
end;
$$;

create or replace function public.mark_order_paid_and_activate_tickets(
  p_order_id uuid,
  p_payment_id text,
  p_provider text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_user_id uuid;
begin
  update public.orders
  set status = 'paid',
      paid_at = now(),
      payment_id = p_payment_id,
      payment_method = p_provider,
      provider = p_provider,
      updated_at = now()
  where id = p_order_id
  returning event_id, user_id into v_event_id, v_user_id;

  update public.tickets
  set status = 'valid',
      purchased_at = now(),
      qr_token = coalesce(qr_token, encode(gen_random_bytes(32), 'hex')),
      updated_at = now()
  where order_id = p_order_id
    and status in ('reserved','paid');

  insert into public.event_attendees (event_id, user_id, status)
  select distinct event_id, user_id, 'going'
  from public.tickets
  where order_id = p_order_id
  on conflict (event_id, user_id) do update set status = 'going';

  insert into public.friend_activity (user_id, type, event_id, metadata)
  values (v_user_id, 'ticket_purchase', v_event_id, jsonb_build_object('order_id', p_order_id))
  on conflict do nothing;

  return jsonb_build_object('order_id', p_order_id, 'status', 'paid');
end;
$$;
