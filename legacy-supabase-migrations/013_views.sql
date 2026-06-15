-- Operational views for admin and analytics
create or replace view public.event_sales_summary as
select
  e.id as event_id,
  e.title,
  e.city,
  count(t.id) filter (where t.status in ('valid', 'checked_in')) as valid_tickets,
  count(t.id) filter (where t.status = 'checked_in') as checked_in_tickets
from public.events e
left join public.tickets t on t.event_id = e.id
group by e.id, e.title, e.city;

create or replace view public.user_safety_summary as
select
  id,
  email,
  username,
  role,
  safety_status,
  chat_status,
  warning_count,
  suspended_until,
  banned_at,
  updated_at
from public.users;
