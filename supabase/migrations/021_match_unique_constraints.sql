-- Ensure API upserts for Dating and Business matches have a matching conflict target.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dating_matches_user_a_id_user_b_id_key'
      and conrelid = 'public.dating_matches'::regclass
  ) then
    alter table public.dating_matches
      add constraint dating_matches_user_a_id_user_b_id_key unique (user_a_id, user_b_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'business_matches_user_a_id_user_b_id_key'
      and conrelid = 'public.business_matches'::regclass
  ) then
    alter table public.business_matches
      add constraint business_matches_user_a_id_user_b_id_key unique (user_a_id, user_b_id);
  end if;
end $$;
