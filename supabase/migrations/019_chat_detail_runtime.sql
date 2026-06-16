-- HotMess chat detailed functionality runtime fields.

alter table public.messages
  add column if not exists edited boolean not null default false,
  add column if not exists edited_at timestamptz,
  add column if not exists edit_history jsonb,
  add column if not exists transcript text;

create table if not exists public.note_likes (
  note_user_id uuid references public.profiles(id) on delete cascade,
  liker_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_user_id, liker_id)
);

create table if not exists public.note_replies (
  id uuid primary key default gen_random_uuid(),
  note_user_id uuid references public.profiles(id) on delete cascade,
  replier_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  conversation_id uuid references public.conversations(id),
  created_at timestamptz not null default now()
);

create table if not exists public.muted_words (
  user_id uuid references public.profiles(id) on delete cascade,
  word text not null,
  primary key (user_id, word)
);

alter table public.conversation_members
  add column if not exists is_spam boolean not null default false;

alter table public.profiles
  add column if not exists who_can_message text not null default 'everyone'
    check (who_can_message in ('everyone','followers','off')),
  add column if not exists who_can_add_to_groups text not null default 'followers'
    check (who_can_add_to_groups in ('everyone','followers'));

alter table public.note_likes enable row level security;
alter table public.note_replies enable row level security;
alter table public.muted_words enable row level security;

drop policy if exists "own note likes visible" on public.note_likes;
create policy "own note likes visible" on public.note_likes
for select using (note_user_id = auth.uid() or liker_id = auth.uid() or public.is_admin());

drop policy if exists "like visible notes" on public.note_likes;
create policy "like visible notes" on public.note_likes
for insert with check (liker_id = auth.uid());

drop policy if exists "own note replies visible" on public.note_replies;
create policy "own note replies visible" on public.note_replies
for select using (note_user_id = auth.uid() or replier_id = auth.uid() or public.is_admin());

drop policy if exists "reply visible notes" on public.note_replies;
create policy "reply visible notes" on public.note_replies
for insert with check (replier_id = auth.uid());

drop policy if exists "own muted words" on public.muted_words;
create policy "own muted words" on public.muted_words
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
