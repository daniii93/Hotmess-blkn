# Abschnitt 8/10: Community, Feed, Profile, Social Graph und Chat

## Umgesetzt

- Feed-System mit Posttypen `text`, `image`, `event`, `announcement`.
- MVP-Feed-Reihenfolge: Neueste zuerst.
- Phase-2 Ranking Signals als `smartFeed: future`.
- Text-, Bild- und Event-Post-Drafts.
- Automatische Event-Posts fuer Published, Sold Out und Cancelled vorbereitet.
- Like-MVP und einstufige Kommentare.
- Community Reports fuer Spam, Belaestigung, Fake Profil und unangemessene Inhalte.
- Follow-System mit `pending`, `accepted`, `rejected`.
- Private Profile mit Follow Request.
- Profile mit Avatar, Cover, Name, Stadt, Land, Bio, Attendance-Privacy und Verification Badge.
- Social Graph Helper fuer Follower, Following, gemeinsame Freunde und gemeinsame Events.
- Freundesaktivitaeten fuer Follow, Event-Teilnahme und Ticketkauf.
- Event-Teilnehmerlisten mit Sichtbarkeit, Followern und gemeinsamen Freunden.
- Profil-Analytics fuer Follower, Following, Events besucht und Posts.
- Event-Chat mit Ticketpflicht.
- Automatische Event-Chat-Erstellung bei Event-Veröffentlichung.
- Automatische Chat-Mitgliedschaft bei gueltigem Ticket.
- Chat-Zugriffsentzug bei `cancelled` oder `expired`.
- Completed Events setzen Event-Chats auf read-only.
- Event-Chat-Reaktionen: Like, Heart, Fire, Party.
- Event-Chat-Umfragen mit mindestens zwei Optionen.
- Community KPI Snapshot fuer DAU, MAU, Posts, Kommentare, Likes, Chat Messages und neue Follows.
- Storage Buckets fuer `posts`, `chat-media`, `avatars`, `covers`.
- RLS Policies fuer Event-Chats, Polls, Reaktionen und Community Reports.
- Realtime Channel Config in `src/features/social/realtime.ts`.
- Supabase Realtime Publication fuer Chat, Likes, Kommentare, Follows und Notifications vorbereitet.
- Feed Notifications und Push-Entscheidung fuer Like, Kommentar, Follow, Follow Request, Chat und Event Update.

## Bewusst vorbereitet

- Smart Feed
- Message Requests
- Stories
- Pokes
- Music Stickers
- Auto Translation
- Live Location

Diese Funktionen bleiben Feature-Flag-gesteuert und sind nicht automatisch live.

## Realtime Vorbereitung

Realtime soll spaeter fuer folgende Tabellen/Streams aktiviert werden:

- Chat Messages
- Chat Reactions
- Chat Polls
- Post Reactions
- Post Comments
- Follows
- Notifications

## Moderation

Admin-Moderation ist vorbereitet fuer:

- Post loeschen
- Kommentar loeschen
- Profil sperren
- Follow entfernen
- Chat-Nachricht loeschen

Jede Moderationsaktion muss ueber Audit geloggt werden.

## Produktiv offen

- Supabase Realtime in Staging aktiv pruefen.
- Storage Uploads fuer Posts und Covers an echte UI anbinden.
- Push/E-Mail fuer Follow, Kommentar, Chat und Event Update ausloesen.
- Feed UI auf zentrale Feed-Queries umstellen.
