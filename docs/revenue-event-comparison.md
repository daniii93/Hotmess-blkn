# HOTMESS Revenue Event Comparison

## Zweck

Der Bereich `/admin/revenue` enthaelt einen Event-Umsatzvergleich fuer bis zu drei Events. Admins koennen sehen, wie sich Umsatz pro Event ueber einen Zeitraum entwickelt und welche Umsatzarten in die Berechnung einfliessen.

## Filter

Event-Auswahl:

- mindestens 1 Event
- maximal 3 Events
- Eventname, Stadt und Datum werden angezeigt
- bei mehr als 3 Events wird clientseitig verhindert und serverseitig auf 3 begrenzt

Zeitraum:

- 7 Tage
- 1 Monat
- 6 Monate
- 12 Monate
- 24 Monate

Umsatzarten:

- Alles
- Verkaufte Tickets
- Hotelpakete
- Getränkepakete

## Umsatzarten-Logik

`Alles` beruecksichtigt alle Revenue-Source-Typen. Sobald eine einzelne Umsatzart gewaehlt wird, wird `Alles` deaktiviert. Wenn alle einzelnen Umsatzarten deaktiviert werden, faellt die UI automatisch auf `Alles` zurueck.

Technische Zuordnung:

- Verkaufte Tickets: `ticket`
- Hotelpakete: `hotel_package`
- Getränkepakete: `drink_package`

Bestehende alte Source-Typen werden normalisiert:

- `tickets` -> `ticket`
- `hotels` -> `hotel_package`
- `packages` -> `package`
- `vip_services` -> `vip`
- `partner_offers` -> `partner`

## Berechnungslogik

Pro Event wird genau eine Linie gezeichnet. Die ausgewaehlten Umsatzarten werden pro Zeitbucket summiert.

Beispiel:

- Event A + Verkaufte Tickets + Hotelpakete ergibt eine Linie fuer Event A.
- Event B + Verkaufte Tickets + Hotelpakete ergibt eine Linie fuer Event B.

Es gibt keine separaten Linien pro Umsatzart.

## Tooltip und Tabelle

Jeder Chart-Punkt enthaelt einen Tooltip mit:

- Eventname
- Datum oder Monatsbucket
- Verkaufte Tickets
- Hotelpakete
- Getränkepakete
- Weitere Umsaetze bei `Alles`
- Gesamt

Die Detailtabelle zeigt:

- Event
- Verkaufte Tickets
- Hotelpakete
- Getränkepakete
- Gesamt

Nicht ausgewaehlte einzelne Umsatzarten werden als `–` dargestellt.

## Demo-Daten

Wenn keine echten eventbezogenen Umsaetze vorhanden sind, nutzt der Vergleich strukturierte Demo-Daten. Der Bereich markiert dies sichtbar mit `Demo-Daten`.

Die bestehenden Revenue-Transaktionen bleiben unveraendert sichtbar. Demo-Daten gelten nur fuer den Event-Vergleich.

## Datenbank-Vorbereitung

`platform_revenue_transactions` ist fuer folgende Felder vorbereitet:

- `event_id`
- `source_type`
- `amount`
- `currency`
- `created_at`
- `user_id`
- `payment_status`

Fuer Umsatzberechnungen werden nur `payment_status = paid` und optional negative Refunds beruecksichtigt.

## Bekannte Limitierungen

- Der Chart ist serverseitig als SVG gerendert, nicht als externe Chart-Library.
- Live-Daten muessen eventbezogen ueber `event_id` oder passende `source_id` vorliegen.
- Refunds werden vorbereitet; bestehende alte Transaktionen ohne `payment_status` gelten als bezahlt.
- Weitere Source-Typen wie Membership, Package, VIP oder Partner werden bei `Alles` einbezogen, aber nicht als einzelne Filterchips angezeigt.
