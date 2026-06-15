-- Section 6 core: event capacity, attendee links, revenue and atomic ticketing helpers
alter table public.events
  add column if not exists capacity_total integer not null default 0 check (capacity_total >= 0);

alter table public.ticket_types
  add column if not exists kind text not null default 'standard' check (kind in ('standard', 'vip'));

alter table public.waitlist_entries
  add column if not exists position integer,
  add column if not exists priority_score bigint;

alter table public.tickets
  drop constraint if exists tickets_status_check;

alter table public.tickets
  add constraint tickets_status_check check (status in ('valid', 'used', 'cancelled', 'expired'));

alter table public.tickets
  add column if not exists holder_name text,
  add column if not exists holder_gender text check (holder_gender in ('female', 'male', 'diverse'));

create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  gender text not null check (gender in ('female', 'male', 'diverse')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id, ticket_id)
);

create table if not exists public.revenue_transactions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  source_type text not null check (source_type in ('ticket', 'vip', 'hotel', 'table', 'addon', 'total')),
  source_id uuid,
  amount_cents integer not null default 0,
  currency text not null default 'EUR',
  user_id uuid references public.users(id) on delete set null,
  payment_status text not null default 'paid' check (payment_status in ('paid', 'pending', 'failed', 'refunded', 'cancelled')),
  created_at timestamptz not null default now()
);

create or replace view public.event_kpi_summary as
select
  e.id as event_id,
  e.title,
  e.city,
  e.status,
  count(t.id) filter (where t.status in ('valid', 'used')) as tickets_sold,
  count(t.id) filter (where t.status = 'used') as tickets_used,
  greatest(
    count(t.id) filter (where t.status in ('valid', 'used'))
      - count(t.id) filter (where t.status = 'used'),
    0
  ) as no_shows,
  count(w.id) filter (where w.status in ('waiting', 'promoted')) as waitlist_size,
  coalesce(sum(rt.amount_cents) filter (where rt.payment_status = 'paid'), 0) as revenue_cents
from public.events e
left join public.tickets t on t.event_id = e.id
left join public.waitlist_entries w on w.event_id = e.id
left join public.revenue_transactions rt on rt.event_id = e.id
group by e.id, e.title, e.city, e.status;

create or replace function public.reserve_event_ticket(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_user_id uuid,
  p_quantity integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_ticket_type public.ticket_types%rowtype;
  v_user public.users%rowtype;
  v_gender text;
  v_capacity_total integer;
  v_gender_capacity integer;
  v_gender_paid integer;
  v_gender_reserved integer;
  v_ticket_remaining integer;
  v_waitlist_position integer;
  v_reservation_id uuid;
begin
  if p_quantity <> 1 then
    raise exception 'Only one ticket reservation per transaction is supported in the MVP';
  end if;

  select * into v_event
  from public.events
  where id = p_event_id
  for update;

  if not found or v_event.status <> 'published' then
    raise exception 'Event is not available';
  end if;

  select * into v_ticket_type
  from public.ticket_types
  where id = p_ticket_type_id
    and event_id = p_event_id
  for update;

  if not found or v_ticket_type.status <> 'active' then
    raise exception 'Ticket type is not available';
  end if;

  select * into v_user
  from public.users
  where id = p_user_id
  for update;

  if not found or v_user.verification_status <> 'verified' then
    raise exception 'User must be verified';
  end if;

  v_gender := v_user.gender;
  if v_gender not in ('female', 'male', 'diverse') then
    raise exception 'User gender is required';
  end if;

  insert into public.event_gender_counters (event_id, gender, reserved_count, paid_count, waitlist_count)
  values (p_event_id, v_gender, 0, 0, 0)
  on conflict (event_id, gender) do nothing;

  perform 1
  from public.event_gender_counters
  where event_id = p_event_id and gender = v_gender
  for update;

  select greatest(v_ticket_type.capacity - v_ticket_type.sold_count - v_ticket_type.reserved_count, 0)
  into v_ticket_remaining;

  select
    case v_gender
      when 'female' then floor(v_event.capacity_total * female_quota_percent / 100.0)::integer
      when 'male' then floor(v_event.capacity_total * male_quota_percent / 100.0)::integer
      else greatest(
        v_event.capacity_total
          - floor(v_event.capacity_total * female_quota_percent / 100.0)::integer
          - floor(v_event.capacity_total * male_quota_percent / 100.0)::integer,
        0
      )
    end
  into v_gender_capacity
  from public.event_gender_balance_configs
  where event_id = p_event_id
  for update;

  if v_gender_capacity is null then
    raise exception 'Gender balance config is required';
  end if;

  select reserved_count, paid_count
  into v_gender_reserved, v_gender_paid
  from public.event_gender_counters
  where event_id = p_event_id and gender = v_gender;

  if v_ticket_remaining <= 0 or (v_gender_reserved + v_gender_paid) >= v_gender_capacity then
    select coalesce(max(position), 0) + 1
    into v_waitlist_position
    from public.waitlist_entries
    where event_id = p_event_id and gender = v_gender;

    insert into public.waitlist_entries (
      event_id,
      ticket_type_id,
      user_id,
      gender,
      position,
      priority_score,
      status
    )
    values (
      p_event_id,
      p_ticket_type_id,
      p_user_id,
      v_gender,
      v_waitlist_position,
      extract(epoch from now())::bigint,
      'waiting'
    )
    on conflict (event_id, user_id) do update
      set ticket_type_id = excluded.ticket_type_id,
          gender = excluded.gender,
          status = 'waiting';

    update public.event_gender_counters
    set waitlist_count = waitlist_count + 1
    where event_id = p_event_id and gender = v_gender;

    return jsonb_build_object('status', 'waitlisted', 'position', v_waitlist_position, 'gender', v_gender);
  end if;

  insert into public.ticket_reservations (
    event_id,
    ticket_type_id,
    user_id,
    quantity,
    status,
    expires_at
  )
  values (
    p_event_id,
    p_ticket_type_id,
    p_user_id,
    1,
    'reserved',
    now() + interval '15 minutes'
  )
  returning id into v_reservation_id;

  update public.ticket_types
  set reserved_count = reserved_count + 1
  where id = p_ticket_type_id;

  update public.event_gender_counters
  set reserved_count = reserved_count + 1
  where event_id = p_event_id and gender = v_gender;

  return jsonb_build_object(
    'status', 'reserved',
    'reservationId', v_reservation_id,
    'expiresAt', now() + interval '15 minutes',
    'gender', v_gender
  );
end;
$$;

create or replace function public.expire_ticket_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_row record;
  v_gender text;
begin
  for v_row in
    select tr.*
    from public.ticket_reservations tr
    where tr.status = 'reserved'
      and tr.expires_at <= now()
    for update
  loop
    select gender into v_gender from public.users where id = v_row.user_id;

    update public.ticket_reservations set status = 'expired' where id = v_row.id;
    update public.ticket_types set reserved_count = greatest(reserved_count - v_row.quantity, 0) where id = v_row.ticket_type_id;
    update public.event_gender_counters
      set reserved_count = greatest(reserved_count - v_row.quantity, 0)
      where event_id = v_row.event_id and gender = v_gender;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.promote_waitlist_for_event(
  p_event_id uuid,
  p_gender text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry public.waitlist_entries%rowtype;
begin
  select * into v_entry
  from public.waitlist_entries
  where event_id = p_event_id
    and gender = p_gender
    and status = 'waiting'
  order by position asc nulls last, created_at asc
  limit 1
  for update skip locked;

  if not found then
    return jsonb_build_object('status', 'empty');
  end if;

  update public.waitlist_entries
  set status = 'promoted',
      promoted_at = now(),
      promotion_expires_at = now() + interval '15 minutes'
  where id = v_entry.id;

  return jsonb_build_object(
    'status', 'promoted',
    'entryId', v_entry.id,
    'userId', v_entry.user_id,
    'promotionExpiresAt', now() + interval '15 minutes'
  );
end;
$$;

create or replace function public.complete_finished_events()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.events
  set status = 'completed'
  where status = 'published'
    and coalesce(end_at, start_at) <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

alter table public.event_attendees enable row level security;
alter table public.revenue_transactions enable row level security;

create policy "Users can read own attendee records"
on public.event_attendees for select
using (auth.uid() = user_id or public.is_admin());

create policy "Admins can read revenue transactions"
on public.revenue_transactions for select
using (public.is_admin());

create index if not exists idx_event_attendees_event on public.event_attendees(event_id, user_id);
create index if not exists idx_revenue_transactions_event_source on public.revenue_transactions(event_id, source_type, payment_status, created_at);
