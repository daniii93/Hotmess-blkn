-- Launch operations: notification center, webhook safety and scheduled jobs
alter table public.notifications
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists is_read boolean not null default false,
  add column if not exists target_type text,
  add column if not exists target_id uuid,
  add column if not exists clicked_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.notifications
set is_read = read_at is not null
where is_read = false;

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe', 'paypal', 'stripe_identity')),
  event_id text not null,
  event_type text not null,
  idempotency_key text not null,
  signature_verified boolean not null default false,
  processed boolean not null default false,
  processed_at timestamptz,
  failed_at timestamptz,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, idempotency_key)
);

create table if not exists public.cron_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_key text not null check (
    job_key in (
      'expire_reservations',
      'promote_waitlist',
      'expire_split_payments',
      'send_event_reminders',
      'complete_events',
      'cleanup_verification_files'
    )
  ),
  status text not null default 'started' check (status in ('started', 'completed', 'failed', 'skipped')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.system_health_checks (
  id uuid primary key default gen_random_uuid(),
  check_name text not null check (
    check_name in (
      'vercel_logs',
      'supabase_logs',
      'stripe_webhook_logs',
      'paypal_webhook_logs',
      'edge_function_logs',
      'error_logging',
      'audit_logs'
    )
  ),
  status text not null check (status in ('ok', 'warning', 'critical')),
  message text,
  checked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_read
  on public.notifications (user_id, is_read, created_at desc);

create index if not exists idx_webhook_events_provider_event
  on public.webhook_events (provider, event_id);

create index if not exists idx_cron_job_runs_job_started
  on public.cron_job_runs (job_key, started_at desc);

create index if not exists idx_system_health_checks_name_checked
  on public.system_health_checks (check_name, checked_at desc);

alter table public.webhook_events enable row level security;
alter table public.cron_job_runs enable row level security;
alter table public.system_health_checks enable row level security;

create policy "Admins can read webhook events"
on public.webhook_events for select
using (public.is_admin());

create policy "Admins can read cron runs"
on public.cron_job_runs for select
using (public.is_admin());

create policy "Admins can read system health checks"
on public.system_health_checks for select
using (public.is_admin());
