# Abschnitt 9/10: Admin, Scanner, Moderation, Operations und Analytics

## Umgesetzt

- Admin Metric Typen.
- Moderation Decision Notices.
- Scanner Result Labels.
- Audit Event Helper.
- Admin Navigation fuer Dashboard, Events, Sales, Users, Verification, Tickets, Orders, Add-ons, Hotels, Discount Codes, Scanners, Moderation, Broadcast, Analytics und Settings.
- Dashboard KPIs fuer Umsatz heute/Woche/Monat, Tickets, aktive/sold-out Events, Waitlist, Verifikationen, neue Nutzer, Scanner-Aktivitaet, Add-on- und Hotelumsatz.
- Event Management Actions und Publish-Validierung.
- Gender-Balance Admin Grundlage ueber Event/Gender-Counter aus Abschnitt 6.
- Ticket Management Rows und kritische Aktionen mit Confirmation-Flag.
- Order Management Rows fuer Payment Status, Provider IDs, Invoice und Split Payment Status.
- Refunds bleiben als `refunds: future` vorbereitet und werden nicht entfernt.
- Add-on Management fuer Hotel, Tische, Getraenkepakete, Bottle Service, Fast Lane, Birthday und Fruechteplatten.
- Hotel Admin Rows mit Marge, Zimmerart, Check-in/out, Status und Confirmation Code.
- Scanner Management mit Event-Zuweisung, `valid_until`, Aktivstatus und Scanner-Aktivitaet.
- Scanner App Core fuer Eventzugriff, Scan Result Labels und `ok -> used`.
- User Management Rows mit Verifikation, Rolle, Aktivstatus, Tickets und Events.
- Verification Admin Actions: approve, reject, request more info.
- Broadcast System fuer Push, E-Mail und In-App Segmente.
- Analytics Snapshot fuer Revenue, Ticket Sales, Add-ons, Hotel/Table/Drink-Margen, Gender Split, Waitlist/Checkout/Split Payment, Scanner, No Show und Community.
- CSV Export Header fuer Guest List, Hotels, Tables, Fast Lane, Birthday, Revenue und Scanner Log.
- Supabase Migration 020 fuer Admin Audit, Scanner Logs, Broadcasts, Export Jobs und Verification Reviews.
- Server-RPC `scan_ticket_for_event(...)` mit Scanner-Event-Zuweisung und Ticketstatus `used`.
- Admin Audit Actions fuer kritische Admin-Aktionen.

## Zielbild

Admin bleibt ein ruhiges Operations-Center fuer Events, Tickets, Nutzer, Reports, Scanner, Analytics und Settings. Scanner-Funktionen muessen offline-tolerant, aber bei Sync serverseitig validiert sein.

## Produktiv offen

- UI-Tabellen in `/admin` auf die neuen Views/RPCs umstellen.
- Scanner-Kamera UI an `scan_ticket_for_event(...)` anbinden.
- CSV Export Jobs asynchron erzeugen und Dateien sicher speichern.
- Broadcast Versand an Resend/Push/In-App Provider anbinden.
- Admin-Aktionen aus PHP/Next Actions konsequent mit `log_admin_action(...)` protokollieren.
