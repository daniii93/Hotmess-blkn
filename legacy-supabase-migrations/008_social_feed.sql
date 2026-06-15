-- Community feed, follows and social graph
create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'accepted' check (status in ('requested', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  content text,
  media jsonb not null default '[]'::jsonb,
  visibility text not null default 'members' check (visibility in ('members', 'followers', 'event_attendees', 'private')),
  status text not null default 'published' check (status in ('draft', 'published', 'hidden', 'reported', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  status text not null default 'published' check (status in ('published', 'hidden', 'reported', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
