-- Section 9 core: admin operations, scanner, verification, exports and analytics
alter table public.scanner_event_assignments
  add column if not exists valid_until timestamptz,
  add column if not exists disabled_at timestamptz;

alter table public.tickets
  add column if not exists scanned_at timestamptz,
  add column if not exists scanned_by uuid references public.users(id) on delete set null,
  add column if not exists fast_lane boolean not null default false;

alter table public.discount_codes
  add column if not exists event_id uuid references public.events(id) on delete cascade,
  add column if not exists max_tickets integer,
  add column if not exists assigned_user_id uuid references public.users(id) on delete cascade,
  add column if not exists assigned_email text,
  add column if not exists expires_at timestamptz;

alter table public.revenue_transactions
  drop constraint if exists revenue_transactions_source_type_check;

alter table public.revenue_transactions
  add constraint revenue_transactions_source_type_check check (
    source_type in (
      'ticket',
      'vip',
      'hotel',
      'hotel_package',
      'table',
      'addon',
      'drink_package',
      'fast_lane',
      'birthday',
      'bottle_service',
      'total'
    )
  );

create table if not exists public.admin_audit_entries (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.users(id) on delete restrict,
  entity_type text not null,
  entity_id uuid,
  action text not null check (
    action in (
      'admin_login',
      'event_created',
      'event_published',
      'event_cancelled',
      'ticket_cancelled',
      'ticket_resent',
      'user_blocked',
      'user_role_changed',
      'verification_approved',
      'verification_rejected',
      'discount_code_created',
      'scanner_access_created',
      'broadcast_sent',
      'post_deleted',
      'message_deleted'
    )
  ),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scanner_logs (
  id uuid primary key default gen_random_uuid(),
  scanner_user_id uuid not null references public.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete set null,
  scan_result text not null check (scan_result in ('ok', 'already_used', 'invalid', 'wrong_event', 'cancelled', 'expired')),
  offline boolean not null default false,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.users(id) on delete restrict,
  channels jsonb not null default '[]'::jsonb,
  segment text not null check (
    segment in (
      'all_users',
      'event_attendees',
      'waitlist',
      'city',
      'country',
      'verified_users',
      'unverified_users',
      'vip_buyers',
      'hotel_bookers'
    )
  ),
  title text not null,
  body text not null,
  filters jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_export_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.users(id) on delete restrict,
  export_type text not null check (
    export_type in ('guest_list', 'hotel_bookings', 'table_list', 'fast_lane', 'birthday_packages', 'revenue', 'scanner_log')
  ),
  filters jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processing', 'ready', 'failed')),
  file_url text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.verification_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reviewed_by uuid references public.users(id) on delete set null,
  action text not null check (action in ('approve', 'reject', 'request_more_info')),
  provider text not null check (provider in ('stripe_identity', 'manual_review')),
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.log_admin_action(
  p_actor_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_old_data jsonb default null,
  p_new_data jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor public.users%rowtype;
  v_id uuid;
begin
  select * into v_actor from public.users where id = p_actor_id;
  if not found or v_actor.role <> 'admin' then
    raise exception 'Admin role required';
  end if;

  insert into public.admin_audit_entries (actor_id, entity_type, entity_id, action, old_data, new_data)
  values (p_actor_id, p_entity_type, p_entity_id, p_action, p_old_data, p_new_data)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.scan_ticket_for_event(
  p_scanner_user_id uuid,
  p_event_id uuid,
  p_qr_payload text,
  p_offline boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment public.scanner_event_assignments%rowtype;
  v_ticket public.tickets%rowtype;
  v_result text;
begin
  select * into v_assignment
  from public.scanner_event_assignments
  where scanner_user_id = p_scanner_user_id
    and event_id = p_event_id
    and active = true
    and (valid_until is null or valid_until > now());

  if not found then
    raise exception 'Scanner is not assigned to this event';
  end if;

  select * into v_ticket
  from public.tickets
  where qr_payload = p_qr_payload
  for update;

  if not found then
    v_result := 'invalid';
  elsif v_ticket.event_id <> p_event_id then
    v_result := 'wrong_event';
  elsif v_ticket.status = 'used' then
    v_result := 'already_used';
  elsif v_ticket.status = 'cancelled' then
    v_result := 'cancelled';
  elsif v_ticket.status = 'expired' then
    v_result := 'expired';
  else
    v_result := 'ok';
    update public.tickets
    set status = 'used',
        scanned_at = now(),
        scanned_by = p_scanner_user_id
    where id = v_ticket.id;
  end if;

  insert into public.scanner_logs (scanner_user_id, event_id, ticket_id, scan_result, offline, synced_at)
  values (p_scanner_user_id, p_event_id, v_ticket.id, v_result, p_offline, case when p_offline then null else now() end);

  return jsonb_build_object(
    'result', v_result,
    'ticketId', v_ticket.id,
    'eventId', p_event_id,
    'name', v_ticket.holder_name,
    'gender', v_ticket.holder_gender,
    'ticketStatus', case when v_result = 'ok' then 'used' else v_ticket.status end,
    'fastLane', coalesce(v_ticket.fast_lane, false)
  );
end;
$$;

create or replace view public.admin_dashboard_summary as
select
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where created_at >= date_trunc('day', now()) and payment_status = 'paid') as revenue_today_cents,
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where created_at >= now() - interval '7 days' and payment_status = 'paid') as revenue_week_cents,
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where created_at >= now() - interval '30 days' and payment_status = 'paid') as revenue_month_cents,
  (select count(*) from public.tickets where status in ('valid', 'used')) as tickets_sold,
  (select count(*) from public.events where status = 'published') as active_events,
  (select count(*) from public.events where status = 'sold_out') as sold_out_events,
  (select count(*) from public.waitlist_entries where status in ('waiting', 'promoted')) as waitlist_total,
  (select count(*) from public.users where verification_status = 'pending') as pending_verifications,
  (select count(*) from public.users where created_at >= now() - interval '7 days') as new_users,
  (select count(*) from public.scanner_logs where created_at >= now() - interval '1 day') as scanner_activity,
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where source_type in ('addon', 'drink_package', 'fast_lane', 'birthday', 'bottle_service') and payment_status = 'paid') as addon_revenue_cents,
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where source_type in ('hotel', 'hotel_package') and payment_status = 'paid') as hotel_revenue_cents;

create or replace view public.admin_analytics_summary as
select
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where payment_status = 'paid') as revenue_cents,
  (select count(*) from public.tickets where status in ('valid', 'used')) as ticket_sales,
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where source_type in ('addon', 'drink_package', 'fast_lane', 'birthday', 'bottle_service') and payment_status = 'paid') as addon_sales_cents,
  (select coalesce(sum(amount_cents), 0) from public.revenue_transactions where source_type in ('hotel', 'hotel_package') and payment_status = 'paid') as hotel_revenue_cents,
  (select count(*) from public.scanner_logs where scan_result = 'ok') as scanner_throughput,
  (select count(*) from public.tickets where status = 'valid') as no_show_candidates,
  (select count(*) from public.chat_messages where created_at >= now() - interval '30 days') as community_activity;

alter table public.admin_audit_entries enable row level security;
alter table public.scanner_logs enable row level security;
alter table public.broadcasts enable row level security;
alter table public.admin_export_jobs enable row level security;
alter table public.verification_reviews enable row level security;

create policy "Admins read admin audit entries"
on public.admin_audit_entries for select
using (public.is_admin());

create policy "Admins read scanner logs"
on public.scanner_logs for select
using (public.is_admin());

create policy "Admins manage broadcasts"
on public.broadcasts for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage export jobs"
on public.admin_export_jobs for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage verification reviews"
on public.verification_reviews for all
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_admin_audit_entries_actor_created on public.admin_audit_entries(actor_id, created_at desc);
create index if not exists idx_scanner_logs_event_created on public.scanner_logs(event_id, created_at desc);
create index if not exists idx_broadcasts_status_created on public.broadcasts(status, created_at desc);
create index if not exists idx_admin_export_jobs_status_created on public.admin_export_jobs(status, created_at desc);
