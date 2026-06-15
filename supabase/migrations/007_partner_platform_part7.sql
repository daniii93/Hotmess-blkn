-- HotMess Teil 7: separate partner platform tables and narrow sales attribution bridge.
-- Legal guardrails: free participation, commission only on real ticket revenue, no recruiting fee.

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  linked_user_id uuid references public.profiles(id) on delete set null,
  email text unique not null,
  first_name text not null,
  last_name text not null,
  phone text,
  referral_code text unique not null,
  referral_slug text unique not null,
  tier integer not null default 1 check (tier between 1 and 6),
  tier_since date,
  sponsor_id uuid references public.partners(id) on delete set null,
  business_name text,
  tax_id text,
  has_business_license boolean not null default false,
  iban_encrypted text,
  status text not null default 'pending' check (status in ('pending','active','suspended','terminated')),
  agreed_terms_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_partners_sponsor on public.partners(sponsor_id);
create unique index if not exists idx_partners_code on public.partners(referral_code);

create table if not exists public.partner_tiers (
  tier integer primary key check (tier between 1 and 6),
  name text not null,
  own_commission_pct decimal(4,2) not null,
  required_own_sales integer not null,
  required_own_revenue_cents integer,
  team_override_pct decimal(4,2) not null default 0,
  description text
);

insert into public.partner_tiers (tier, name, own_commission_pct, required_own_sales, required_own_revenue_cents, team_override_pct, description)
values
  (1, 'Starter', 2.00, 0, 0, 0.00, 'Kostenloser Einstieg, Provision nur auf eigene Ticketverkaeufe.'),
  (2, 'Promoter', 4.00, 10, null, 0.00, 'Hoehere Eigenprovision ab 10 verkauften Tickets.'),
  (3, 'Influencer', 6.00, 30, null, 1.00, 'Konservativer Team-Override auf echte Team-Verkaeufe.'),
  (4, 'Manager', 8.00, 75, null, 2.00, 'Team-Override aus HotMess-Marge, nicht vom Kaeufer.'),
  (5, 'Director', 10.00, 150, null, 3.00, 'Erweiterte Stufe fuer starke Eigenverkaeufe.'),
  (6, 'Partner', 12.00, 300, null, 4.00, 'Hoechste Stufe, final rechtlich zu pruefen.')
on conflict (tier) do update
  set name = excluded.name,
      own_commission_pct = excluded.own_commission_pct,
      required_own_sales = excluded.required_own_sales,
      required_own_revenue_cents = excluded.required_own_revenue_cents,
      team_override_pct = excluded.team_override_pct,
      description = excluded.description;

create table if not exists public.partner_referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  ticket_id uuid references public.tickets(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  buyer_user_id uuid references public.profiles(id) on delete set null,
  attribution_method text check (attribution_method in ('code','link','qr','landing')),
  ticket_revenue_cents integer not null,
  commission_pct decimal(4,2) not null,
  commission_cents integer not null,
  commission_type text not null default 'own' check (commission_type in ('own','team_override')),
  source_partner_id uuid references public.partners(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','paid','reversed')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_referrals_partner on public.partner_referrals(partner_id, status);
create index if not exists idx_referrals_order on public.partner_referrals(order_id);

create table if not exists public.partner_balances (
  partner_id uuid primary key references public.partners(id) on delete cascade,
  pending_cents integer not null default 0,
  available_cents integer not null default 0,
  paid_total_cents integer not null default 0,
  reversed_total_cents integer not null default 0,
  total_tickets_sold integer not null default 0,
  own_tickets_sold integer not null default 0,
  team_tickets_sold integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  amount_cents integer not null,
  invoice_url text,
  status text not null default 'requested' check (status in ('requested','approved','processing','paid','rejected')),
  requested_at timestamptz not null default now(),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  payment_reference text,
  min_payout_cents integer not null default 5000,
  rejection_reason text
);

create table if not exists public.partner_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('image','video','story_template','caption','flyer_pdf','logo')),
  url text not null,
  event_id uuid references public.events(id) on delete set null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_link_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  attribution_method text,
  event_id uuid references public.events(id) on delete set null,
  ip_hash text,
  converted boolean not null default false,
  clicked_at timestamptz not null default now()
);

create table if not exists public.partner_notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.current_partner_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.partner_id', true), '')::uuid;
$$;

alter table public.partners enable row level security;
alter table public.partner_tiers enable row level security;
alter table public.partner_referrals enable row level security;
alter table public.partner_balances enable row level security;
alter table public.partner_payouts enable row level security;
alter table public.partner_materials enable row level security;
alter table public.partner_link_clicks enable row level security;
alter table public.partner_notifications enable row level security;

create policy "own partner account" on public.partners
for select using (id = public.current_partner_id() or sponsor_id = public.current_partner_id() or public.is_admin());

create policy "manage own partner" on public.partners
for update using (id = public.current_partner_id() or public.is_admin())
with check (id = public.current_partner_id() or public.is_admin());

create policy "read partner tiers" on public.partner_tiers
for select using (public.current_partner_id() is not null or public.is_admin());

create policy "own referrals" on public.partner_referrals
for select using (partner_id = public.current_partner_id() or source_partner_id = public.current_partner_id() or public.is_admin());

create policy "own balance" on public.partner_balances
for select using (partner_id = public.current_partner_id() or public.is_admin());

create policy "own payouts" on public.partner_payouts
for select using (partner_id = public.current_partner_id() or public.is_admin());

create policy "request own payout" on public.partner_payouts
for insert with check (partner_id = public.current_partner_id());

create policy "read active partner materials" on public.partner_materials
for select using (is_active = true or public.is_admin());

create policy "own link clicks" on public.partner_link_clicks
for select using (partner_id = public.current_partner_id() or public.is_admin());

create policy "own partner notifications" on public.partner_notifications
for select using (partner_id = public.current_partner_id() or public.is_admin());

create or replace function public.apply_partner_referral_balance(
  p_partner_id uuid,
  p_commission_cents integer,
  p_commission_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.partner_balances (
    partner_id, pending_cents, total_tickets_sold, own_tickets_sold, team_tickets_sold
  )
  values (
    p_partner_id,
    p_commission_cents,
    1,
    case when p_commission_type = 'own' then 1 else 0 end,
    case when p_commission_type = 'team_override' then 1 else 0 end
  )
  on conflict (partner_id) do update
    set pending_cents = partner_balances.pending_cents + excluded.pending_cents,
        total_tickets_sold = partner_balances.total_tickets_sold + 1,
        own_tickets_sold = partner_balances.own_tickets_sold + excluded.own_tickets_sold,
        team_tickets_sold = partner_balances.team_tickets_sold + excluded.team_tickets_sold,
        updated_at = now();
end;
$$;

create or replace function public.confirm_partner_commissions_for_event(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with changed as (
    update public.partner_referrals
    set status = 'confirmed',
        confirmed_at = now()
    where event_id = p_event_id and status = 'pending'
    returning partner_id, commission_cents
  ),
  totals as (
    select partner_id, sum(commission_cents)::integer as amount
    from changed
    group by partner_id
  )
  update public.partner_balances pb
  set pending_cents = greatest(0, pending_cents - totals.amount),
      available_cents = available_cents + totals.amount,
      updated_at = now()
  from totals
  where totals.partner_id = pb.partner_id;

  select count(*) into v_count
  from public.partner_referrals
  where event_id = p_event_id and status = 'confirmed' and confirmed_at is not null;

  return jsonb_build_object('event_id', p_event_id, 'confirmed', v_count);
end;
$$;

create or replace function public.reverse_partner_commission_for_ticket(p_ticket_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount integer;
begin
  with affected as (
    select partner_id, status, commission_cents
    from public.partner_referrals
    where ticket_id = p_ticket_id and status in ('pending','confirmed')
  ),
  totals as (
    select partner_id,
      coalesce(sum(commission_cents) filter (where status = 'pending'), 0)::integer as pending_amount,
      coalesce(sum(commission_cents) filter (where status = 'confirmed'), 0)::integer as confirmed_amount,
      coalesce(sum(commission_cents), 0)::integer as total_amount
    from affected
    group by partner_id
  ),
  changed as (
    update public.partner_referrals
    set status = 'reversed'
    where ticket_id = p_ticket_id and status in ('pending','confirmed')
    returning id
  )
  update public.partner_balances pb
  set pending_cents = greatest(0, pending_cents - totals.pending_amount),
      available_cents = greatest(0, available_cents - totals.confirmed_amount),
      reversed_total_cents = reversed_total_cents + totals.total_amount,
      updated_at = now()
  from totals
  where totals.partner_id = pb.partner_id;

  select coalesce(sum(commission_cents), 0)::integer into v_amount
  from public.partner_referrals
  where ticket_id = p_ticket_id and status = 'reversed';

  return jsonb_build_object('ticket_id', p_ticket_id, 'reversed_cents', v_amount);
end;
$$;
