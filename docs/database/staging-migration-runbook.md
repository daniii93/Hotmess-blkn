# HOTMESS Supabase Staging Migration Runbook

## Zweck

Dieses Runbook beschreibt, wie die vorbereiteten Supabase-Migrationen sicher gegen Staging getestet werden.

## Voraussetzungen

- Supabase Account und Staging-Projekt.
- Supabase CLI lokal installiert.
- `.env` lokal mit Staging-Werten, niemals mit Production-Secrets im Git.
- Backup-Strategie fuer Production, bevor spaeter produktiv migriert wird.

## Lokale Validierung

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-supabase-migrations.ps1
```

oder:

```powershell
npm run db:validate
```

Der Check prueft:

- Migration-Verzeichnis vorhanden.
- Dateinamen im Schema `001_name.sql`.
- Lueckenlose Reihenfolge.
- Keine leeren Migrationen.
- Keine offensichtlichen destruktiven Statements wie `DROP DATABASE` oder `TRUNCATE TABLE`.
- Zentrale Tabellen vorhanden.
- Doppelte `create table if not exists public.*` Definitionen.

## Staging Ablauf

1. Supabase Staging-Projekt erstellen.
2. Supabase CLI mit dem Staging-Projekt verbinden.
3. Migrationen in Staging ausfuehren.
4. `015_seed.sql` nur verwenden, wenn Staging keine echten Daten enthaelt.
5. RLS aktiv pruefen:
   - Oeffentlicher Nutzer kann veroeffentlichte Events lesen.
   - Member kann eigene Tickets lesen.
   - Member kann fremde Tickets nicht lesen.
   - Chat-Messages sind nur fuer Teilnehmer sichtbar.
   - Audit Logs sind clientseitig nicht frei lesbar.
6. Edge Functions deployen und erwartete `501 prepared` Antworten testen.

## Production-Regel

Production-Migration erst ausfuehren, wenn:

- Staging-Migration ohne Fehler durchlaeuft.
- RLS Tests bestanden sind.
- Rollback-Plan dokumentiert ist.
- Backup vorhanden ist.
- Webhooks, Storage und E-Mail Secrets getrennt gesetzt sind.

## Bekannte Grenzen

Die aktuelle Migration ist eine Zielarchitektur. Die Live-PHP-Seite nutzt weiterhin bestehende PHP-Datenstrukturen und Mock-/Fallback-Dateien, bis Supabase schrittweise angebunden wird.
