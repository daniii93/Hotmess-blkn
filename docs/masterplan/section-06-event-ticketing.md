# Abschnitt 6/10: Event System, Ticketing, Gender-Balance und Waitlist

## Umgesetzt

- Event-Typen und Publish-Readiness.
- Event-Lifecycle-Regeln fuer Publish, Sold Out, Cancelled und Completed.
- Event-Kapazitaet `capacity_total`.
- Ticket Inventory, Availability, Eligibility und Ticket-Lifecycle.
- Gender-Balance Pflichtkonfiguration mit Quotenberechnung fuer `female`, `male`, `diverse`.
- Waitlist pro Geschlecht mit Position, Promotion und 15-Minuten-Kaufrecht.
- Atomare Supabase RPCs fuer Reservierung, Reservation-Expiry, Waitlist-Promotion und Event-Completion.
- Edge Functions: `reserve-ticket`, `promote-waitlist`, `expire-reservations`.
- Event Attendees, Event KPIs und Revenue-Tracking vorbereitet.
- QR-Payload ohne Zahlungsdaten, Adresse oder E-Mail vorbereitet.
- Event-Chat-Pruefung ueber gueltiges Ticket vorbereitet.

## Produktiv offen

- Supabase Migration 016 muss in Staging ausgefuehrt und mit echten Concurrent-Reservation-Tests validiert werden.
- Stripe-Webhook-Erzeugung finaler Tickets und `event_attendees` Eintrag.
- Push/E-Mail fuer Waitlist-Promotion und Event-Absage.
- Realtime-Kanal fuer Event-Chat und Teilnehmerlisten.

## Race-Condition-Schutz

Die Reservierung laeuft serverseitig ueber `public.reserve_event_ticket(...)`.

Die Funktion nutzt:

- Row Locking auf Event, Tickettyp, User und Gender Counter.
- Verifikationspruefung serverseitig.
- Gender-Quota-Pruefung serverseitig.
- Automatischen Waitlist-Fallback, wenn Ticket- oder Gender-Kontingent voll ist.
- 15 Minuten Reservierungsdauer.

Kein Client darf Ticketkapazitaet direkt veraendern.
