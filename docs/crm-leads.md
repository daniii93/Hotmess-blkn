# HOTMESS CRM, Leads und Pipeline

Stand: 2026-06-08

## Ziel

Alle bestehenden Anfragewege bleiben erhalten und erzeugen automatisch einen operativen Lead. Dadurch werden Package-, Hotel-, VIP-, Partner-, Ambassador- und Kontaktanfragen zentral kategorisiert, priorisiert, zugewiesen und bis zur Umsatzchance verfolgt.

## Anfragewege

- Package Inquiry -> `package` Lead -> Weekend Concierge
- Hotel Inquiry -> `hotel` Lead -> Travel Desk
- VIP / Table Inquiry -> `vip` Lead -> VIP Desk
- Partner Application -> `partner` Lead -> Partner Lead
- Ambassador Application -> `ambassador` Lead -> Community Lead
- Contact Inquiry -> `contact` Lead -> Concierge Desk

Es werden keine neuen Formulare benoetigt. Die bestehende Speicherung in `platform_inquiries` bleibt die Quelle fuer eingehende Anfragen.

## Datenmodell

Neue operative Tabellen:

- `platform_leads`
- `platform_lead_tasks`
- `platform_lead_timeline`
- `platform_lead_revenue_links`
- `platform_lead_email_automations`

`platform_leads.inquiry_id` ist eindeutig. Dadurch erzeugt eine Anfrage maximal einen Lead und keine Dubletten.

## Pipeline

Globale Pipeline-Stufen:

- Neu
- Kontaktiert
- Qualifiziert
- Angebot gesendet
- In Verhandlung
- Gewonnen
- Verloren

Spezifische Status-Flows:

- Hotel: Neu -> Hotel kontaktiert -> Angebot erhalten -> Gast informiert -> Abgeschlossen
- Package: Neu -> Beratung -> Angebot -> Gebucht -> Verloren
- VIP: Neu -> Pruefung -> Angebot -> Bestaetigt -> Abgelehnt
- Partner: Anfrage -> Erstgespraech -> Angebot -> Vertrag -> Aktiv

## Automatische Aufgaben

Beim Lead wird automatisch eine erste Aufgabe erstellt:

- Hotel: Hotel anrufen
- Package: Package Beratung starten
- VIP: VIP Angebot senden
- Partner: Partner kontaktieren
- Ambassador: Ambassador Bewerbung pruefen
- Contact: Kontaktanfrage beantworten

Jede Task-Aenderung wird in der Lead-Timeline dokumentiert.

## Kommunikation und Timeline

Die Timeline ist vorbereitet fuer:

- Notizen
- Anrufe
- E-Mails
- Meetings
- Statuswechsel
- Tasks
- Revenue Events

Aktuell werden automatische Systemeintraege beim Lead, bei Task-Erstellung und bei Pipeline-Aenderungen geschrieben.

## Umsatzverknuepfung

Jeder Lead erhaelt eine `platform_lead_revenue_links` Zeile mit einem realistischen Umsatzpotenzial. Wird ein Lead als `Gewonnen` markiert, wird der Revenue-Link auf `won` gesetzt.

Spaetere produktive Integration:

- Stripe Payment Sessions
- Hotel Provisionen
- Package Direktbuchungen
- Membership Upgrades
- Partnervertraege
- VIP / Table Sales

## E-Mail Automation

`platform_lead_email_automations` bereitet folgende Trigger vor:

- `inquiry_received`
- `follow_up`
- `reminder`
- `offer`
- `confirmation`

Provider wie Brevo, HubSpot, Mailchimp oder ein eigenes Mail-System koennen spaeter aus dieser Tabelle versenden.
