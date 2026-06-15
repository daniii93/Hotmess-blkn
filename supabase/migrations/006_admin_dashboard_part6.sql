-- HotMess Teil 6: Admin dashboard, moderation, broadcasts, finance and platform control.
-- Admin-only tables and service-role helpers for sensitive actions.

create table if not exists public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  before_state jsonb,
  after_state jsonb,
  reason text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_admin on public.admin_audit(admin_id, created_at desc);
create index if not exists idx_audit_target on public.admin_audit(target_type, target_id);

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('post','comment','story','message','dating_profile','business_profile','job_listing','user')),
  content_id uuid not null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  source text,
  reason text not null,
  detail text,
  report_count integer not null default 1,
  status text not null default 'pending' check (status in ('pending','reviewing','actioned','dismissed')),
  action_taken text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_modqueue on public.moderation_queue(status, report_count desc, created_at);

create table if not exists public.user_sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('warning','temp_ban','perm_ban','shadowban','feature_block')),
  scope text,
  reason text not null,
  issued_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  channel text not null check (channel in ('push','email','both','in_app')),
  title text not null,
  body text not null,
  cta_url text,
  image_url text,
  segment jsonb not null default '{}'::jsonb,
  recipient_count integer,
  scheduled_for timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','sending','sent','cancelled')),
  sent_count integer not null default 0,
  open_count integer not null default 0,
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_metrics (
  date date primary key,
  new_users integer not null default 0,
  active_users integer not null default 0,
  verifications integer not null default 0,
  tickets_sold integer not null default 0,
  revenue_cents integer not null default 0,
  posts_created integer not null default 0,
  messages_sent integer not null default 0,
  dating_matches integer not null default 0,
  business_connections integer not null default 0,
  calculated_at timestamptz not null default now()
);

create table if not exists public.partner_settlements (
  id uuid primary key default gen_random_uuid(),
  partner_type text not null check (partner_type in ('hotel','club','sponsor')),
  partner_id uuid,
  event_id uuid references public.events(id) on delete set null,
  amount_cents integer not null default 0,
  status text not null default 'open' check (status in ('open','reported','invoiced','paid')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_audit enable row level security;
alter table public.moderation_queue enable row level security;
alter table public.user_sanctions enable row level security;
alter table public.broadcasts enable row level security;
alter table public.platform_settings enable row level security;
alter table public.daily_metrics enable row level security;
alter table public.partner_settlements enable row level security;

create policy "admin only audit" on public.admin_audit
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin only moderation queue" on public.moderation_queue
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin only sanctions" on public.user_sanctions
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin only broadcasts" on public.broadcasts
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin only platform settings" on public.platform_settings
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin only daily metrics" on public.daily_metrics
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin only partner settlements" on public.partner_settlements
for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.log_admin_action(
  p_admin_id uuid,
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_before_state jsonb,
  p_after_state jsonb,
  p_reason text,
  p_ip_hash text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.admin_audit (
    admin_id, action, target_type, target_id, before_state, after_state, reason, ip_hash
  )
  values (
    p_admin_id, p_action, p_target_type, p_target_id, p_before_state, p_after_state, p_reason, p_ip_hash
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.compute_daily_metrics_snapshot(p_date date default current_date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_metrics (
    date,
    new_users,
    active_users,
    verifications,
    tickets_sold,
    revenue_cents,
    posts_created,
    messages_sent,
    dating_matches,
    business_connections
  )
  values (
    p_date,
    (select count(*) from public.profiles where created_at::date = p_date),
    (select count(*) from public.profiles where last_active_at::date = p_date),
    (select count(*) from public.profiles where verification_status = 'verified' and updated_at::date = p_date),
    (select count(*) from public.tickets where created_at::date = p_date and status in ('paid','valid','used')),
    coalesce((select sum(coalesce(total_cents, amount_cents, 0)) from public.orders where created_at::date = p_date and status = 'paid'), 0),
    (select count(*) from public.posts where created_at::date = p_date),
    (select count(*) from public.messages where created_at::date = p_date),
    (select count(*) from public.dating_matches where coalesce(matched_at, created_at)::date = p_date),
    (select count(*) from public.business_matches where coalesce(matched_at, created_at)::date = p_date)
  )
  on conflict (date) do update
    set new_users = excluded.new_users,
        active_users = excluded.active_users,
        verifications = excluded.verifications,
        tickets_sold = excluded.tickets_sold,
        revenue_cents = excluded.revenue_cents,
        posts_created = excluded.posts_created,
        messages_sent = excluded.messages_sent,
        dating_matches = excluded.dating_matches,
        business_connections = excluded.business_connections,
        calculated_at = now();

  return jsonb_build_object('date', p_date, 'computed', true);
end;
$$;

insert into public.platform_settings (key, value)
values
  ('registration_open', 'true'::jsonb),
  ('dating_enabled_globally', 'true'::jsonb),
  ('business_enabled_globally', 'true'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('default_gender_ratio', '{"female":0.5,"male":0.5}'::jsonb),
  ('reservation_timeout_minutes', '20'::jsonb),
  ('minimum_age', '18'::jsonb)
on conflict (key) do nothing;
