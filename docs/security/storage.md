# HOTMESS Storage Security

Medien muessen vor Speicherung validiert werden:

- Dateigroesse
- MIME-Type
- erlaubte Endung
- Modulberechtigung
- Nutzerberechtigung

Uploads werden in `media_assets` protokolliert. Loeschen wird bevorzugt als Archivierung modelliert.

## Buckets

- `avatars`: oeffentlich lesbar, Upload nur in eigenen Nutzerordner.
- `verification`: privat, lesbar fuer Admin/Verification-System.
- `event-covers`: oeffentlich lesbar, Upload nur Admin.
- `chat-media`: nur fuer Chat-Teilnehmer.
