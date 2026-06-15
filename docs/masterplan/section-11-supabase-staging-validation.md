# Abschnitt 11: Supabase Staging, Migration-Validierung und produktionsnaher Datenpfad

Dieser Abschnitt macht die vorbereitete Datenbankarchitektur pruefbar, ohne produktive Daten zu riskieren.

## Ziel

HOTMESS soll Migrationen, RLS, Edge Functions und Datenpfade zuerst gegen ein Staging-Projekt pruefen. Die bestehende PHP-Live-Seite bleibt dabei unveraendert erreichbar.

## Umgesetzt

- Lokales Validierungsskript: `scripts/validate-supabase-migrations.ps1`
- Runbook: `docs/database/staging-migration-runbook.md`
- Supabase README: `supabase/README.md`
- Package Script: `npm run db:validate`

## Staging-Regeln

- Keine Production Keys lokal in Git.
- `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig nutzen.
- Migrationen zuerst in Staging ausfuehren.
- RLS-Policies nach jeder Migration testen.
- Edge Functions erst deployen, wenn ENV und Secrets gesetzt sind.

## Pruefreihenfolge

1. Migration-Dateien lokal validieren.
2. Frisches Supabase-Staging-Projekt erstellen.
3. Migrationen in numerischer Reihenfolge ausfuehren.
4. Seed nur in Staging/Development verwenden.
5. RLS mit Member, Admin, Scanner und Partner testen.
6. Edge Function Stubs deployen.
7. PHP-Live-Seite unveraendert smoke-testen.

## Noch nicht produktiv aktiviert

- Kein Live-Supabase-Projekt verbunden.
- Keine Migration gegen Production ausgefuehrt.
- Edge Functions liefern weiterhin vorbereitete `501`-Antworten.
