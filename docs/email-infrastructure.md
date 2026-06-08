# HOTMESS E-Mail Infrastruktur

## Ziel

HOTMESS nutzt eine zentrale E-Mail-Schicht fuer System-E-Mails, Templates, Trigger und Admin-Testversand. Resend ist als Standardprovider vorbereitet. Wenn `RESEND_API_KEY` fehlt, arbeitet das System im Mock-/Log-Modus und bricht keine Workflows.

## Dateien

- `app/email-service.php`: Providerstatus, Versand, Resend-Call, Mock-Modus, Logs.
- `app/email-templates.php`: HOTMESS Templates in HTML und Text.
- `app/email-log.php`: Log-Helfer fuer Admin und Status.
- `admin-email.php`: Admin-Konsole fuer Providerstatus, Testversand und Logs.
- `docs/email-infrastructure.md`: diese Dokumentation.

## Resend Setup

1. Resend Account erstellen: https://resend.com/signup
2. Domain `hotmess-blkn.com` hinzufuegen.
3. DNS Records fuer SPF, DKIM und Domain-Verifizierung bei Hostinger/Cloudflare eintragen.
4. Absender vorbereiten:
   - `no-reply@hotmess-blkn.com`
   - optional `hello@hotmess-blkn.com` als Reply-To.
5. API Key erzeugen.
6. API Key nur lokal oder auf dem Server in `.env` / Hosting-ENV speichern.
7. Testversand unter `/admin/email` ausfuehren.

## ENV Variablen

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@hotmess-blkn.com
RESEND_REPLY_TO_EMAIL=hello@hotmess-blkn.com
POSTMARK_SERVER_TOKEN=
POSTMARK_FROM_EMAIL=no-reply@hotmess-blkn.com
```

Keine Live-Keys in Git eintragen.

## Mock-Modus

Wenn `RESEND_API_KEY` fehlt:

- kein Fatal Error
- kein echter Versand
- Versandversuch wird in `email_logs` gespeichert
- Status: `skipped_provider_missing`
- Admin sieht Hinweis in `/admin/email` und `/admin/system`

Das ist der gewuenschte Zustand, solange Resend-Domain und API-Key noch nicht produktiv konfiguriert sind.

## Templates

Verfuegbare Templates:

- `welcome_member`
- `verify_email`
- `password_reset`
- `ticket_confirmation`
- `membership_confirmation`
- `membership_upgrade`
- `package_inquiry_received`
- `hotel_inquiry_received`
- `vip_inquiry_received`
- `partner_application_received`
- `ambassador_application_received`
- `moderation_warning`
- `chat_restriction_notice`
- `account_suspension_notice`
- `concierge_request_received`

Alle Templates enthalten:

- HTML-Version im dunklen HOTMESS Stil
- Text-Version
- CTA
- HOTMESS Footer
- Platzhalter fuer Name, Code und Details

## Trigger

Vorbereitet und angebunden:

- Registrierung: `welcome_member`
- E-Mail-Verifizierung: `verify_email`
- Payment:
  - Ticket: `ticket_confirmation`
  - Membership: `membership_confirmation`
  - Upgrade: `membership_upgrade`
  - Package: `package_inquiry_received` als bestaetigende Fallback-Mail
- Inquiries:
  - Package
  - Hotel
  - VIP/Table
  - Partner
  - Ambassador
  - allgemeine/Concierge Anfrage
- Moderation:
  - Verwarnung
  - Chat-Einschraenkung
  - temporaere oder dauerhafte Sperre

Password Reset ist als Template vorbereitet, aber im aktuellen PHP-Flow noch nicht produktiv angebunden, falls kein Reset-Flow vorhanden ist.

## Logs

Tabelle: `email_logs`

Felder:

- `id`
- `to_email`
- `subject`
- `template_key`
- `status`
- `provider`
- `provider_message_id`
- `error_message`
- `meta_json`
- `created_at`

Statuswerte:

- `queued`
- `sent`
- `failed`
- `skipped_provider_missing`

## Admin Testversand

Route:

- `/admin/email`

Admin kann:

- Providerstatus sehen
- From/Reply-To sehen
- Test-E-Mail-Adresse eingeben
- Template auswaehlen
- Testversand starten
- Logs einsehen

Keine API Keys werden angezeigt.

## Datenschutz

- E-Mail-Logs enthalten Empfaengeradresse, Betreff, Template-Key, Status und technische Metadaten.
- Keine API Keys speichern oder anzeigen.
- Fehler werden bereinigt und maximal gekuerzt geloggt.
- Newsletter-/Marketing-Mails brauchen separaten Consent.
- Transaktionale Mails duerfen nur fuer notwendige Systemkommunikation genutzt werden.

## Troubleshooting

Problem: Testversand erzeugt nur Log.

- Erwartet, wenn `RESEND_API_KEY` fehlt.

Problem: Resend Versand fehlgeschlagen.

- Domain verifizieren.
- SPF/DKIM/DNS pruefen.
- From Email in Resend freigeben.
- API Key rotieren und neu setzen.

Problem: Keine Logs sichtbar.

- Datenbankverbindung pruefen.
- Tabelle `email_logs` wird durch `hotmess_ensure_email_log_table()` automatisch vorbereitet.

Problem: E-Mail landet im Spam.

- DKIM/SPF/DMARC pruefen.
- Absenderdomain verifizieren.
- Keine grellen Marketingtexte fuer transaktionale Mails verwenden.
