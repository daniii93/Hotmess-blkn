# Supabase-Automation fuer Codex

Ziel: Codex kann Supabase-Migrationen selbst ausfuehren und danach automatisch pruefen.

## Einmalige Einrichtung

1. In Supabase oeffnen:
   `Project Settings -> Database -> Connection string -> URI`
2. URI kopieren.
3. `[YOUR-PASSWORD]` durch das echte Datenbank-Passwort ersetzen.
4. Datei `.env.supabase.local` im Projektordner anlegen:

```env
POSTGRES_URL_NON_POOLING="postgresql://postgres.PROJECT_REF:PASSWORT@aws-...pooler.supabase.com:5432/postgres?sslmode=require"
```

Die Datei `.env.supabase.local` ist durch `.gitignore` ausgeschlossen und wird nicht hochgeladen.

## Migrationen einspielen

Beispiel Dating:

```bash
npm run db:apply -- supabase/migrations/004_dating_part4.sql supabase/migrations/011_dating_runtime.sql
```

Beispiel mehrere Dateien:

```bash
npm run db:apply -- supabase/migrations/017_account_username_rules.sql supabase/migrations/018_account_security_settings.sql
```

## Schema pruefen

```bash
npm run db:check
```

Der Standard-Check liegt hier:

```text
scripts/sql/check-app-schema.sql
```

Wenn ein Wert `false` ist, fehlt diese Tabelle oder Spalte noch in Supabase.

## Wichtig

- Keine Passwoerter in Git committen.
- Keine `.env.supabase.local` teilen.
- Bei SQL-Fehlern erst den Fehler lesen, dann gezielt die fehlende Migration oder Tabelle nachziehen.
