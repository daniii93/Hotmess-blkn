# HOTMESS Chat Privacy & Moderation

Der HOTMESS Mitglieder-Chat folgt einem Plattform-Modell, nicht einem Ende-zu-Ende-verschluesselten WhatsApp-Modell.

## Grundprinzip

- Private Chats sind nur fuer registrierte und freigegebene HOTMESS Mitglieder vorgesehen.
- Erlaubt sind Direktchats zwischen Mitgliedern, Ambassadors, Concierge und freigegebenen Partnerkontakten.
- Es gibt keine oeffentlichen Gruppen, Foren, Stadt-Feeds oder offenen Community-Gruppen.
- Nachrichten werden serverseitig gespeichert, damit sie geraeteuebergreifend verfuegbar sind und ungelesene Chats synchronisiert werden koennen.
- Der Chat ist nicht Ende-zu-Ende verschluesselt. HOTMESS betreibt ihn als moderierbaren Plattform-Chat.
- Aktuelle Live-Aktualisierung laeuft als Polling-Fallback ueber `/api/chat/poll` alle ca. 7 Sekunden. WebSocket oder Supabase Realtime kann spaeter an dieselbe Datenstruktur angeschlossen werden.

## Admin-Zugriff

Admins duerfen private Chats nicht frei durchsuchen.

Admin-Zugriff ist nur vorgesehen, wenn:

- ein Chat gemeldet wurde,
- ein Sicherheitsfall vorliegt,
- ein Supportfall mit Zustimmung des Nutzers vorliegt.

Jeder Zugriff auf gemeldete Inhalte wird in `chat_admin_audit_log` protokolliert. Jede echte Safety-Entscheidung wird zusaetzlich in `user_moderation_actions` gespeichert.

Admin-Aktionen bei Reports:

- Meldung pruefen
- Meldung abweisen
- Fall schliessen
- Nutzer verwarnen
- Chat auf Nur-Lesen setzen
- Nutzer temporaer sperren
- Nutzer dauerhaft sperren
- Sperre aufheben
- Chat fuer weitere Beitraege sperren

## Meldungen

Nutzer koennen einen Chat melden. Gruende:

- Belaestigung
- Beleidigung
- Spam
- Bedrohung
- Fake-Profil
- Unangemessener Inhalt
- Sonstiges

Bei einer Meldung wird ein Report in `chat_reports` erstellt. Die letzten bis zu 10 relevanten Nachrichten werden als Snapshot in `chat_report_messages` gespeichert. Dadurch bleibt die Pruefgrundlage erhalten, auch wenn ein Nutzer spaeter Nachrichten aus seiner Ansicht entfernt.

Snapshots speichern Text, Medien-URL, Absender und Zeitstempel. Es werden keine zusaetzlichen Bilddaten kopiert.

## Account-Safety

Nutzerprofile besitzen technische Safety-Felder:

- `safety_status`: `clear`, `warned`, `restricted`, `suspended`, `banned`
- `chat_status`: `active`, `read_only`, `blocked`, `suspended`
- `suspended_until`
- `warning_count`
- `last_warning_at`
- `banned_at`
- `ban_reason`
- `moderation_notes`

Wirkung:

- Verwarnung erhoeht `warning_count`, setzt `safety_status = warned` und zeigt einen Account-Hinweis.
- Chat-Einschraenkung setzt `chat_status = read_only`; bestehende Chats bleiben lesbar, Schreiben ist blockiert.
- Temporaere Sperre setzt `safety_status = suspended`, `chat_status = suspended` und `suspended_until`.
- Dauerhafte Sperre setzt `safety_status = banned`, `chat_status = blocked` und blockiert geschuetzte Bereiche.
- Sperre aufheben setzt `safety_status = clear`, `chat_status = active` und entfernt aktive Sperrdaten.

## Chat-Durchsetzung

Vor dem Senden einer Nachricht wird geprueft:

- Nutzer ist eingeloggt,
- Nutzer ist Teilnehmer der Unterhaltung,
- Nutzer ist nicht blockiert,
- Nutzer ist nicht `read_only`,
- Nutzer ist nicht temporaer gesperrt,
- Nutzer ist nicht dauerhaft gesperrt.

Wenn Schreiben nicht erlaubt ist, wird keine Nachricht gespeichert und der Nutzer erhaelt einen deutschen Hinweis. Bei eingeschraenktem Chat werden Eingabefeld, Plus-Button, Uploads, Mikrofon und Senden deaktiviert.

## Geschuetzte Bereiche

Dauerhaft gesperrte Nutzer verlieren Zugriff auf geschuetzte Bereiche wie Account-Funktionen, Chat und produktive Aktionen. Oeffentliche Seiten bleiben sichtbar.

Temporaer gesperrte Nutzer koennen sich weiter anmelden und Hinweise sehen, aber geschuetzte Aktionen wie Checkout werden blockiert, solange die Sperre aktiv ist.

## Blockieren

Nutzer koennen andere Mitglieder blockieren. Die Blockierung wird in `chat_blocks` gespeichert.

Wenn ein Nutzer blockiert ist:

- bestehende Chats bleiben sichtbar,
- neue Beitraege werden verhindert,
- der blockierende Nutzer sieht den Hinweis "Du hast dieses Mitglied blockiert.",
- die Blockierung kann wieder aufgehoben werden.

## Loeschen

Das Loeschen eines Chats durch einen Nutzer entfernt den Chat nur aus der eigenen Ansicht. Andere Teilnehmer behalten ihren Verlauf. Gemeldete Snapshots bleiben fuer die Moderationspruefung erhalten.

## Medien

Medien werden nicht direkt in Chat-Tabellen gespeichert. Gespeichert werden nur Metadaten:

- `media_path` / spaeter `media_url`
- `message_type`
- `file_size`
- `mime_type`

Serverseitig gepruefte Dateitypen und Limits:

- Bilder: JPG, JPEG, PNG, WEBP bis 10 MB
- Videos: MP4, MOV bis 100 MB
- Audio: MP3, M4A, WAV, WEBM bis 25 MB
- Datei-Upload bleibt optional vorbereitet und wird erst mit eigener Dateityp-Policy freigeschaltet.

## Sicherheit

Vorbereitet oder umgesetzt:

- nur eingeloggte Mitglieder
- Nutzer sieht nur eigene Chats
- Nutzer sendet nur in eigene Chats
- blockierte Nutzer koennen nicht schreiben
- eingeschraenkte Nutzer koennen lesen, aber nicht schreiben
- temporaer gesperrte Nutzer koennen keine Chat-Beitraege senden
- dauerhaft gesperrte Nutzer verlieren Zugriff auf geschuetzte Bereiche
- Rate Limit und Spam-Schutz sind vorbereitet
- Mediengroessenlimit
- MIME-Type-Pruefung
- CSRF fuer Formular-POSTs
- keine freie Admin-Einsicht
- Admin-Audit fuer Report- und Safety-Aktionen

## Speicherfristen

Empfohlene technische Fristen:

- Normale Chats: 12 bis 24 Monate oder bis Nutzerloeschung
- Geloeschte Chats: nur aus Nutzeransicht entfernen
- Gemeldete Inhalte: 6 bis 12 Monate nach Abschluss der Pruefung
- Audit Logs: mindestens 12 Monate oder laenger, falls rechtlich notwendig
- Moderationshistorie: mindestens 12 Monate oder laenger, falls rechtlich notwendig

## Einspruch und Kontakt

Nutzer sollen bei Verwarnung, Einschraenkung oder Sperre eine klare Kontaktmoeglichkeit erhalten. Der aktuelle Account-Hinweis verweist auf den HOTMESS Kontaktbereich. Spaeter kann daraus ein eigenes Einspruchsformular entstehen.

## Spaetere DSGVO-Funktionen

Vorbereiten fuer:

- Datenexport pro Nutzer
- Accountloeschung mit Chat-Anonymisierung
- Loeschanfragen
- transparente Datenschutzhinweise im Account und im Chat
- Moderationshistorie pro Nutzer und Report
- Einspruchsworkflow
