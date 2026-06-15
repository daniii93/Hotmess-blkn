-- HotMess Teil 3a runtime support for the Next.js app.

alter table public.saved_posts
  add column if not exists saved_at timestamptz not null default now();

alter table public.notifications
  add column if not exists reference_label text;

alter table public.conversations
  add column if not exists last_message_preview text;

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = left(coalesce(new.content, new.body, new.type::text), 160),
      updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_conversation_on_message on public.messages;
create trigger trg_touch_conversation_on_message
after insert on public.messages
for each row execute function public.touch_conversation_on_message();

create or replace function public.create_direct_conversation(p_user_a uuid, p_user_b uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  select cm1.conversation_id into v_conversation_id
  from public.conversation_members cm1
  join public.conversation_members cm2 on cm2.conversation_id = cm1.conversation_id
  join public.conversations c on c.id = cm1.conversation_id
  where c.type = 'direct'
    and cm1.user_id = p_user_a
    and cm2.user_id = p_user_b
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (type, created_by, last_message_at)
    values ('direct', p_user_a, now())
    returning id into v_conversation_id;

    insert into public.conversation_members (conversation_id, user_id)
    values (v_conversation_id, p_user_a), (v_conversation_id, p_user_b)
    on conflict do nothing;
  end if;

  return v_conversation_id;
end;
$$;
