-- HotMess Teil 4: Dating runtime hardening.
-- Makes the in-app Dating MVP robust for profile upsert, swipes and matches.

alter table public.dating_profiles
  alter column display_name drop not null,
  alter column photos set default '{}',
  alter column looking_for set default array['everyone'];

create unique index if not exists idx_dating_swipes_pair
  on public.dating_swipes(swiper_id, swiped_id);

create unique index if not exists idx_dating_matches_pair
  on public.dating_matches(least(user_a_id, user_b_id), greatest(user_a_id, user_b_id))
  where user_a_id is not null and user_b_id is not null;

create unique index if not exists idx_dating_matches_user_a_b
  on public.dating_matches(user_a_id, user_b_id)
  where user_a_id is not null and user_b_id is not null;

create index if not exists idx_dating_profiles_active
  on public.dating_profiles(is_active, tier, updated_at desc);

create index if not exists idx_event_dating_pool_user
  on public.event_dating_pool(user_id, event_id);

create or replace function public.create_or_get_direct_conversation(p_user_a uuid, p_user_b uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  select cm1.conversation_id
    into v_conversation_id
  from public.conversation_members cm1
  join public.conversation_members cm2
    on cm2.conversation_id = cm1.conversation_id
  join public.conversations c
    on c.id = cm1.conversation_id
  where c.type = 'direct'
    and cm1.user_id = p_user_a
    and cm2.user_id = p_user_b
    and cm1.left_at is null
    and cm2.left_at is null
  limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  insert into public.conversations(type, created_by, last_message_at)
  values ('direct', p_user_a, now())
  returning id into v_conversation_id;

  insert into public.conversation_members(conversation_id, user_id, role)
  values
    (v_conversation_id, p_user_a, 'member'),
    (v_conversation_id, p_user_b, 'member')
  on conflict do nothing;

  return v_conversation_id;
end;
$$;
