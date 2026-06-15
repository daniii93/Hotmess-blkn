# HOTMESS Rollback

## Grundregel

Vor produktiven Datenbankmigrationen Backup erstellen. Code-Rollback und Datenbank-Rollback getrennt planen.

## Schritte

1. Deployment stoppen oder Maintenance aktivieren.
2. Letzten stabilen Commit deployen.
3. Datenbank nur zurueckrollen, wenn Migrationen nicht abwaertskompatibel waren.
4. Payment/Webhook-Warteschlangen pruefen.
5. Admin Audit und Logs sichern.

## Release-Regeln

- Vor jedem Release Git Tag setzen.
- DB Migration vorab in Staging pruefen.
- Rollback Migration vorbereiten.
- Vercel vorheriges Deployment verfuegbar halten.
- Supabase Backup pruefen.
