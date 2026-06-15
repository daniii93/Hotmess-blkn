-- Minimal seed data for local development only. Do not run blindly in production.
insert into public.venues (name, slug, city, country, status)
values ('HOTMESS House Vienna', 'hotmess-house-vienna', 'Wien', 'AT', 'active')
on conflict (slug) do nothing;

insert into public.events (venue_id, title, slug, city, category, short_description, start_at, status)
select id, 'HOTMESS Signature Night', 'hotmess-signature-night', 'Wien', 'signature',
  'Curated nights. Private weekends. A community beyond the event.',
  now() + interval '30 days', 'published'
from public.venues
where slug = 'hotmess-house-vienna'
on conflict (slug) do nothing;
