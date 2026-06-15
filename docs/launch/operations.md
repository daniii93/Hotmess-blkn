# HOTMESS Launch Operations

## Ziel

Diese Datei beschreibt die produktionsnahen Betriebsregeln fuer HOTMESS nach Abschnitt 10. Sie ergaenzt Checkliste, Smoke-Test und Rollback um Backups, Seed-Daten, Monitoring und Performance-Gates.

## Environments

HOTMESS wird in drei Umgebungen betrieben:

- Development: lokale Entwicklung mit Mock- oder Test-Keys.
- Staging: produktionsnahe Tests mit eigenen Staging-Keys und Seed-Daten.
- Production: Live-Betrieb mit echten Keys, Webhooks, Backups und Monitoring.

Production darf nur deployt werden, wenn `npm run launch:check`, `npm run env:validate` und `npm run db:validate` erfolgreich sind.

## Staging Seed-Daten

Die Datei `supabase/seed/staging_launch_seed.sql` enthaelt sichere Demo-Daten fuer Launch-Smoke-Tests:

- Staging Admin
- Staging Member
- Staging Venue
- Staging Event
- Regular und VIP Tickettypen

Keine echten Kundendaten, Payment-IDs oder Secrets duerfen in Seed-Dateien stehen.

## Backups

Production benoetigt vor Go-Live:

- Supabase Point-in-Time Recovery oder regelmaessige Datenbank-Backups.
- Export-Test vor Launch.
- Wiederherstellungs-Test in Staging.
- Dokumentierten Verantwortlichen fuer Backup-Checks.
- Storage-Backup-Konzept fuer Medien, falls R2/Supabase Storage produktiv genutzt wird.

Empfohlene Mindestregel:

- Taegliches Datenbank-Backup.
- Woechentlicher Restore-Test in Staging.
- Backup-Logs im Admin-/Ops-Protokoll dokumentieren.

## Monitoring

Abschnitt 10 bereitet folgende Health-Check-Gruppen vor:

- Vercel Logs
- Supabase Logs
- Stripe Webhook Logs
- PayPal Webhook Logs
- Edge Function Logs
- Error Logging
- Audit Logs

Die Tabellen `webhook_events`, `cron_job_runs` und `system_health_checks` dienen als gemeinsame Grundlage fuer Admin-Systemstatus, Audit und spaetere Alerting-Integrationen.

## Webhook-Sicherheit

Stripe, PayPal und Stripe Identity muessen folgende Regeln erfuellen:

- Signatur pruefen.
- Idempotency-Key speichern.
- Event nur einmal verarbeiten.
- Fehler ohne Secrets loggen.
- Kritische Payment-Events in Audit-/Webhook-Logs speichern.

Ein Webhook darf nur verarbeitet werden, wenn Signatur, Idempotenz und Audit-Logging aktiv sind.

## Cron Jobs

Vorbereitete Jobs:

- `expire_reservations`
- `promote_waitlist`
- `expire_split_payments`
- `send_event_reminders`
- `complete_events`
- `cleanup_verification_files`

Jeder Job schreibt einen Lauf in `cron_job_runs`, sobald die produktive Ausfuehrung angeschlossen ist.

## Performance und SEO Gates

Vor Launch pruefen:

- Mobile Lighthouse Performance mindestens 85.
- Accessibility mindestens 90.
- Kein horizontales Scrollen auf iPhone/Android/iPad.
- Kritische Seiten laden ohne Browser-Konsole-Fehler.
- Sitemap und Robots sind korrekt.
- Payment-, Ticket- und Eventseiten haben saubere Meta-Daten.
- Bilder sind optimiert und nicht unnoetig gross.

Kritische Seiten:

- `/`
- `/events`
- `/tickets`
- `/login.php`
- `/register.php`
- `/account`
- `/admin`
- `/scanner.php`

## Legal Gate

Vor Production:

- Impressum pruefen.
- Datenschutz pruefen.
- AGB pruefen.
- Ticket- und Refund-Regeln pruefen.
- Cookie-/Tracking-Regeln pruefen.
- E-Mail Opt-in und Abmeldung pruefen.
- Chat-/Moderationshinweise pruefen.

## Definition of Done

Abschnitt 10 gilt als launchbereit, wenn:

- Environments dokumentiert sind.
- ENV-Validierung existiert.
- Webhook-Sicherheit vorbereitet ist.
- Cron-Jobs dokumentiert und typisiert sind.
- Notification Center vorbereitet ist.
- E-Mail-Templates vorbereitet sind.
- Push-Logik vorbereitet ist.
- E2E-, Load- und Security-Tests dokumentiert sind.
- Staging-Seed-Daten existieren.
- Smoke-Test und Rollback dokumentiert sind.
