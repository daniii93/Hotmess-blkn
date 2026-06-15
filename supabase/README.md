# HOTMESS Supabase

Dieses Verzeichnis enthaelt die vorbereitete Supabase-Zielarchitektur fuer HOTMESS.

## Struktur

- `migrations/`: SQL-Migrationen in numerischer Reihenfolge.
- `functions/`: Edge Function Stubs fuer Ticketing, Waitlist und Checkout.
- `seed/`: reserviert fuer optionale Development Seeds.

## Lokale Validierung

```powershell
npm run db:validate
```

oder direkt:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-supabase-migrations.ps1
```

## Wichtig

Diese Dateien sind vorbereitet, aber nicht automatisch gegen Production ausgefuehrt.

Production braucht:

- separates Supabase-Projekt oder klares Environment
- Backups
- RLS-Test
- Service-Role-Key nur serverseitig
- keine Secrets im Git
