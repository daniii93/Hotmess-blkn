# HOTMESS Storage und Medienverwaltung

## Ziel

HOTMESS nutzt eine zentrale Medienstruktur fuer Chat-Medien, Galerie, Events, Hotels, Packages, Partnerlogos, Audio, Videos und Aftermovies.

Cloudflare R2 ist das Zielsystem. Solange R2 nicht konfiguriert ist, bleiben lokale Uploads als Fallback aktiv.

## Provider

### Cloudflare R2

Benötigte ENV Variablen:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

Keine dieser Variablen darf in Git committet oder im Admin sichtbar ausgegeben werden.

Empfohlener Bucket:

- `hotmess-media`

Empfohlene Struktur:

- `chat-media/images/YYYY/MM`
- `chat-media/videos/YYYY/MM`
- `chat-media/audio/YYYY/MM`
- `gallery/images/YYYY/MM`
- `gallery/videos/YYYY/MM`
- `events/YYYY/MM`
- `hotels/YYYY/MM`
- `packages/YYYY/MM`
- `partners/logos/YYYY/MM`

### Lokaler Fallback

Wenn R2 ENV fehlt, speichert HOTMESS lokal unter:

- `uploads/...`

Der lokale Upload bleibt aktiv, damit Chat, Gallery und Admin-Uploads nicht abbrechen.

## Upload-Kategorien

| Kategorie | Typen | Limit |
| --- | --- | --- |
| `chat_image` | jpg, jpeg, png, webp | 10 MB |
| `chat_video` | mp4, mov | 100 MB |
| `chat_audio` | mp3, m4a, wav, webm | 25 MB |
| `gallery_image` | jpg, jpeg, png, webp | 20 MB |
| `gallery_video` | mp4, mov | 500 MB |
| `event_image` | jpg, jpeg, png, webp | 20 MB |
| `hotel_image` | jpg, jpeg, png, webp | 20 MB |
| `package_image` | jpg, jpeg, png, webp | 20 MB |
| `partner_logo` | svg, png, webp | 5 MB |
| `audio_message` | mp3, m4a, wav, webm | 25 MB |

SVG ist nur fuer Partnerlogos freigegeben. Ausfuehrbare Dateitypen sind nicht erlaubt.

## Datenmodell

Tabelle:

- `media_assets`

Wichtige Felder:

- `storage_provider`
- `bucket`
- `folder`
- `path`
- `public_url`
- `media_type`
- `mime_type`
- `file_size`
- `width`
- `height`
- `duration`
- `thumbnail_url`
- `uploaded_by`
- `related_module`
- `related_id`
- `status`
- `created_at`
- `updated_at`

Statuswerte:

- `active`
- `processing`
- `failed`
- `archived`
- `deleted`

## Admin Media Library

Route:

- `/admin/media`

Funktionen:

- Upload nach Kategorie
- Filter nach Modul
- Filter nach Typ
- Filter nach Status
- Vorschau
- oeffentliche URL
- Dateigroesse
- Upload-Datum
- Archivieren
- Loeschen vorbereiten

Endgueltiges Loeschen wird aktuell als Status `deleted` markiert. Physisches Entfernen aus R2 oder lokalen Dateien sollte spaeter nur mit separater Bestaetigung und Audit Log erfolgen.

## Chat Medien

Chat-Uploads laufen ueber `uploadMedia()`.

Beim Upload:

1. MIME-Type pruefen
2. Extension pruefen
3. Groesse pruefen
4. sicherer Dateiname erzeugen
5. R2 oder lokaler Fallback speichern
6. `media_assets` Eintrag erzeugen
7. Chat Message mit `media_path`, `message_type`, `file_size`, `mime_type` speichern

Chat Uploads sind nur fuer eingeloggte Nutzer vorgesehen. Nutzer duerfen nur in eigenen Chats schreiben.

## Galerie Medien

Gallery-Bilder und Gallery-Videos koennen ueber `/admin/media` oder das Upload-Panel in `/admin/gallery` gespeichert werden. Zuordnung erfolgt ueber `related_module = gallery` und optional `related_id`.

## Event, Hotel, Package und Partner Medien

Admin-Module haben eigene Upload-Panels:

- `/admin/events`
- `/admin/hotels`
- `/admin/packages`
- `/admin/partners`
- `/admin/gallery`

Alle Panels nutzen dieselbe Storage-Schicht.

## Sicherheitsregeln

- Dateitypen serverseitig validieren
- MIME-Type und Extension muessen passen
- Dateigroesse serverseitig pruefen
- keine ausfuehrbaren Dateien erlauben
- keine Original-Dateinamen verwenden
- Dateinamen kryptografisch zufaellig generieren
- Admin-Uploads nur fuer Admins
- Chat-Uploads nur fuer eingeloggte Mitglieder in eigenen Chats
- keine Secrets im Frontend oder Admin anzeigen
- `uploads/` bleibt in `.gitignore`

## Backup Hinweise

Lokale Uploads muessen regelmaessig gesichert werden, solange R2 nicht aktiv ist.

Bei R2:

- Bucket Lifecycle Regeln pruefen
- optional Versioning aktivieren
- regelmaessige Export-/Backup-Strategie definieren

## Kostenhinweise

Cloudflare R2 verursacht Kosten nach Speicher, Operationen und ggf. Auslieferungsmodell. Vor Live-Aktivierung:

- erwartetes Medienvolumen schaetzen
- Video-Uploads limitieren
- Aftermovies ggf. ueber Vimeo/YouTube/Cloudflare Stream ausliefern
- grosse Dateien nicht unkontrolliert im Chat erlauben

## Troubleshooting

Wenn Uploads lokal statt in R2 landen:

1. `/admin/system` pruefen
2. fehlende R2 ENV Werte setzen
3. `R2_PUBLIC_BASE_URL` pruefen
4. Bucket-Permissions und Custom Domain pruefen

Wenn Uploads abgelehnt werden:

1. Kategorie pruefen
2. Dateiendung pruefen
3. MIME-Type pruefen
4. Dateigroesse pruefen

Wenn Vorschauen nicht laden:

1. `public_url` pruefen
2. lokale Datei unter `uploads/` pruefen
3. R2 Public Base URL pruefen
