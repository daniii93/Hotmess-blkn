# HOTMESS Database Schema

Die Supabase/PostgreSQL-Struktur ist in `supabase/migrations` in 15 logisch getrennte Migrationen vorbereitet.

## Bereiche

- `001_users.sql`: Nutzer, Profile, Safety-Status und Moderationshistorie.
- `002_venues_events.sql`: Venues und Events.
- `003_gender_balance.sql`: Gender-Balance-Konfiguration und Event-Counter.
- `004_ticketing.sql`: Ticketarten, Reservierungen und QR-Tickets.
- `005_waitlist.sql`: Warteliste und Promotion-Fenster.
- `006_orders_payments.sql`: Orders, Order Items und Split Payments.
- `007_hotels_addons.sql`: Hotels, Add-ons und Event-Zuordnung.
- `008_social_feed.sql`: Follows, Posts, Reactions und Kommentare.
- `009_chat.sql`: Mitglieder-Chat, Teilnehmer, Messages und Direct-Chat-Keys.
- `010_notifications_audit.sql`: In-App Notifications und Audit Logs.
- `011_rls.sql`: Erste Row-Level-Security-Policies.
- `012_storage.sql`: Media Asset Metadata.
- `013_views.sql`: Admin- und Analytics-Views.
- `014_indexes_triggers.sql`: Indizes und `updated_at` Trigger.
- `015_seed.sql`: Minimaler Development Seed.

## Grundsatz

Die bestehende PHP-Seite bleibt livefähig. Diese Migrationen bilden die Zielstruktur fuer Supabase, damit Auth, Ticketing, Payments, Chat, Scanner und Admin spaeter ohne parallele Datenmodelle angebunden werden koennen.
