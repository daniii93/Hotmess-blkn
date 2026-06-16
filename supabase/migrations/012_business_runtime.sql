-- HotMess Teil 5: Business runtime hardening.
-- Supports profile upsert, mutual connections, job applications and chat reuse.

alter table public.business_profiles
  alter column headline drop not null,
  alter column industry drop not null,
  alter column looking_for_tags set default '{}',
  alter column offering_tags set default '{}';

create unique index if not exists idx_business_swipes_pair
  on public.business_swipes(swiper_id, swiped_id);

create unique index if not exists idx_business_matches_pair
  on public.business_matches(least(user_a_id, user_b_id), greatest(user_a_id, user_b_id))
  where user_a_id is not null and user_b_id is not null;

create unique index if not exists idx_business_matches_user_a_b
  on public.business_matches(user_a_id, user_b_id)
  where user_a_id is not null and user_b_id is not null;

create unique index if not exists idx_job_applications_once
  on public.job_applications(job_id, applicant_id);

create index if not exists idx_business_profiles_active
  on public.business_profiles(is_active, tier, updated_at desc);

create index if not exists idx_business_jobs_search
  on public.job_listings(status, category, city, created_at desc);

create or replace function public.business_match_reason(p_user_a uuid, p_user_b uuid)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  v_reason text;
begin
  select coalesce(
    nullif(array_to_string(array(
      select distinct tag
      from (
        select unnest(coalesce(a.looking_for_tags, '{}')) as tag
        intersect
        select unnest(coalesce(b.offering_tags, '{}')) as tag
        union
        select unnest(coalesce(b.looking_for_tags, '{}')) as tag
        intersect
        select unnest(coalesce(a.offering_tags, '{}')) as tag
      ) x
      where tag is not null and tag <> ''
      limit 3
    ), ', '), ''),
    'Beidseitiges Business-Interesse'
  )
  into v_reason
  from public.business_profiles a
  join public.business_profiles b on b.user_id = p_user_b
  where a.user_id = p_user_a;

  return v_reason;
end;
$$;
