-- HOTMESS staging/demo launch seed.
-- Safe fake data only. Do not use production customers, payment ids or secrets.

insert into public.users (
  id,
  email,
  username,
  first_name,
  last_name,
  email_verified,
  verification_status,
  role
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'admin-staging@hotmess-blkn.com',
    'hotmess_admin',
    'HOTMESS',
    'Admin',
    true,
    'verified',
    'admin'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'member-staging@hotmess-blkn.com',
    'hotmess_member',
    'Mia',
    'Member',
    true,
    'verified',
    'user'
  )
on conflict (email) do update
set
  username = excluded.username,
  email_verified = excluded.email_verified,
  verification_status = excluded.verification_status,
  role = excluded.role,
  updated_at = now();

insert into public.user_profiles (user_id, city, country, interests, onboarding_completed)
values
  ('11111111-1111-4111-8111-111111111111', 'Wien', 'AT', '["events", "operations"]'::jsonb, true),
  ('22222222-2222-4222-8222-222222222222', 'Innsbruck', 'AT', '["events", "travel", "community"]'::jsonb, true)
on conflict (user_id) do update
set
  city = excluded.city,
  country = excluded.country,
  interests = excluded.interests,
  onboarding_completed = excluded.onboarding_completed,
  updated_at = now();

insert into public.venues (
  id,
  name,
  slug,
  city,
  country,
  address,
  status
) values (
  '33333333-3333-4333-8333-333333333333',
  'HOTMESS Staging Venue',
  'hotmess-staging-venue',
  'Innsbruck',
  'AT',
  'Staging Street 1',
  'active'
)
on conflict (slug) do update
set
  name = excluded.name,
  city = excluded.city,
  address = excluded.address,
  status = excluded.status,
  updated_at = now();

insert into public.events (
  id,
  venue_id,
  title,
  slug,
  city,
  category,
  short_description,
  long_description,
  start_at,
  end_at,
  doors_open_at,
  dress_code,
  app_enabled,
  status
) values (
  '44444444-4444-4444-8444-444444444444',
  '33333333-3333-4333-8333-333333333333',
  'HOTMESS Staging Night',
  'hotmess-staging-night',
  'Innsbruck',
  'signature',
  'Staging event for checkout, ticketing and scanner smoke tests.',
  'Used only for staging launch validation.',
  now() + interval '14 days',
  now() + interval '14 days' + interval '6 hours',
  now() + interval '14 days' - interval '1 hour',
  'Elevated evening wear',
  true,
  'published'
)
on conflict (slug) do update
set
  title = excluded.title,
  city = excluded.city,
  short_description = excluded.short_description,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  doors_open_at = excluded.doors_open_at,
  status = excluded.status,
  updated_at = now();

insert into public.ticket_types (
  event_id,
  title,
  slug,
  description,
  price_cents,
  currency,
  capacity,
  benefits,
  requires_membership,
  status
) values
  (
    '44444444-4444-4444-8444-444444444444',
    'Regular',
    'regular',
    'Staging regular ticket.',
    3900,
    'EUR',
    200,
    '["Event access", "Digital ticket"]'::jsonb,
    false,
    'active'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'VIP',
    'vip',
    'Staging VIP ticket.',
    9900,
    'EUR',
    40,
    '["Fast lane", "VIP area", "Concierge contact"]'::jsonb,
    false,
    'active'
  )
on conflict (event_id, slug) do update
set
  title = excluded.title,
  description = excluded.description,
  price_cents = excluded.price_cents,
  capacity = excluded.capacity,
  benefits = excluded.benefits,
  status = excluded.status,
  updated_at = now();
