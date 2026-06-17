-- HotMess Nachrichten runtime: Instagram-style inbox notes and unread counters.

create table if not exists public.user_notes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  text text not null check (char_length(text) <= 60),
  audience text not null default 'friends' check (audience in ('friends','close_friends')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

alter table public.user_notes
  add column if not exists expires_at timestamptz;

update public.user_notes
set expires_at = created_at + interval '24 hours'
where expires_at is null;

alter table public.user_notes
  alter column expires_at set not null,
  alter column expires_at set default (now() + interval '24 hours');

alter table public.user_notes enable row level security;

drop policy if exists "manage own note" on public.user_notes;
create policy "manage own note" on public.user_notes
for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "read friends notes" on public.user_notes;
create policy "read friends notes" on public.user_notes
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.follows f1
    join public.follows f2 on f2.follower_id = user_notes.user_id and f2.following_id = auth.uid()
    where f1.follower_id = auth.uid()
      and f1.following_id = user_notes.user_id
  )
  or public.is_admin()
);

create or replace function public.increment_unread_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversation_members
  set unread_count = unread_count + 1
  where conversation_id = new.conversation_id
    and user_id <> new.sender_id
    and left_at is null;

  update public.conversation_members
  set last_read_at = new.created_at,
      unread_count = 0
  where conversation_id = new.conversation_id
    and user_id = new.sender_id;

  return new;
end;
$$;

drop trigger if exists trg_increment_unread_on_message on public.messages;
create trigger trg_increment_unread_on_message
after insert on public.messages
for each row execute function public.increment_unread_on_message();

create or replace function public.mark_conversation_read(p_conversation_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversation_members
  set unread_count = 0,
      last_read_at = now()
  where conversation_id = p_conversation_id
    and user_id = p_user_id
    and left_at is null;
end;
$$;
