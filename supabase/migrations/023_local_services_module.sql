-- HotMess local services module.
-- A verified, closed-loop marketplace for local jobs, providers, leads, offers, orders and reviews.

create table if not exists public.local_service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  min_lead_price_cents integer default 500,
  max_lead_price_cents integer default 25000,
  commission_rate decimal(5,2) default 8.00,
  required_documents text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.local_service_provider_profiles (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid references public.business_profiles(id) on delete cascade,
  description text,
  service_radius_km integer,
  base_city text,
  base_zip text,
  emergency_service boolean default false,
  onsite_visit boolean default true,
  insurance_available boolean default false,
  min_order_cents integer,
  hourly_rate_cents integer,
  availability jsonb,
  verification_status text default 'pending'
    check (verification_status in ('pending','verified','rejected','suspended')),
  rating_avg decimal(2,1),
  rating_count integer default 0,
  response_rate decimal(5,2) default 0,
  close_rate decimal(5,2) default 0,
  trust_score integer default 60,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (business_profile_id)
);

create table if not exists public.local_service_provider_categories (
  provider_id uuid references public.local_service_provider_profiles(id) on delete cascade,
  category_id uuid references public.local_service_categories(id) on delete cascade,
  primary key (provider_id, category_id)
);

create table if not exists public.local_service_projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  category_id uuid references public.local_service_categories(id),
  title text not null,
  description text not null,
  budget_cents integer,
  urgency text check (urgency in ('immediate','this_week','this_month','flexible')),
  desired_timeline text,
  address text,
  city text,
  zip text,
  country text,
  lat decimal(9,6),
  lng decimal(9,6),
  radius_km integer default 10,
  contact_preference text check (contact_preference in ('platform_chat','phone_after_acceptance','platform_visit')),
  status text default 'open'
    check (status in ('open','lead_purchased','offer_sent','offer_accepted','payment_pending','in_progress','completed_by_company','approved_by_customer','paid_out','cancelled','disputed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.local_service_project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.local_service_projects(id) on delete cascade,
  file_url text not null,
  file_type text,
  created_at timestamptz default now()
);

create table if not exists public.local_service_leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.local_service_projects(id) on delete cascade,
  provider_id uuid references public.local_service_provider_profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id),
  price_cents integer not null,
  estimated_project_value_cents integer,
  status text default 'available'
    check (status in ('available','viewed','purchased','expired','refunded','blocked')),
  purchased_at timestamptz,
  created_at timestamptz default now(),
  unique (project_id, provider_id)
);

create table if not exists public.local_service_offers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.local_service_projects(id) on delete cascade,
  provider_id uuid references public.local_service_provider_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  labor_cost_cents integer default 0,
  material_cost_cents integer default 0,
  other_cost_cents integer default 0,
  tax_cents integer default 0,
  total_price_cents integer not null,
  valid_until timestamptz,
  start_date date,
  duration_days integer,
  payment_terms text,
  status text default 'sent'
    check (status in ('draft','sent','accepted','rejected','expired','cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.local_service_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.local_service_projects(id) on delete cascade,
  offer_id uuid references public.local_service_offers(id),
  customer_id uuid references public.profiles(id),
  provider_id uuid references public.local_service_provider_profiles(id),
  status text default 'payment_pending'
    check (status in ('payment_pending','in_progress','completed_by_company','approved_by_customer','paid_out','cancelled','disputed')),
  total_amount_cents integer not null,
  commission_rate decimal(5,2) default 8.00,
  commission_amount_cents integer not null,
  service_fee_cents integer default 0,
  payout_amount_cents integer not null,
  payment_id text,
  created_at timestamptz default now()
);

create table if not exists public.local_service_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.local_service_orders(id) on delete cascade,
  stripe_payment_id text,
  amount_cents integer not null,
  type text check (type in ('lead_fee','deposit','final_payment','service_fee','subscription','refund')),
  status text default 'pending'
    check (status in ('pending','paid','failed','refunded','cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.local_service_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.local_service_orders(id) on delete cascade,
  reviewer_id uuid references public.profiles(id),
  provider_id uuid references public.local_service_provider_profiles(id),
  rating integer check (rating between 1 and 5),
  punctuality integer check (punctuality between 1 and 5),
  quality integer check (quality between 1 and 5),
  communication integer check (communication between 1 and 5),
  value_for_money integer check (value_for_money between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (order_id, reviewer_id)
);

create table if not exists public.local_service_disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.local_service_orders(id) on delete cascade,
  opened_by uuid references public.profiles(id),
  reason text not null,
  status text default 'open'
    check (status in ('open','reviewing','resolved','rejected','closed')),
  resolution text,
  created_at timestamptz default now()
);

create table if not exists public.local_service_subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.local_service_provider_profiles(id) on delete cascade,
  plan text default 'free'
    check (plan in ('free','basic','pro','premium')),
  stripe_subscription_id text,
  status text default 'active'
    check (status in ('active','cancelled','past_due','expired')),
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.local_service_contact_violations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  project_id uuid references public.local_service_projects(id),
  provider_id uuid references public.local_service_provider_profiles(id),
  surface text not null,
  blocked_text text,
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists public.local_service_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz default now()
);

create index if not exists idx_local_service_projects_customer on public.local_service_projects(customer_id, created_at desc);
create index if not exists idx_local_service_projects_category_zip on public.local_service_projects(category_id, zip, status);
create index if not exists idx_local_service_provider_business on public.local_service_provider_profiles(business_profile_id, verification_status);
create index if not exists idx_local_service_leads_provider on public.local_service_leads(provider_id, status, created_at desc);
create index if not exists idx_local_service_offers_project on public.local_service_offers(project_id, status, created_at desc);
create index if not exists idx_local_service_orders_customer on public.local_service_orders(customer_id, status, created_at desc);

alter table public.local_service_categories enable row level security;
alter table public.local_service_provider_profiles enable row level security;
alter table public.local_service_provider_categories enable row level security;
alter table public.local_service_projects enable row level security;
alter table public.local_service_project_files enable row level security;
alter table public.local_service_leads enable row level security;
alter table public.local_service_offers enable row level security;
alter table public.local_service_orders enable row level security;
alter table public.local_service_payments enable row level security;
alter table public.local_service_reviews enable row level security;
alter table public.local_service_disputes enable row level security;
alter table public.local_service_subscriptions enable row level security;
alter table public.local_service_contact_violations enable row level security;
alter table public.local_service_audit enable row level security;

create or replace function public.owns_local_service_provider(p_provider_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.local_service_provider_profiles lsp
    join public.business_profiles bp on bp.id = lsp.business_profile_id
    where lsp.id = p_provider_id
      and coalesce(bp.owner_user_id, bp.user_id) = p_user_id
  );
$$;

drop policy if exists "verified users read local service categories" on public.local_service_categories;
create policy "verified users read local service categories" on public.local_service_categories
for select using (is_active = true and public.is_verified_user(auth.uid()) or public.is_admin());

drop policy if exists "admin manages local service categories" on public.local_service_categories;
create policy "admin manages local service categories" on public.local_service_categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read verified local service providers" on public.local_service_provider_profiles;
create policy "read verified local service providers" on public.local_service_provider_profiles
for select using (
  public.is_admin()
  or public.owns_local_service_provider(id)
  or (
    public.is_verified_user(auth.uid())
    and verification_status = 'verified'
  )
);

drop policy if exists "owner manages local service provider profile" on public.local_service_provider_profiles;
create policy "owner manages local service provider profile" on public.local_service_provider_profiles
for all using (public.is_admin() or public.owns_local_service_provider(id))
with check (public.is_admin() or public.has_verified_business_module('local_services', auth.uid()));

drop policy if exists "read provider categories" on public.local_service_provider_categories;
create policy "read provider categories" on public.local_service_provider_categories
for select using (public.is_verified_user(auth.uid()) or public.is_admin());

drop policy if exists "manage own provider categories" on public.local_service_provider_categories;
create policy "manage own provider categories" on public.local_service_provider_categories
for all using (public.is_admin() or public.owns_local_service_provider(provider_id))
with check (public.is_admin() or public.owns_local_service_provider(provider_id));

drop policy if exists "customers read own projects and providers read purchased leads" on public.local_service_projects;
create policy "customers read own projects and providers read purchased leads" on public.local_service_projects
for select using (
  public.is_admin()
  or (customer_id = auth.uid() and public.is_verified_user(auth.uid()))
  or exists (
    select 1 from public.local_service_leads l
    where l.project_id = local_service_projects.id
      and l.status in ('available','viewed','purchased')
      and public.owns_local_service_provider(l.provider_id)
  )
);

drop policy if exists "verified customers create projects" on public.local_service_projects;
create policy "verified customers create projects" on public.local_service_projects
for insert with check (customer_id = auth.uid() and public.is_verified_user(auth.uid()));

drop policy if exists "customers update own projects" on public.local_service_projects;
create policy "customers update own projects" on public.local_service_projects
for update using (customer_id = auth.uid() or public.is_admin())
with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "project files visible to customer provider admin" on public.local_service_project_files;
create policy "project files visible to customer provider admin" on public.local_service_project_files
for select using (
  public.is_admin()
  or exists (select 1 from public.local_service_projects p where p.id = project_id and p.customer_id = auth.uid())
  or exists (select 1 from public.local_service_leads l where l.project_id = project_id and l.status = 'purchased' and public.owns_local_service_provider(l.provider_id))
);

drop policy if exists "customers manage project files" on public.local_service_project_files;
create policy "customers manage project files" on public.local_service_project_files
for all using (
  public.is_admin()
  or exists (select 1 from public.local_service_projects p where p.id = project_id and p.customer_id = auth.uid())
) with check (
  public.is_admin()
  or exists (select 1 from public.local_service_projects p where p.id = project_id and p.customer_id = auth.uid())
);

drop policy if exists "providers read own leads" on public.local_service_leads;
create policy "providers read own leads" on public.local_service_leads
for select using (public.is_admin() or public.owns_local_service_provider(provider_id));

drop policy if exists "providers update own leads" on public.local_service_leads;
create policy "providers update own leads" on public.local_service_leads
for update using (public.is_admin() or public.owns_local_service_provider(provider_id))
with check (public.is_admin() or public.owns_local_service_provider(provider_id));

drop policy if exists "offers visible to project customer and provider" on public.local_service_offers;
create policy "offers visible to project customer and provider" on public.local_service_offers
for select using (
  public.is_admin()
  or public.owns_local_service_provider(provider_id)
  or exists (select 1 from public.local_service_projects p where p.id = project_id and p.customer_id = auth.uid())
);

drop policy if exists "providers manage own offers" on public.local_service_offers;
create policy "providers manage own offers" on public.local_service_offers
for all using (public.is_admin() or public.owns_local_service_provider(provider_id))
with check (public.is_admin() or public.owns_local_service_provider(provider_id));

drop policy if exists "orders visible to parties" on public.local_service_orders;
create policy "orders visible to parties" on public.local_service_orders
for select using (public.is_admin() or customer_id = auth.uid() or public.owns_local_service_provider(provider_id));

drop policy if exists "orders updated by parties" on public.local_service_orders;
create policy "orders updated by parties" on public.local_service_orders
for update using (public.is_admin() or customer_id = auth.uid() or public.owns_local_service_provider(provider_id))
with check (public.is_admin() or customer_id = auth.uid() or public.owns_local_service_provider(provider_id));

drop policy if exists "payments visible to order parties" on public.local_service_payments;
create policy "payments visible to order parties" on public.local_service_payments
for select using (
  public.is_admin()
  or exists (
    select 1 from public.local_service_orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or public.owns_local_service_provider(o.provider_id))
  )
);

drop policy if exists "reviews visible to verified users" on public.local_service_reviews;
create policy "reviews visible to verified users" on public.local_service_reviews
for select using (public.is_verified_user(auth.uid()) or public.is_admin());

drop policy if exists "customers create completed order reviews" on public.local_service_reviews;
create policy "customers create completed order reviews" on public.local_service_reviews
for insert with check (
  reviewer_id = auth.uid()
  and exists (
    select 1 from public.local_service_orders o
    where o.id = order_id
      and o.customer_id = auth.uid()
      and o.status in ('approved_by_customer','paid_out')
  )
);

drop policy if exists "disputes visible to parties" on public.local_service_disputes;
create policy "disputes visible to parties" on public.local_service_disputes
for select using (
  public.is_admin()
  or opened_by = auth.uid()
  or exists (
    select 1 from public.local_service_orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or public.owns_local_service_provider(o.provider_id))
  )
);

drop policy if exists "parties open disputes" on public.local_service_disputes;
create policy "parties open disputes" on public.local_service_disputes
for insert with check (
  opened_by = auth.uid()
  and exists (
    select 1 from public.local_service_orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or public.owns_local_service_provider(o.provider_id))
  )
);

drop policy if exists "subscriptions visible to providers" on public.local_service_subscriptions;
create policy "subscriptions visible to providers" on public.local_service_subscriptions
for select using (public.is_admin() or public.owns_local_service_provider(provider_id));

drop policy if exists "contact violations visible to admin" on public.local_service_contact_violations;
create policy "contact violations visible to admin" on public.local_service_contact_violations
for select using (public.is_admin());

drop policy if exists "audit visible to admin" on public.local_service_audit;
create policy "audit visible to admin" on public.local_service_audit
for select using (public.is_admin());

insert into public.local_service_categories (name, slug, description, icon, min_lead_price_cents, max_lead_price_cents, required_documents)
values
  ('Sanierung', 'sanierung', 'Renovierung, Umbau und Komplettsanierung.', 'hammer', 2000, 15000, array['Gewerbeberechtigung']),
  ('Maler', 'maler', 'Innen- und Aussenmalerei.', 'paintbrush', 800, 5000, array['Gewerbeberechtigung']),
  ('Elektriker', 'elektriker', 'Elektroinstallationen und Reparaturen.', 'zap', 1500, 8000, array['Gewerbeberechtigung','Versicherung']),
  ('Installateur', 'installateur', 'Sanitaer, Wasser und Leitungen.', 'wrench', 1500, 8000, array['Gewerbeberechtigung','Versicherung']),
  ('Dach', 'dach', 'Dacharbeiten, Reparaturen und Abdichtungen.', 'home', 2500, 20000, array['Gewerbeberechtigung','Versicherung']),
  ('Fenster', 'fenster', 'Fenster, Tueren und Montage.', 'panel-top', 1500, 10000, array['Gewerbeberechtigung']),
  ('Boden', 'boden', 'Parkett, Laminat, Vinyl und Estrich.', 'layers', 1000, 8000, array['Gewerbeberechtigung']),
  ('Garten', 'garten', 'Gartenpflege, Gestaltung und Aussenanlagen.', 'leaf', 700, 6000, null),
  ('Reinigung', 'reinigung', 'Haushalt, Buero, Event und Spezialreinigung.', 'sparkles', 500, 4000, null),
  ('Umzug', 'umzug', 'Umzug, Transport und Entsorgung.', 'truck', 1000, 7000, null),
  ('Photovoltaik', 'photovoltaik', 'PV-Anlagen, Speicher und Beratung.', 'sun', 3000, 25000, array['Gewerbeberechtigung']),
  ('Heizung', 'heizung', 'Heizung, Waermepumpe und Service.', 'flame', 2000, 15000, array['Gewerbeberechtigung']),
  ('Bad', 'bad', 'Badrenovierung und Badplanung.', 'bath', 2000, 15000, array['Gewerbeberechtigung']),
  ('Kueche', 'kueche', 'Kuechenplanung, Montage und Umbau.', 'utensils', 1500, 12000, null),
  ('Trockenbau', 'trockenbau', 'Waende, Decken und Ausbau.', 'box', 1000, 8000, array['Gewerbeberechtigung']),
  ('Fliesen', 'fliesen', 'Fliesenlegen und Reparatur.', 'grid', 1000, 8000, array['Gewerbeberechtigung']),
  ('Tischler', 'tischler', 'Moebel, Holzbau und Massarbeit.', 'ruler', 1000, 10000, array['Gewerbeberechtigung']),
  ('Schlosser', 'schlosser', 'Metallarbeiten, Schloss und Sicherheit.', 'key', 1000, 9000, array['Gewerbeberechtigung']),
  ('Auto-Service', 'auto-service', 'Auto, Reifen, Pflege und Reparatur.', 'car', 700, 6000, null),
  ('IT-Service', 'it-service', 'IT-Support, Netzwerk und Website.', 'laptop', 500, 5000, null),
  ('Fotograf', 'fotograf', 'Fotoshooting, Event und Content.', 'camera', 500, 5000, null),
  ('DJ', 'dj', 'DJ, Technik und Musik fuer Events.', 'music', 500, 7000, null),
  ('Eventservice', 'eventservice', 'Personal, Ausstattung und Organisation.', 'calendar', 800, 10000, null),
  ('Security', 'security', 'Einlass, Sicherheit und Eventschutz.', 'shield', 1000, 10000, array['Gewerbeberechtigung']),
  ('Sonstiges', 'sonstiges', 'Weitere lokale Dienstleistungen.', 'circle', 500, 5000, null)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    icon = excluded.icon,
    min_lead_price_cents = excluded.min_lead_price_cents,
    max_lead_price_cents = excluded.max_lead_price_cents,
    required_documents = excluded.required_documents;
