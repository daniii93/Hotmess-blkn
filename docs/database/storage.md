# HOTMESS Storage Struktur

`media_assets` speichert Metadaten fuer lokale Uploads, Cloudflare R2 oder spaeter Supabase Storage.

## Felder

- Provider, Bucket, Folder, Pfad und Public URL.
- Media Type, MIME-Type, Dateigroesse.
- Optionale Dimensionen, Dauer und Thumbnail.
- Upload-Nutzer, Modulbezug, Status.

## Sicherheitsregeln

- Keine Original-Dateinamen als finale Pfade.
- MIME-Type und Dateiendung serverseitig pruefen.
- SVG nur fuer Partnerlogos und nur kontrolliert.
- Admin Uploads nur fuer Admins.
- Chat Uploads nur fuer eigene Chats.
