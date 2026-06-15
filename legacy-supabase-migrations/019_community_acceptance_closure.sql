-- Section 8 acceptance closure: attendee visibility, friend activity, profile analytics and realtime preparation
alter table public.event_attendees
  add column if not exists visibility text not null default 'visible' check (visibility in ('visible', 'hidden'));

create table if not exists public.friend_activities (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null check (activity_type in ('follow', 'event_attendance', 'ticket_purchase')),
  actor_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  visible boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace view public.profile_analytics_summary as
select
  u.id as user_id,
  count(distinct f1.follower_id) filter (where f1.status = 'accepted') as follower_count,
  count(distinct f2.following_id) filter (where f2.status = 'accepted') as following_count,
  count(distinct ea.event_id) as events_visited,
  count(distinct p.id) filter (where p.status = 'published') as posts_count
from public.users u
left join public.follows f1 on f1.following_id = u.id
left join public.follows f2 on f2.follower_id = u.id
left join public.event_attendees ea on ea.user_id = u.id
left join public.posts p on p.author_id = u.id
group by u.id;

create or replace view public.event_attendee_social_view as
select
  ea.event_id,
  ea.user_id,
  trim(u.first_name || ' ' || u.last_name) as name,
  u.avatar_url,
  ea.visibility,
  ea.created_at
from public.event_attendees ea
join public.users u on u.id = ea.user_id
where ea.visibility = 'visible';

alter table public.friend_activities enable row level security;

create policy "Users can read visible friend activities"
on public.friend_activities for select
using (
  visible = true
  and auth.uid() is not null
);

create policy "Users can manage own attendee visibility"
on public.event_attendees for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.create_friend_activity(
  p_activity_type text,
  p_actor_id uuid,
  p_target_user_id uuid default null,
  p_event_id uuid default null,
  p_visible boolean default true,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.friend_activities (
    activity_type,
    actor_id,
    target_user_id,
    event_id,
    visible,
    metadata
  )
  values (
    p_activity_type,
    p_actor_id,
    p_target_user_id,
    p_event_id,
    p_visible,
    p_metadata
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.handle_follow_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and (tg_op = 'INSERT' or old.status is distinct from 'accepted') then
    perform public.create_friend_activity(
      'follow',
      new.follower_id,
      new.following_id,
      null,
      true,
      '{}'::jsonb
    );
  end if;

  return new;
end;
$$;

drop trigger if exists handle_follow_activity on public.follows;
create trigger handle_follow_activity
after insert or update of status on public.follows
for each row execute function public.handle_follow_activity();

create or replace function public.handle_event_attendance_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.create_friend_activity(
    'event_attendance',
    new.user_id,
    null,
    new.event_id,
    new.visibility = 'visible',
    jsonb_build_object('ticketId', new.ticket_id)
  );

  return new;
end;
$$;

drop trigger if exists handle_event_attendance_activity on public.event_attendees;
create trigger handle_event_attendance_activity
after insert on public.event_attendees
for each row execute function public.handle_event_attendance_activity();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.chat_reactions; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.chat_polls; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.post_reactions; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.post_comments; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.follows; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
  end if;
end $$;

create index if not exists idx_friend_activities_actor_created on public.friend_activities(actor_id, created_at desc);
create index if not exists idx_friend_activities_event_created on public.friend_activities(event_id, created_at desc);
