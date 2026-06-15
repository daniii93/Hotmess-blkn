# Abschnitt 4/10: Datenbank, Supabase Schema, RLS und Datenmodelle

Dieser Abschnitt ist umgesetzt als additive Supabase-Zielarchitektur in `supabase/migrations`.

## Umgesetzt

- 15 Migrationen fuer Nutzer, Events, Ticketing, Waitlist, Orders, Hotels, Add-ons, Feed, Chat, Notifications, Audit, Storage, Views und Indizes.
- RLS-Grundregeln fuer oeffentliche Events, eigene Nutzer-, Ticket-, Order-, Chat- und Notification-Daten.
- Dokumentation unter `docs/database`.

## Noch nicht produktiv

- Migrationen sind vorbereitet, aber nicht gegen eine Live-Supabase-Instanz ausgefuehrt.
- Realtime, Storage Buckets und Edge Functions brauchen echte Supabase-Konfiguration.
