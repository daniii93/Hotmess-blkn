-- Indexes and timestamp triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists idx_events_city_start on public.events(city, start_at);
create index if not exists idx_events_status_start on public.events(status, start_at);
create index if not exists idx_ticket_types_event on public.ticket_types(event_id);
create index if not exists idx_tickets_user_event on public.tickets(user_id, event_id);
create index if not exists idx_waitlist_event_status on public.waitlist_entries(event_id, status, priority);
create index if not exists idx_chat_participants_user on public.chat_participants(user_id, pinned, unread_count);
create index if not exists idx_chat_messages_chat_created on public.chat_messages(chat_id, created_at);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read_at);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at before update on public.events
for each row execute function public.set_updated_at();
