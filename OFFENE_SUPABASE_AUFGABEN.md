# Offene Supabase-Aufgaben

## Manuell später einspielen

### Dating / Teil 4
Diese Migrationen in Supabase SQL Editor nacheinander ausführen, sonst funktioniert Dating online noch nicht vollständig:

1. `supabase/migrations/004_dating_part4.sql`
2. `supabase/migrations/011_dating_runtime.sql`

Reihenfolge: `004_dating_part4.sql` -> `011_dating_runtime.sql`

Hinweis: Nach dem Einspielen Dating online testen: `/dating`, `/dating/profile`, `/dating/matches`, `/dating/likes`.
