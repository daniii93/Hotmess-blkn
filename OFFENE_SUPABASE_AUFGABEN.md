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

Danach lief der erweiterte `npm run db:check` erfolgreich durch.

### Chat Maximal-Spec Runtime
Diese Punkte sind im Code nativ umgesetzt:

1. Swipe-Gesten in der Inbox: rechts = gelesen/ungelesen, links = archivieren.
2. Echter Typing-Presence-Indikator im Chat-Thread ueber Supabase Realtime Presence.
3. Offline-Queue fuer Chat-Nachrichten ueber IndexedDB, mit Auto-Senden beim Online-Event.

`npm.cmd run typecheck` und `npm.cmd run build` liefen erfolgreich durch.

## Noch testen

- `/dating`
- `/dating/profile`
- `/dating/matches`
- `/dating/likes`
- `/chat`
- `/chat/new`
- `/chat/requests`
- Chat auf zwei Geraeten parallel: Typing-Indikator live sichtbar.
- Offline-Nachricht schreiben, Verbindung wiederherstellen, Auto-Senden pruefen.
