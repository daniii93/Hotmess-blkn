-- HotMess Teil 3a: Social-Kern.
-- Extends the existing rebuild schema with feed, stories, chat, friend activity, notifications and search.

alter type public.message_type add value if not exists 'video';
alter type public.message_type add value if not exists 'gif';
alter type public.message_type add value if not exists 'poll';
alter type public.message_type add value if not exists 'system';

alter table public.posts
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists content text check (char_length(content) <= 2200),
  add column if not exists media_urls text[] default '{}',
  add column if not exists media_aspect text check (media_aspect in ('square','portrait','landscape')),
  add column if not exists hashtags text[] default '{}',
  add column if not exists mentions uuid[] default '{}',
  add column if not exists location_label text,
  add column if not exists likes_count integer not null default 0,
  add column if not exists comments_count integer not null default 0,
  add column if not exists shares_count integer not null default 0,
  add column if not exists saves_count integer not null default 0,
  add column if not exists is_archived boolean not null default false,
  add column if not exists is_pinned boolean not null default false;

update public.posts
set user_id = coalesce(user_id, author_id),
    media_urls = case when image_url is not null and (media_urls is null or cardinality(media_urls) = 0) then array[image_url] else media_urls end,
    content = coalesce(content, body)
where user_id is null or content is null;

create index if not exists idx_posts_user on public.posts(user_id, created_at desc);
create index if not exists idx_posts_event on public.posts(event_id) where event_id is not null;
create index if not exists idx_posts_hashtags on public.posts using gin(hashtags);

alter table public.comments
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists parent_id uuid references public.comments(id) on delete cascade,
  add column if not exists content text,
  add column if not exists likes_count integer not null default 0;

update public.comments
set user_id = coalesce(user_id, author_id),
    content = coalesce(content, body)
where user_id is null or content is null;

create index if not exists idx_comments_post on public.comments(post_id, created_at);

create table if not exists public.comment_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

alter table public.saved_posts
  add column if not exists saved_at timestamptz not null default now();

alter table public.stories
  add column if not exists user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists type text check (type in ('photo','video','event','badge','birthday','poll','question','music')),
  add column if not exists thumbnail_url text,
  add column if not exists text_overlay text,
  add column if not exists music_url text,
  add column if not exists music_title text,
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists poll_question text,
  add column if not exists poll_options jsonb default '[]'::jsonb,
  add column if not exists link_url text,
  add column if not exists audience text not null default 'friends'
    check (audience in ('all','friends','close_friends')),
  add column if not exists view_count integer not null default 0;

update public.stories
set user_id = coalesce(user_id, author_id),
    type = coalesce(type, 'photo')
where user_id is null or type is null;

create index if not exists idx_stories_user on public.stories(user_id, created_at desc);

alter table public.story_views
  add column if not exists viewed_at timestamptz not null default now();

create table if not exists public.story_poll_votes (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  option_id integer not null,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

alter table public.story_highlights
  add column if not exists cover_url text,
  add column if not exists sort_order integer not null default 0;

create table if not exists public.close_friends (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

alter table public.conversations
  add column if not exists name text,
  add column if not exists avatar_url text,
  add column if not exists last_message_at timestamptz not null default now(),
  add column if not exists is_archived boolean not null default false;

create index if not exists idx_conv_last on public.conversations(last_message_at desc);

alter table public.conversation_members
  add column if not exists role text not null default 'member' check (role in ('member','admin')),
  add column if not exists nickname text,
  add column if not exists joined_at timestamptz not null default now(),
  add column if not exists last_read_at timestamptz,
  add column if not exists is_muted boolean not null default false,
  add column if not exists left_at timestamptz;

alter table public.messages
  add column if not exists content text,
  add column if not exists media_duration integer,
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists poll_data jsonb default '{}'::jsonb,
  add column if not exists location_lat numeric(9,6),
  add column if not exists location_lng numeric(9,6),
  add column if not exists location_expires_at timestamptz,
  add column if not exists mode text not null default 'standard'
    check (mode in ('standard','vanish','snap')),
  add column if not exists snap_opened_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists is_deleted_for_all boolean not null default false,
  add column if not exists is_pinned boolean not null default false;

update public.messages
set content = coalesce(content, body)
where content is null;

create index if not exists idx_messages_conv on public.messages(conversation_id, created_at desc);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create table if not exists public.message_reads (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

alter table public.message_requests
  add column if not exists from_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists to_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists first_message text,
  add column if not exists status text not null default 'pending' check (status in ('pending','accepted','declined'));

update public.message_requests
set from_user_id = coalesce(from_user_id, requester_id),
    to_user_id = coalesce(to_user_id, target_id),
    first_message = coalesce(first_message, '')
where from_user_id is null or to_user_id is null or first_message is null;

create table if not exists public.screenshot_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.messages(id) on delete set null,
  taken_by uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.pokes (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  poked_back boolean not null default false,
  created_at timestamptz not null default now(),
  poked_back_at timestamptz,
  unique (from_user_id, to_user_id)
);

create table if not exists public.scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'text',
  content text,
  media_url text,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending','sent','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.friend_activity
  add column if not exists actor_id uuid references public.profiles(id) on delete cascade,
  add column if not exists activity_type text check (activity_type in (
    'ticket_purchase','table_booking','drink_package','new_post',
    'badge_unlocked','new_friendship','birthday','going_to_event'
  )),
  add column if not exists reference_id uuid,
  add column if not exists reference_type text,
  add column if not exists reference_label text,
  add column if not exists is_visible boolean not null default true;

update public.friend_activity
set actor_id = coalesce(actor_id, user_id),
    activity_type = coalesce(activity_type, type)
where actor_id is null or activity_type is null;

create index if not exists idx_friendact on public.friend_activity(actor_id, created_at desc);

alter table public.notifications
  add column if not exists category text not null default 'system'
    check (category in ('social','chat','event','ticket','dating','business','system')),
  add column if not exists actor_id uuid references public.profiles(id) on delete set null,
  add column if not exists reference_id uuid,
  add column if not exists reference_type text;

create index if not exists idx_notif_user on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.notification_bundles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bundle_key text not null,
  category text not null,
  reference_id uuid,
  actor_ids uuid[] not null default '{}',
  count integer not null default 1,
  is_read boolean not null default false,
  last_updated timestamptz not null default now(),
  unique (user_id, bundle_key)
);

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text not null,
  category text,
  searched_at timestamptz not null default now()
);

create table if not exists public.trending_hashtags (
  id uuid primary key default gen_random_uuid(),
  hashtag text not null,
  post_count integer not null default 0,
  trend_score numeric(10,4),
  city text,
  calculated_at date not null default current_date
);

alter table public.comment_likes enable row level security;
alter table public.story_poll_votes enable row level security;
alter table public.close_friends enable row level security;
alter table public.message_reactions enable row level security;
alter table public.message_reads enable row level security;
alter table public.screenshot_events enable row level security;
alter table public.pokes enable row level security;
alter table public.scheduled_messages enable row level security;
alter table public.notification_bundles enable row level security;
alter table public.search_history enable row level security;
alter table public.trending_hashtags enable row level security;

create or replace function public.bump_post_likes()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_likes on public.likes;
create trigger trg_likes
after insert or delete on public.likes
for each row execute function public.bump_post_likes();

create or replace function public.bump_post_comments()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_comments_count on public.comments;
create trigger trg_comments_count
after insert or delete on public.comments
for each row execute function public.bump_post_comments();

create or replace function public.create_event_chat_for_event(p_event_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  select id into v_conversation_id
  from public.conversations
  where type = 'event' and event_id = p_event_id
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (type, event_id, name, last_message_at)
    select 'event', e.id, e.title, now()
    from public.events e
    where e.id = p_event_id
    returning id into v_conversation_id;
  end if;

  insert into public.conversation_members (conversation_id, user_id, role)
  select distinct v_conversation_id, t.user_id, 'member'
  from public.tickets t
  where t.event_id = p_event_id
    and t.status in ('valid','used')
  on conflict (conversation_id, user_id) do update set left_at = null;

  return v_conversation_id;
end;
$$;

create or replace function public.expire_social_content()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vanish integer := 0;
  v_scheduled integer := 0;
begin
  update public.messages
  set is_deleted_for_all = true
  where mode = 'vanish'
    and expires_at < now()
    and is_deleted_for_all = false;
  get diagnostics v_vanish = row_count;

  insert into public.messages (conversation_id, sender_id, type, content, media_url, created_at)
  select conversation_id, sender_id, type::public.message_type, content, media_url, now()
  from public.scheduled_messages
  where status = 'pending'
    and scheduled_for <= now();
  get diagnostics v_scheduled = row_count;

  update public.scheduled_messages
  set status = 'sent'
  where status = 'pending'
    and scheduled_for <= now();

  return jsonb_build_object('vanish_deleted', v_vanish, 'scheduled_sent', v_scheduled);
end;
$$;

create policy "comment likes own" on public.comment_likes
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "story poll own vote" on public.story_poll_votes
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "close friends owner" on public.close_friends
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "message reactions members" on public.message_reactions
for all using (
  public.is_admin()
  or exists (
    select 1 from public.messages m
    join public.conversation_members cm on cm.conversation_id = m.conversation_id
    where m.id = message_reactions.message_id and cm.user_id = auth.uid() and cm.left_at is null
  )
) with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.messages m
    join public.conversation_members cm on cm.conversation_id = m.conversation_id
    where m.id = message_reactions.message_id and cm.user_id = auth.uid() and cm.left_at is null
  )
);

create policy "message reads members" on public.message_reads
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "own pokes" on public.pokes
for all using (from_user_id = auth.uid() or to_user_id = auth.uid() or public.is_admin())
with check (from_user_id = auth.uid() or public.is_admin());

create policy "own scheduled messages" on public.scheduled_messages
for all using (sender_id = auth.uid() or public.is_admin()) with check (sender_id = auth.uid() or public.is_admin());

create policy "own notification bundles" on public.notification_bundles
for select using (user_id = auth.uid() or public.is_admin());

create policy "own search history" on public.search_history
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "read trending hashtags" on public.trending_hashtags
for select using (auth.uid() is not null);
