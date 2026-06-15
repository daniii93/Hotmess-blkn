# HOTMESS Phase 1 Implementation Map

Stand: 2026-06-12

Diese Datei uebersetzt die neue HOTMESS Tech-Spezifikation auf den aktuellen PHP/Hostinger-Codebestand. Die Spezifikation beschreibt langfristig einen Next.js/Supabase-Zielzustand. Die Live-Webseite bleibt aktuell PHP-basiert und wird schrittweise kompatibel vorbereitet, damit keine bestehenden Funktionen verloren gehen.

## Zielbild

HOTMESS ist eine Event- und Mitgliederplattform fuer die Balkan-Community in DACH und Italien. Phase 1 fokussiert:

- eigene Registrierung und E-Mail-Verifizierung
- Landing Page als dauerhafter oeffentlicher Einstieg
- Events, Tickets, Gender-Balance-Waitlist und QR-Check-in
- Add-ons wie Tables, Drinks, Birthday, Fast Lane und Hotelcodes
- Mitglieder-Feed, Freundesaktivitaet, Chat und Benachrichtigungen
- Admin Dashboard, Scanner, Umsatz, CRM, Medien und E-Mail-Infrastruktur

Nicht Teil von Phase 1:

- Dating
- Business-Networking
- Stories
- MLM-Mechaniken

## Aktueller produktiver Stack

- PHP 8+ auf Hostinger
- MySQL/MariaDB
- eigene Session-Auth
- Stripe vorbereitet
- Resend vorbereitet
- Cloudflare R2 vorbereitet, lokaler Upload als Fallback
- QR-/Check-in-Struktur vorhanden
- serverseitig gespeicherter, moderierbarer Mitglieder-Chat vorhanden

## Langfristiger Zielstack aus Spezifikation

- Next.js 15 mit App Router
- TypeScript strict
- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- Zustand
- TanStack Query
- next-intl
- Supabase Auth, Database, Realtime, Storage
- Stripe und PayPal
- Resend
- OneSignal
- qrcode und html5-qrcode
- Vercel
- Zod

Dieser Zielstack ist dokumentiert, wird aber nicht parallel in dieses PHP-Projekt hineingebaut. Fuer die spaetere Migration sollen die Datenmodelle und Routen kompatibel bleiben.

## Phase-1-Kompatibilitaet im PHP-Projekt

### Auth und Profile

Aktiv:

- eigene Registrierung
- E-Mail oder Benutzername + Passwort Login
- keine Social Logins
- E-Mail-Verifizierung vorbereitet
- Onboarding vorbereitet
- Landing Page bleibt oeffentlich

Ergaenzt:

- `username`
- `avatar_url`
- `bio`
- `email_verified`
- `gender`
- `verification_status`
- `is_private`
- `is_active`
- Privacy-Felder fuer Follower, Following und Event-Anzahl

### Mitglieder-App

Aktiv oder vorbereitet:

- `/feed`
- `/friends`
- `/notifications`
- `/chat`
- `/chat/{id}`
- `/profile`
- `/u/{username}`
- `/settings`

### Events, Tickets und Scanner

Aktiv oder vorbereitet:

- `/events`
- `/events/{slug}`
- `/events/{slug}/preview`
- `/events/{slug}/checkout`
- `/events/{slug}/waitlist`
- `/tickets`
- `/scanner`
- `/checkin/scanner`
- `/admin/checkin`

Vorbereitete Phase-1-Daten:

- Gender-Balance-Konfiguration je Event
- Waitlist je Event
- Discount Codes
- Table Bookings
- Drink Packages
- Birthday Packages
- Hotel Codes
- Scanner Access

### Social Graph und Feed

Vorbereitet:

- Follows
- Follow Requests
- Posts
- Likes
- Comments
- Friend Activity
- Notification Settings

### Medien, E-Mail, CRM und Revenue

Bereits vorbereitet:

- Medienverwaltung mit R2-Zielsystem und lokalem Fallback
- E-Mail-Service mit Resend-Zielsystem und Mock-/Log-Modus
- CRM, Leads, Pipeline, Tasks
- Revenue Dashboard
- Payment-, Ticket- und Membership-Infrastruktur

## Neue technische Schicht

Die Datei `app/phase1.php` erzeugt eine kompatible MySQL-Struktur mit `hotmess_phase1_*` Tabellen. Diese Tabellen vermeiden Kollisionen mit bestehenden Modulen und koennen spaeter sauber in Supabase-Tabellen ueberfuehrt werden.

Wichtige Tabellen:

- `hotmess_phase1_venues`
- `hotmess_phase1_event_gender_config`
- `hotmess_phase1_waitlist`
- `hotmess_phase1_discount_codes`
- `hotmess_phase1_event_tables`
- `hotmess_phase1_table_bookings`
- `hotmess_phase1_drink_packages`
- `hotmess_phase1_birthday_packages`
- `hotmess_phase1_hotel_codes`
- `hotmess_phase1_follows`
- `hotmess_phase1_follow_requests`
- `hotmess_phase1_posts`
- `hotmess_phase1_likes`
- `hotmess_phase1_comments`
- `hotmess_phase1_friend_activity`
- `hotmess_phase1_notifications`
- `hotmess_phase1_notification_settings`
- `hotmess_phase1_scanner_access`

## Routenabgleich

Neu oder verbunden:

- `/friends`
- `/notifications`
- `/settings`
- `/scanner`
- `/u/{username}`
- `/events/{slug}/preview`
- `/events/{slug}/checkout`
- `/events/{slug}/waitlist`

## Offene Migrationspunkte

- Supabase Auth noch nicht produktiv aktiv, weil eigene Konten aktuell genutzt werden.
- Realtime Chat laeuft aktuell ueber bestehende Poll-/Serverlogik, nicht ueber Supabase Realtime.
- PayPal ist in der Spezifikation enthalten, aktuell aber noch nicht produktiv angebunden.
- OneSignal ist als Ziel fuer Push Notifications sinnvoll, aber noch nicht produktiv aktiv.
- Next.js/Tailwind/shadcn ist Zielarchitektur fuer einen spaeteren Neuaufbau, nicht Bestandteil der aktuellen PHP-Live-Seite.

## Naechster sinnvoller technischer Schritt

Die Phase-1-Tabellen sollten als naechstes in Admin-Oberflaechen sichtbar gemacht werden:

1. Event Gender Balance im Admin bearbeiten.
2. Event Waitlist im Admin verwalten.
3. Hotel Codes und Add-ons an Events binden.
4. Friend Activity aus echten Ticket-, Follow- und Check-in-Aktionen erzeugen.
5. Notifications aus Chat, Ticket, Waitlist und Check-in Workflows automatisch schreiben.

