# HOTMESS Member Safety

Diese Datei dokumentiert die produktive Safety-Struktur fuer HOTMESS Mitgliederkonten.

## Safety-Status

`safety_status`

- `clear`: Konto ist aktiv.
- `warned`: Konto wurde verwarnt.
- `restricted`: Konto ist eingeschraenkt.
- `suspended`: Konto ist temporaer gesperrt.
- `banned`: Konto ist dauerhaft gesperrt.

`chat_status`

- `active`: Chat ist aktiv.
- `read_only`: Nutzer kann Chats lesen, aber nicht schreiben.
- `suspended`: Chat ist temporaer gesperrt.
- `blocked`: Chat ist dauerhaft blockiert.

## Moderationsaktionen

Verwarnen:

- erhoeht `warning_count`
- setzt `safety_status = warned`
- setzt `last_warning_at`
- erstellt eine Nutzerbenachrichtigung
- schreibt `user_moderation_actions`

Chat einschraenken:

- setzt `safety_status = restricted`
- setzt `chat_status = read_only`
- deaktiviert Chat-Eingabe, Upload, Mikrofon und Senden
- erstellt eine Nutzerbenachrichtigung
- schreibt `user_moderation_actions`

Temporaer sperren:

- setzt `safety_status = suspended`
- setzt `chat_status = suspended`
- setzt `suspended_until`
- blockiert Chat-Schreiben und geschuetzte produktive Aktionen
- erstellt eine Nutzerbenachrichtigung
- schreibt `user_moderation_actions`

Dauerhaft sperren:

- setzt `safety_status = banned`
- setzt `chat_status = blocked`
- setzt `banned_at`
- speichert `ban_reason`
- blockiert Chat, Account-Funktionen und geschuetzte Bereiche
- oeffentliche Seiten bleiben sichtbar
- erstellt eine Nutzerbenachrichtigung
- schreibt `user_moderation_actions`

Sperre aufheben:

- setzt `safety_status = clear`
- setzt `chat_status = active`
- entfernt aktive Sperrdaten
- erstellt eine Nutzerbenachrichtigung
- schreibt `user_moderation_actions`

## Admin-Bereiche

- `/admin/users`: direkte Nutzer-Safety-Verwaltung.
- `/admin/chat/reports`: Safety-Aktionen aus gemeldeten Chats.
- `/admin/chat/audit-log`: Audit-Einsicht fuer Chat-Moderation.

## Nutzerhinweise

Hinweise erscheinen im Account und im Chat:

- Verwarnung: Hinweis auf HOTMESS Regeln.
- Chat eingeschraenkt: Nutzer kann lesen, aber nicht schreiben.
- Temporaere Sperre: Hinweis mit Ablaufdatum.
- Dauerhafte Sperre: Kontakt-Hinweis an HOTMESS Team.

## Audit und Nachvollziehbarkeit

Jede Safety-Aktion speichert:

- Zielnutzer
- Admin
- optionalen Report
- Aktion
- Grund
- vorherigen Status
- neuen Status
- Ablaufdatum, falls vorhanden
- Zeitpunkt

Diese Daten liegen in `user_moderation_actions`. Chat-Report-Zugriffe und Report-Statusaenderungen liegen weiterhin in `chat_admin_audit_log`.

## Datenschutz

Moderation sperrt Zugriff, loescht aber keine Nutzer physisch. Dadurch bleiben Reports, Abrechnungen, Tickets und Audit-Daten nachvollziehbar. Accountloeschung, Datenexport und Anonymisierung koennen spaeter auf dieser Struktur aufbauen.
