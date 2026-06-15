-- Section 8 core: feed, profiles, social graph, event chat and moderation
alter table public.user_profiles
  add column if not exists cover_url text,
  add column if not exists privacy text not null default 'public' check (privacy in ('public', 'followers_only', 'private')),
  add column if not exists show_event_attendance boolean not null default true;

alter table public.posts
  add column if not exists post_type text not null default 'text' check (post_type in ('text', 'image', 'event', 'announcement')),
  add column if not exists image_url text;

alter table public.follows
  drop constraint if exists follows_status_check;

alter table public.follows
  add constraint follows_status_check check (status in ('pending', 'accepted', 'rejected', 'blocked'));

alter table public.chats
  drop constraint if exists chats_type_check;

alter table public.chats
  add constraint chats_type_check check (type in ('direct', 'concierge', 'partner', 'event'));

create table if not exists public.event_chats (
  event_id uuid primary key references public.events(id) on delete cascade,
  chat_id uuid unique not null references public.chats(id) on delete cascade,
  read_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'heart', 'fire', 'party')),
  created_at timestamptz not null default now(),
  unique (message_id, user_id)
);

create table if not exists public.chat_polls (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'closed', 'deleted')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_poll_votes (
  poll_id uuid not null references public.chat_polls(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  option_index integer not null check (option_index >= 0),
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'profile', 'chat_message')),
  target_id uuid not null,
  reason text not null check (reason in ('spam', 'harassment', 'fake_profile', 'inappropriate_content')),
  description text,
  status text not null default 'new' check (status in ('new', 'in_review', 'resolved', 'dismissed')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now()
);

create or replace function public.create_event_chat_for_event(p_event_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_chat_id uuid;
begin
  select * into v_event
  from public.events
  where id = p_event_id;

  if not found then
    raise exception 'Event not found';
  end if;

  select chat_id into v_chat_id
  from public.event_chats
  where event_id = p_event_id;

  if v_chat_id is not null then
    return v_chat_id;
  end if;

  insert into public.chats (type, created_by, last_message, last_message_at)
  values ('event', null, 'Event Chat wurde erstellt.', now())
  returning id into v_chat_id;

  insert into public.event_chats (event_id, chat_id)
  values (p_event_id, v_chat_id);

  return v_chat_id;
end;
$$;

create or replace function public.add_ticket_holder_to_event_chat(p_ticket_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.tickets%rowtype;
  v_chat_id uuid;
begin
  select * into v_ticket
  from public.tickets
  where id = p_ticket_id
    and status = 'valid';

  if not found then
    raise exception 'Valid ticket is required';
  end if;

  v_chat_id := public.create_event_chat_for_event(v_ticket.event_id);

  insert into public.chat_participants (chat_id, user_id, role)
  values (v_chat_id, v_ticket.user_id, 'attendee')
  on conflict (chat_id, user_id) do update
    set deleted_for_user = false,
        blocked = false,
        updated_at = now();

  return v_chat_id;
end;
$$;

create or replace function public.remove_ticket_holder_from_event_chat(p_ticket_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.tickets%rowtype;
  v_chat_id uuid;
begin
  select * into v_ticket from public.tickets where id = p_ticket_id;
  if not found then
    return false;
  end if;

  select chat_id into v_chat_id from public.event_chats where event_id = v_ticket.event_id;
  if v_chat_id is null then
    return false;
  end if;

  update public.chat_participants
  set blocked = true,
      updated_at = now()
  where chat_id = v_chat_id
    and user_id = v_ticket.user_id;

  return true;
end;
$$;

create or replace function public.set_event_chats_read_only()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.event_chats ec
  set read_only = true
  from public.events e
  where e.id = ec.event_id
    and e.status = 'completed'
    and ec.read_only = false;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.handle_event_chat_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' then
    perform public.create_event_chat_for_event(new.id);
  end if;

  if new.status = 'completed' and old.status is distinct from 'completed' then
    update public.event_chats
    set read_only = true
    where event_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists handle_event_chat_lifecycle on public.events;
create trigger handle_event_chat_lifecycle
after update of status on public.events
for each row execute function public.handle_event_chat_lifecycle();

create or replace function public.handle_ticket_chat_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'valid' and (tg_op = 'INSERT' or old.status is distinct from 'valid') then
    perform public.add_ticket_holder_to_event_chat(new.id);
  end if;

  if new.status in ('cancelled', 'expired') and old.status is distinct from new.status then
    perform public.remove_ticket_holder_from_event_chat(new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists handle_ticket_chat_membership on public.tickets;
create trigger handle_ticket_chat_membership
after insert or update of status on public.tickets
for each row execute function public.handle_ticket_chat_membership();

create or replace view public.community_kpi_summary as
select
  count(distinct p.author_id) filter (where p.created_at >= now() - interval '1 day') as dau,
  count(distinct p.author_id) filter (where p.created_at >= now() - interval '30 days') as mau,
  count(distinct p.id) as posts,
  count(distinct pc.id) as comments,
  count(distinct pr.post_id || ':' || pr.user_id) as likes,
  count(distinct cm.id) filter (where cm.media_type <> 'system') as chat_messages,
  count(distinct f.follower_id || ':' || f.following_id) filter (where f.created_at >= now() - interval '30 days') as new_follows
from public.posts p
left join public.post_comments pc on pc.post_id = p.id
left join public.post_reactions pr on pr.post_id = p.id
left join public.chat_messages cm on cm.created_at >= now() - interval '30 days'
left join public.follows f on f.created_at >= now() - interval '30 days';

alter table public.event_chats enable row level security;
alter table public.chat_reactions enable row level security;
alter table public.chat_polls enable row level security;
alter table public.chat_poll_votes enable row level security;
alter table public.community_reports enable row level security;

drop policy if exists "Chat participants can insert messages" on public.chat_messages;

create policy "Chat participants can insert messages"
on public.chat_messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = chat_messages.chat_id
      and cp.user_id = auth.uid()
      and cp.blocked = false
      and cp.deleted_for_user = false
  )
  and not exists (
    select 1 from public.event_chats ec
    where ec.chat_id = chat_messages.chat_id
      and ec.read_only = true
  )
);

create policy "Users can read event chats with valid ticket"
on public.event_chats for select
using (
  exists (
    select 1 from public.tickets t
    where t.event_id = event_chats.event_id
      and t.user_id = auth.uid()
      and t.status = 'valid'
  )
  or public.is_admin()
);

create policy "Chat participants can react"
on public.chat_reactions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.chat_messages cm
    join public.chat_participants cp on cp.chat_id = cm.chat_id
    where cm.id = chat_reactions.message_id
      and cp.user_id = auth.uid()
      and cp.blocked = false
  )
);

create policy "Chat participants can read polls"
on public.chat_polls for select
using (
  exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = chat_polls.chat_id
      and cp.user_id = auth.uid()
      and cp.blocked = false
  )
);

create policy "Chat participants can create polls"
on public.chat_polls for insert
with check (
  author_id = auth.uid()
  and jsonb_array_length(options) >= 2
  and exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = chat_polls.chat_id
      and cp.user_id = auth.uid()
      and cp.blocked = false
  )
);

create policy "Users can submit community reports"
on public.community_reports for insert
with check (reporter_id = auth.uid());

create policy "Admins can manage community reports"
on public.community_reports for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('posts', 'posts', true),
  ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "Post media is public"
on storage.objects for select
using (bucket_id = 'posts');

create policy "Users upload own post media"
on storage.objects for insert
with check (
  bucket_id = 'posts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Profile covers are public"
on storage.objects for select
using (bucket_id = 'covers');

create policy "Users upload own cover"
on storage.objects for insert
with check (
  bucket_id = 'covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_follows_following_status on public.follows(following_id, status);
create index if not exists idx_event_chats_chat on public.event_chats(chat_id);
create index if not exists idx_community_reports_status on public.community_reports(status, created_at);
