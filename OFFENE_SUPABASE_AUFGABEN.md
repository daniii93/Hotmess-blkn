# Supabase-Aufgaben

## Erledigt

### Dating / Teil 4
Diese Migrationen wurden am 17.06.2026 per `npm run db:apply` erfolgreich in Supabase eingespielt:

1. `supabase/migrations/004_dating_part4.sql`
2. `supabase/migrations/011_dating_runtime.sql`

Danach lief `npm run db:check` erfolgreich durch.

### Inbox / Chat Runtime
Diese Migrationen wurden am 17.06.2026 per `npm run db:apply` erfolgreich in Supabase eingespielt:

1. `supabase/migrations/015_inbox_notes_runtime.sql`
2. `supabase/migrations/016_inbox_member_actions.sql`

Zusaetzlich wurde am 17.06.2026 `supabase/migrations/010_social_core_runtime.sql` nachgezogen, weil die Live-Datenbank die RPC `create_direct_conversation` noch nicht kannte.

Danach lief der erweiterte `npm run db:check` erfolgreich durch.

### Chat Maximal-Spec Runtime
Diese Punkte sind im Code nativ umgesetzt:

1. Swipe-Gesten in der Inbox: rechts = gelesen/ungelesen, links = archivieren.
2. Echter Typing-Presence-Indikator im Chat-Thread ueber Supabase Realtime Presence.
3. Offline-Queue fuer Chat-Nachrichten ueber IndexedDB, mit Auto-Senden beim Online-Event.

`npm.cmd run typecheck` und `npm.cmd run build` liefen erfolgreich durch.

### Zwei-Account Chat Smoke-Test
Am 17.06.2026 live gegen `https://www.hotmess-blkn.app` erfolgreich getestet:

1. Zwei Kunden-Sessions parallel angemeldet.
2. Direkten Chat angelegt.
3. Normale Nachricht gesendet und beim zweiten Account sichtbar.
4. Typing-Presence-Indikator beim zweiten Account sichtbar.
5. Offline-Nachricht im Browser gequeued und nach Wiederherstellung der Verbindung automatisch gesendet.

### Ticket / QR / Scanner Smoke-Test
Am 17.06.2026 live gegen `https://www.hotmess-blkn.app` mit dem Testkunden `codex.testkunde.202606170900@hotmess-blkn.app` getestet:

1. Testkunde in Supabase fuer den Ticketkauf verifiziert.
2. Test-Order und Test-Ticket fuer `hotmess-live-665315` erzeugt.
3. Testzahlung manuell als bezahlt markiert, weil der echte Stripe-Checkout live noch mit Zahlungsanbieter-Konfiguration blockiert.
4. QR-Code-Endpoint `/api/tickets/[id]/qr` erfolgreich geprueft: Antwort `image/png`.
5. Scanner-Endpoint `/api/scanner/scan` erfolgreich geprueft: erster Scan akzeptiert, zweiter Scan korrekt mit `409 Bereits eingelassen` abgelehnt.
6. Checkout-Route wurde angepasst: fehlende/kaputte Stripe- oder PayPal-Konfiguration liefert jetzt eine klare JSON-Fehlermeldung statt 500 und raeumt fehlgeschlagene Reservierungen wieder auf.

### Stripe Sandbox Checkout
Am 17.06.2026 wurden die Stripe-Sandbox-Keys in Vercel Production gesetzt und ein Production-Deploy ausgefuehrt.

Danach wurde ein vollstaendiger Stripe-Testkauf ohne manuelle DB-Aktivierung geprueft:

1. HotMess Checkout-API erzeugt Stripe Checkout Session fuer `HotMess Innsbruck Live`.
2. Stripe Webhook `/api/webhooks/stripe` nimmt signiertes `checkout.session.completed` an.
3. `activatePaidOrder` setzt Order auf `paid`, Ticket auf `valid`, erzeugt QR und schreibt `event_attendees`.
4. QR-Endpunkt liefert `image/png`.
5. Scanner-Endpoint akzeptiert das automatisch aktivierte Ticket.

Zusaetzlich wurde `supabase/migrations/009_finalize_ticketing_part2.sql` live nachgezogen, weil `orders.provider_order_id` fuer die Zahlungslogik fehlte.

### PayPal Sandbox Checkout
Am 17.06.2026 wurden die PayPal-Sandbox-Daten in Vercel Production gesetzt und ein Production-Deploy ausgefuehrt:

1. PayPal Sandbox App `Default Application` genutzt.
2. PayPal Webhook fuer `https://www.hotmess-blkn.app/api/webhooks/paypal` angelegt.
3. `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` und `PAYPAL_WEBHOOK_ID` in Vercel Production gesetzt.
4. HotMess Checkout-API erzeugt erfolgreich eine PayPal Sandbox Approval-URL.
5. PayPal Webhook-Pfad aktiviert Order auf `paid`, Ticket auf `valid`, erzeugt QR und schreibt `event_attendees`.
6. QR-Endpunkt liefert `image/png`.
7. Scanner-Endpoint akzeptiert das ueber PayPal aktivierte Ticket.

## Noch testen

- `/dating`
- `/dating/profile`
- `/dating/matches`
- `/dating/likes`
- `/chat`
- `/chat/new`
- `/chat/requests`

## Manuell offen

- Keine Supabase-/Payment-Pflichtaufgabe offen. Spaeter fuer echten Live-Betrieb Stripe/PayPal von Sandbox auf Live-Keys umstellen.
