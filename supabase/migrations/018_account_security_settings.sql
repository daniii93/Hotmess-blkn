-- HotMess account and security settings runtime fields.

create table if not exists public.two_factor_backup_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code_hash text not null,
  used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_two_factor_backup_codes_user
  on public.two_factor_backup_codes(user_id, used, created_at desc);

alter table public.user_sessions
  add column if not exists is_trusted boolean not null default false,
  add column if not exists trusted_at timestamptz;

alter table public.profiles
  add column if not exists qr_color text not null default 'gold'
  check (qr_color in ('gold','ink','champagne'));

alter table public.two_factor_backup_codes enable row level security;

drop policy if exists "own backup codes" on public.two_factor_backup_codes;
create policy "own backup codes" on public.two_factor_backup_codes
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin backup code writes" on public.two_factor_backup_codes;
create policy "admin backup code writes" on public.two_factor_backup_codes
for all
using (public.is_admin())
with check (public.is_admin());
