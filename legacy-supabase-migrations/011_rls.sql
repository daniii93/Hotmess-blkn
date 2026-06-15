-- RLS foundations. Policies stay intentionally strict for future Supabase use.
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_moderation_actions enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.event_gender_balance_configs enable row level security;
alter table public.event_gender_counters enable row level security;
alter table public.ticket_types enable row level security;
alter table public.ticket_reservations enable row level security;
alter table public.tickets enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.split_payments enable row level security;
alter table public.hotels enable row level security;
alter table public.addons enable row level security;
alter table public.event_addons enable row level security;
alter table public.follows enable row level security;
alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.post_comments enable row level security;
alter table public.scanner_event_assignments enable row level security;
alter table public.media_assets enable row level security;
alter table public.direct_chat_keys enable row level security;

create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() ->> 'user_role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'user'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_role() = 'admin';
$$;

create or replace function public.is_scanner()
returns boolean
language sql
stable
as $$
  select public.jwt_role() in ('scanner', 'admin');
$$;

create policy "Public can read published events"
on public.events for select
using (status in ('published', 'sold_out', 'completed'));

create policy "Public can read ticket types for published events"
on public.ticket_types for select
using (
  exists (
    select 1 from public.events e
    where e.id = ticket_types.event_id
      and e.status in ('published', 'sold_out', 'completed')
  )
);

create policy "Users can read own profile"
on public.users for select
using (auth.uid() = id or public.is_admin());

create policy "Users can update own user identity fields"
on public.users for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = 'user'
  and safety_status <> 'banned'
);

create policy "Admins can update users"
on public.users for update
using (public.is_admin())
with check (public.is_admin());

create policy "Users can update limited own profile"
on public.user_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can read user profiles"
on public.user_profiles for select
using (public.is_admin() or auth.uid() = user_id);

create policy "Users can read own tickets"
on public.tickets for select
using (
  auth.uid() = user_id
  or public.is_admin()
  or (
    public.is_scanner()
    and exists (
      select 1 from public.scanner_event_assignments sea
      where sea.event_id = tickets.event_id
        and sea.scanner_user_id = auth.uid()
        and sea.active = true
    )
  )
);

create policy "Users can read own orders"
on public.orders for select
using (auth.uid() = user_id or public.is_admin());

create policy "Users can read app posts"
on public.posts for select
using (auth.uid() is not null and status = 'published');

create policy "Users can create own posts"
on public.posts for insert
with check (auth.uid() = author_id and status in ('draft', 'published'));

create policy "Users can delete own posts"
on public.posts for update
using (auth.uid() = author_id or public.is_admin())
with check (auth.uid() = author_id or public.is_admin());

create policy "Users can manage own comments"
on public.post_comments for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "Chat participants can read participant rows"
on public.chat_participants for select
using (auth.uid() = user_id);

create policy "Chat participants can read messages"
on public.chat_messages for select
using (
  exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = chat_messages.chat_id
      and cp.user_id = auth.uid()
      and cp.deleted_for_user = false
  )
);

create policy "Chat participants can insert messages"
on public.chat_messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = chat_messages.chat_id
      and cp.user_id = auth.uid()
      and cp.blocked = false
      and cp.deleted_for_user = false
  )
);

create policy "Users can read own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "Admins can read scanner assignments"
on public.scanner_event_assignments for select
using (public.is_admin() or scanner_user_id = auth.uid());

create policy "Admins can manage scanner assignments"
on public.scanner_event_assignments for all
using (public.is_admin())
with check (public.is_admin());
