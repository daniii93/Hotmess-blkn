# HOTMESS BLKN — Open-Source Research
# Geprüfte kostenlose GitHub-Projekte als Inspiration

Stand: Juni 2026

---

## 1. raviagheda/event-ticket-registration

**Lizenz:** MIT  
**URL:** https://github.com/raviagheda/event-ticket-registration  
**Zweck:** PHP-basiertes Event-Ticketing mit QR-Code-Generierung, Registrierung und Ticket-Verwaltung.

**Was nutzbar wäre:**
- Grundprinzip: Ticket-Nummer + QR-Code generieren und in DB speichern
- QR-Code-Format-Konzept (eindeutiger Hash pro Ticket)

**Was übernommen wurde:**
- Konzept der Ticket-Nummernstruktur: `PREFIX-DATUM-RANDOM-SEQUENZ`
- Idee, QR-Code als Hash aus TicketNr + UserId + AppURL zu generieren
- HOTMESS implementiert dies in `hotmess_fulfill_ticket_payment()` in `app/payments.php`

**Sicherheitsrisiken:**
- Original-Projekt hat keine CSRF-Protection — nicht übernommen
- Direkte DB-Abfragen ohne Prepared Statements — nicht übernommen
- HOTMESS nutzt eigene sichere Implementierung mit PDO + CSRF

**Entscheidung: NUR INSPIRATION — kein Code übernommen**

---

## 2. systopia/de.systopia.eventcheckin (CiviCRM Extension)

**Lizenz:** AGPL-3.0  
**URL:** https://github.com/systopia/de.systopia.eventcheckin  
**Zweck:** Event Check-in Extension für CiviCRM mit QR-Code-Scanner und API-Ansatz.

**Was nutzbar wäre:**
- Architektur: Separate Scanner-Seite + API-Endpunkt für QR-Lookup
- Konzept: Ticket-Status "valid → checked_in" in DB
- Idee: Scanner-Rolle vs. Admin-Rolle für Check-in-Zugang

**Was übernommen wurde:**
- Architektur-Konzept: `/checkin/scanner` ruft `/api/checkin/scan` und `/api/checkin/confirm` auf
- Trennung von Lookup (read) und Confirm (write) in zwei API-Endpunkten
- Konzept der checkin_staff-Tabelle für rollenbeschränkten Zugang

**Sicherheitsrisiken:**
- AGPL-3.0 Lizenz: Bei Nutzung des Codes wäre Source-Disclosure Pflicht
- Laravel/CiviCRM-spezifisch: nicht direkt verwendbar

**Entscheidung: NUR INSPIRATION — kein Code übernommen. AGPL inkompatibel mit Commercial Use.**

---

## 3. google-pay/wallet-samples (PHP Demo)

**Lizenz:** Apache 2.0  
**URL:** https://github.com/google-pay/wallet-samples/blob/main/php/demo_eventticket.php  
**Zweck:** Offizielles Google-Beispiel für Event-Tickets in Google Wallet via REST API.

**Was nutzbar wäre:**
- JWT-Struktur für Google Wallet Event-Ticket-Passes
- Pflichtfelder: eventTicketId, eventName, qrCode, ticketHolder, barcode
- PHP-Implementierung für Wallet-Pass-Erstellung

**Was übernommen wurde:**
- Dokumentiert die Feldstruktur für zukünftige Google Wallet Integration
- HOTMESS `hotmess_ticket_wallet` Tabelle enthält bereits alle notwendigen Felder

**Offene Schritte für Google Wallet:**
1. Google Pay & Wallet Console Account einrichten
2. Service Account erstellen + JSON-Key sichern
3. `google/apiclient` via Composer installieren (oder JWT manuell generieren)
4. Pass-Klasse erstellen, Pass-Objekt pro Ticket erzeugen
5. "Add to Google Wallet" Button einbauen

**Sicherheitsrisiken:**
- Erfordert Google Service Account Private Key — NIEMALS in Code commiten
- Muss als Umgebungsvariable in `.env` gespeichert werden

**Entscheidung: VERWENDEN (zukünftig) — Apache 2.0 kompatibel, sicheres Key-Management erforderlich**

---

## 4. mevdschee/php-crud-api

**Lizenz:** MIT  
**URL:** https://github.com/mevdschee/php-crud-api  
**Zweck:** Automatische REST-API-Generierung aus MySQL-Schema, eine PHP-Datei.

**Was nutzbar wäre:**
- Schneller Admin-CRUD ohne individuelle POST-Handler
- Auto-generierte API aus DB-Schema

**Sicherheitsrisiken (KRITISCH):**
- Ohne strikte Konfiguration: komplette DB öffentlich exponiert
- Kein eingebautes CSRF-Schutz
- Keine rollenbasierte Zugriffskontrolle ohne manuelle Konfiguration
- Jede Tabelle wird standardmäßig exposed

**Entscheidung: NICHT VERWENDEN — zu hohes Sicherheitsrisiko für Production. HOTMESS hat eigene, sicherere CRUD-Implementierung.**

---

## 5. krayin/laravel-crm

**Lizenz:** MIT  
**URL:** https://github.com/krayin/laravel-crm  
**Zweck:** Open-Source Laravel CRM mit Leads, Pipeline, Kontakten, Aktivitäten.

**Was nutzbar wäre:**
- Pipeline-Board Konzept (Kanban für Leads)
- Customer 360 Profil-Struktur
- Lead-Status-Workflow (new → contacted → qualified → converted)
- Aktivitäten-Timeline pro Kunde

**Was übernommen wurde:**
- Pipeline-Board Konzept in `app/leads-data.php` (hotmess_pipeline_board)
- Customer 360 Ansatz in `app/crm-data.php` (hotmess_customer_profiles)
- Lead-Status-Enum-Struktur

**Sicherheitsrisiken:**
- Laravel-spezifisch: direkter Code-Import nicht möglich
- Konzept-Inspiration ohne Code-Übernahme

**Entscheidung: NUR INSPIRATION — Konzepte übernommen, kein Code. MIT-kompatibel wenn Inspiration dokumentiert.**

---

## 6. endroid/qr-code (PHP QR Code Library)

**Lizenz:** MIT  
**URL:** https://github.com/endroid/qr-code  
**Zweck:** PHP-Library für QR-Code-Generierung (PNG, SVG, Binary).

**Was nutzbar wäre:**
- Server-seitige QR-Code-Generierung als PNG
- Kein externer Service, keine Client-JS-Abhängigkeit
- Kann als Base64-Bild inline eingebettet werden

**Entscheidung:** Aktuell verwenden wir **Client-seitige QR-Generierung via qrcode.js** (cdn.jsdelivr.net). Kein Composer-Dependency-Management nötig. endroid/qr-code wäre Fallback falls JS deaktiviert.

**Entscheidung: NICHT VERWENDET (aktuell) — Fallback-Option dokumentiert**

---

## 7. qrcode.js (via CDN)

**Lizenz:** MIT  
**URL:** https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js  
**Zweck:** JavaScript QR-Code-Generierung im Browser via Canvas.

**Was übernommen wurde:**
- **AKTIV VERWENDET** in `account-section.php` für Ticket-Wallet QR-Anzeige
- Canvas-basiert, kein Server-Request nötig
- `QRCode.toCanvas(canvas, data, options)` API

**Sicherheitsrisiken:**
- CDN-Abhängigkeit: bei CDN-Ausfall kein QR im Browser
- Fallback empfohlen: Server-seitiger QR via endroid/qr-code oder phpqrcode

**Entscheidung: AKTIV VERWENDET — MIT-Lizenz, sicher, CDN allowlist konform**

---

## Zusammenfassung

| Projekt | Lizenz | Entscheidung | Verwendung |
|---|---|---|---|
| raviagheda/event-ticket-registration | MIT | Nur Inspiration | QR-Konzept |
| systopia/eventcheckin | AGPL-3.0 | Nur Inspiration | Check-in Architektur |
| google-pay/wallet-samples | Apache 2.0 | Zukünftig verwenden | Google Wallet Guide |
| mevdschee/php-crud-api | MIT | NICHT verwenden | Sicherheitsrisiko |
| krayin/laravel-crm | MIT | Nur Inspiration | CRM-Konzepte |
| endroid/qr-code | MIT | Backup-Option | Falls JS-QR fehlt |
| qrcode.js | MIT | AKTIV verwendet | Ticket-Wallet QR |

---

## Nächste Schritte

1. **Google Wallet**: Service Account einrichten, JWT-Integration implementieren
2. **Apple Wallet**: PassKit-Zertifikat beantragen, PKPass-Bundle aufbauen
3. **QR Fallback**: phpqrcode als Inline-PHP für Nicht-JS-Umgebungen
