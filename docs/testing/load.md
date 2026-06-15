# HOTMESS Load Tests

Priorisierte Lastpunkte:

- Event Detailseite bei Drop.
- Ticket-Reservierung.
- Checkout Session.
- Waitlist Promotion.
- Chat Polling/Realtime.
- Scanner Check-in.

Echte Lasttests erst gegen Staging mit separaten Keys fahren.

## MVP Mindestziel

500 parallele Ticketreservierungen ohne Race Condition.

## k6 Schwerpunkte

- `reserve-ticket`
- Gender Balance Locking
- Waitlist Promotion
- Checkout Creation
- `scan-ticket`
