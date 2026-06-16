-- HotMess Nachrichten: per-user inbox actions.

alter table public.conversation_members
  add column if not exists is_archived boolean not null default false,
  add column if not exists deleted_at timestamptz;

create or replace function public.set_conversation_member_state(
  p_conversation_id uuid,
  p_user_id uuid,
  p_action text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_action = 'mute' then
    update public.conversation_members set is_muted = true where conversation_id = p_conversation_id and user_id = p_user_id;
  elsif p_action = 'unmute' then
    update public.conversation_members set is_muted = false where conversation_id = p_conversation_id and user_id = p_user_id;
  elsif p_action = 'read' then
    update public.conversation_members set unread_count = 0, last_read_at = now() where conversation_id = p_conversation_id and user_id = p_user_id;
  elsif p_action = 'unread' then
    update public.conversation_members set unread_count = greatest(unread_count, 1) where conversation_id = p_conversation_id and user_id = p_user_id;
  elsif p_action = 'archive' then
    update public.conversation_members set is_archived = true where conversation_id = p_conversation_id and user_id = p_user_id;
  elsif p_action = 'unarchive' then
    update public.conversation_members set is_archived = false where conversation_id = p_conversation_id and user_id = p_user_id;
  elsif p_action = 'delete' then
    update public.conversation_members set left_at = now(), deleted_at = now() where conversation_id = p_conversation_id and user_id = p_user_id;
  end if;
end;
$$;
