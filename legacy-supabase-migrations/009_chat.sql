-- Moderierbarer HOTMESS Mitglieder-Chat
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'direct' check (type in ('direct', 'concierge', 'partner')),
  created_by uuid references public.users(id) on delete set null,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_participants (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member',
  unread_count integer not null default 0,
  last_read_at timestamptz,
  pinned boolean not null default false,
  muted boolean not null default false,
  deleted_for_user boolean not null default false,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chat_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete set null,
  content text,
  media_url text,
  media_type text not null default 'text' check (media_type in ('text', 'image', 'video', 'audio', 'file', 'system')),
  file_size integer,
  mime_type text,
  status text not null default 'sent' check (status in ('sent', 'delivered', 'seen')),
  is_read boolean not null default false,
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by_sender boolean not null default false,
  system_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.direct_chat_keys (
  chat_id uuid primary key references public.chats(id) on delete cascade,
  user_a uuid not null references public.users(id) on delete cascade,
  user_b uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);
