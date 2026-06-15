# Abschnitt 7/10: Checkout, Add-ons, Hotels, Gruppen und Payments

## Umgesetzt

- Checkout Flow mit Event -> Ticketreservierung -> Add-ons -> Order -> Payment -> Confirmation vorbereitet.
- Serverregel: Ohne Ticket keine Hotels, Tische, Fast Lane, Geburtstagspakete oder Bottle Service.
- Warenkorb mit Ticket, Hotel, Tisch, Getränkepaketen, Fast Lane, Geburtstag, Bottle Service und Add-ons.
- Rabattcodes: Prozent, Fixbetrag und VIP Unlock vorbereitet.
- Steuerberechnung fuer AT, DE, CH, IT.
- Order- und Rechnungsnummern vorbereitet.
- Hotelkontingente pro Event, Hotel und Zimmerart.
- Hoteloptionen: Frühstück, Late Checkout, Upgrade.
- Tischtypen: Standard, VIP, Premium.
- Add-on Regeln:
  - Fast Lane -> Ticket nötig
  - Hotel -> Ticket nötig
  - Tisch -> Ticket nötig
  - Geburtstag -> Tisch nötig
  - Früchteplatte -> Tisch nötig
  - Bottle Service -> Tisch + Getränkepaket nötig
- Gruppenbuchungen mit verifizierten Teilnehmern.
- Split Payment Links mit 24-Stunden-Frist.
- Payment Status: pending, processing, paid, failed, cancelled, refunded.
- Revenue Tracking fuer Ticket, Hotel, Table, Drink, Fast Lane, Birthday und Total vorbereitet.
- Analytics View fuer Average Cart, Add-on Conversion, Hotel Conversion und Split Payment Rate vorbereitet.
- Edge Functions:
  - `create-order`
  - `create-checkout`
  - `confirm-payment`
  - `process-split-payment`
  - `apply-discount`
  - `confirm-hotel`
  - `confirm-table`

## Produktiv offen

- Stripe Checkout Session und PayPal Order Creation mit echten Provider Keys.
- Webhook-Signaturpruefung fuer Stripe/PayPal final aktivieren.
- E-Mail und Push fuer Buchungsbestaetigung anbinden.
- Refunds bleiben `future`.
- Hotel-/Table-Buchungen muessen in der UI an die neuen Tabellen angebunden werden.
- Split-Payment-Fristen brauchen Cron/Job fuer Ablauf und Platzfreigabe.

## Sicherheitsgrundsatz

Keine Zahlungs- oder Buchungslogik darf clientseitig vertraut werden. `create-order` nutzt den authentifizierten Supabase User. Payment-Confirmation laeuft serverseitig ueber Provider-Webhooks und ist idempotent ueber `provider_event_id` vorbereitet.
