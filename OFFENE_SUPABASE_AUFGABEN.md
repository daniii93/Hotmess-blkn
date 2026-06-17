# Supabase-Aufgaben

## Erledigt

### Dating / Teil 4
Diese Migrationen wurden am 17.06.2026 per `npm run db:apply` erfolgreich in Supabase eingespielt:

1. `supabase/migrations/004_dating_part4.sql`
2. `supabase/migrations/011_dating_runtime.sql`

Danach lief `npm run db:check` erfolgreich durch.

### Inbox / Chat Runtime
Diese Migrationen wurden am 17.06.2026 per `npm run db:apply` erfolgreich in Supabase eingespielt:

1. `supabase/migrations/015_inbox_notes_runtime.sql`
2. `supabase/migrations/016_inbox_member_actions.sql`

Zusaetzlich wurde am 17.06.2026 `supabase/migrations/010_social_core_runtime.sql` nachgezogen, weil die Live-Datenbank die RPC `create_direct_conversation` noch nicht kannte.

Danach lief der erweiterte `npm run db:check` erfolgreich durch.

### Chat Maximal-Spec Runtime
Diese Punkte sind im Code nativ umgesetzt:

1. Swipe-Gesten in der Inbox: rechts = gelesen/ungelesen, links = archivieren.
2. Echter Typing-Presence-Indikator im Chat-Thread ueber Supabase Realtime Presence.
3. Offline-Queue fuer Chat-Nachrichten ueber IndexedDB, mit Auto-Senden beim Online-Event.

`npm.cmd run typecheck` und `npm.cmd run build` liefen erfolgreich durch.

### Zwei-Account Chat Smoke-Test
Am 17.06.2026 live gegen `https://www.hotmess-blkn.app` erfolgreich getestet:

1. Zwei Kunden-Sessions parallel angemeldet.
2. Direkten Chat angelegt.
3. Normale Nachricht gesendet und beim zweiten Account sichtbar.
4. Typing-Presence-Indikator beim zweiten Account sichtbar.
5. Offline-Nachricht im Browser gequeued und nach Wiederherstellung der Verbindung automatisch gesendet.

## Noch testen

- `/dating`
- `/dating/profile`
- `/dating/matches`
- `/dating/likes`
- `/chat`
- `/chat/new`
- `/chat/requests`
