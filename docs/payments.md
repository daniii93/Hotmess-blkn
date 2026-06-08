# HOTMESS Payment, Ticketing and Membership

Stand: 2026-06-08

## Ziel

HOTMESS nutzt Stripe Checkout als produktiven Einstieg fuer zahlbare Tickets, Memberships und direkt buchbare Packages. Es gibt keine Mock-Payments mehr im Checkout-Flow. Wenn Stripe nicht konfiguriert ist, wird der Checkout blockiert und der Nutzer sieht einen klaren Hinweis.

## Benoetigte ENV Variablen

Keine echten Keys in das Repository schreiben.

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Optionale feste Stripe Price IDs fuer Memberships:

```env
STRIPE_PRICE_MEMBERSHIP_PLUS_MONTHLY=price_...
STRIPE_PRICE_MEMBERSHIP_PLUS_YEARLY=price_...
STRIPE_PRICE_MEMBERSHIP_BLACK_MONTHLY=price_...
STRIPE_PRICE_MEMBERSHIP_BLACK_YEARLY=price_...
```

Wenn keine Price IDs gesetzt sind, erzeugt HOTMESS Stripe Checkout Sessions mit `price_data` aus den bestehenden Membership- und Package-Daten.

## Routen

- `POST /payment/checkout`
- `GET /payment/success`
- `GET /payment/cancel`
- `POST /api/stripe/webhook`

Webhook in Stripe konfigurieren:

```text
https://hotmess-blkn.com/api/stripe/webhook
```

Aktive Events:

- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Checkout-Flows

### Tickets

`/tickets` sendet Ticketauswahl, Event, Tickettyp und Menge an `/payment/checkout`.

Workflow:

1. Nutzer muss eingeloggt und freigegeben sein.
2. Ticket darf nicht sold out sein.
3. HOTMESS legt eine lokale `hotmess_payment_sessions` Zeile mit Status `pending` an.
4. Stripe Checkout Session wird erstellt.
5. Nutzer bezahlt bei Stripe.
6. Webhook `checkout.session.completed` markiert die Session als `paid`.
7. HOTMESS erzeugt `ticket_orders`, QR-Tickets in `hotmess_ticket_wallet` und Revenue.

### Membership

`/membership`, `/membership/plus`, `/membership/black` starten Stripe Checkout im Subscription-Modus.

Unterstuetzt:

- Passport Plus monatlich
- Passport Plus jaehrlich
- Passport Black monatlich
- Passport Black jaehrlich

Free Passport bleibt kostenlos ueber Registrierung.

Nach Webhook:

- `hotmess_user_memberships` wird erstellt/aktualisiert.
- `stripe_customer_id` und `stripe_subscription_id` werden gespeichert.
- `renews_at` wird aus dem gewaehlten Billing Cycle gesetzt.
- Revenue wird als `memberships` gespeichert.

### Packages

`/packages/[slug]` bietet Direktbuchung fuer Packages mit Status `available` oder `few_left`.

Nicht direkt buchbar:

- `request_only`
- `sold_out`

Nach Webhook:

- Package wird fuer den Nutzer als `booked` markiert, wenn `platform_user_saved_packages` existiert.
- Revenue wird als `packages` gespeichert.

## Datenbanktabellen

Die Tabellen werden defensiv/lazy durch `hotmess_ensure_payment_tables()` angelegt.

### hotmess_payment_sessions

Speichert lokale Checkout Sessions:

- `user_id`
- `kind`: `ticket`, `membership`, `package`
- `source_id`
- `source_label`
- `quantity`
- `amount`
- `currency`
- `stripe_session_id`
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_payment_intent_id`
- `local_reference`
- `status`: `pending`, `paid`, `cancelled`, `refunded`
- `metadata`

### hotmess_ticket_wallet

Speichert QR-Tickets:

- `ticket_number`
- `qr_code`
- `event_id`
- `event_name`
- `ticket_type`
- `status`: `valid`, `checked_in`, `cancelled`
- `purchased_at`

### hotmess_user_memberships

Speichert Live-Membership:

- `tier_slug`: `free`, `plus`, `black`
- `status`: `active`, `trialing`, `past_due`, `cancelled`, `expired`
- `started_at`
- `renews_at`
- `stripe_customer_id`
- `stripe_subscription_id`

### platform_revenue_transactions

Speichert Umsatz nach erfolgreicher Zahlung:

- `source_type`: `tickets`, `packages`, `memberships`
- `source_id`
- `label`
- `amount`
- `currency`
- `city_id`
- `user_id`
- `payment_session_id`

### hotmess_payment_audit_log

Protokolliert Payment- und Webhook-Aktionen:

- `payment_session_id`
- `action`
- `detail`
- `created_at`

### hotmess_email_outbox

Queue fuer transaktionale E-Mails nach erfolgreicher Zahlung:

- `membership_welcome`
- `membership_upgrade`
- `membership_renewal`
- `ticket_confirmation`
- `package_confirmation`

Der Versand ist absichtlich entkoppelt. Ein Provider wie Resend oder Brevo kann die Queue spaeter abarbeiten.

## QR-Tickets

Pro bezahltem Ticket wird ein Ticket erzeugt.

Format:

- `ticket_number`: lokale Referenz plus laufende Nummer
- `qr_code`: `HOTMESS:` plus SHA-256 Token

Status:

- `valid`
- `checked_in`
- `cancelled`

Anzeige:

- `/account/tickets`

Apple Wallet und Google Wallet sind als Buttons vorbereitet, aber noch nicht produktiv angebunden.

## Sicherheit

Implementiert:

- CSRF fuer Checkout-Start
- Loginpflicht fuer Checkout
- Ticketkauf nur fuer Admins oder freigegebene Mitglieder
- Stripe Webhook Signaturpruefung mit Zeitfenster
- Idempotenz: bereits bezahlte lokale Sessions werden nicht doppelt erfuellt
- Doppelte Revenue-Erzeugung wird ueber `payment_session_id` verhindert
- Payment Audit Log fuer Webhook- und Statusaktionen
- Checkout Session Expired setzt lokale pending Sessions auf cancelled

Noch zu ergaenzen:

- Refund-Webhook und Rueckabwicklung
- echte Check-in-App/Admin-Scan-UI
- Apple Wallet Pass-Zertifikate
- Google Wallet Issuer Integration
- E-Mail Provider fuer Versand von Zahlungsbestaetigungen und QR-Ticket

## E-Mail-Flows

Nach erfolgreicher Zahlung werden E-Mails in `hotmess_email_outbox` als `queued` gespeichert. Produktiver Versand folgt nach Anbindung eines E-Mail Providers.

Vorbereitet:

- Membership Willkommen
- Membership Upgrade
- Membership Renewal
- Ticketbestaetigung
- QR Ticket
- Package Buchungsbestaetigung

Empfohlene Provider:

- Resend
- Brevo
- Mailchimp Transactional

## Admin Revenue

`/admin/revenue` zeigt Stripe-Konfigurationsstatus und nutzt Live-Revenue, sobald Zahlungen vorhanden sind. Ohne Live-Transaktionen bleibt der bestehende Demo-/Planungsstand sichtbar, damit das Dashboard lesbar bleibt.
