# HotMess Masterplan v5.0

## Abschnitt 1/10: Vision, Business Foundation, Core Principles & Product Rules

Stand: 2026-06-12

Dieser Abschnitt ist das verbindliche Fundament fuer die weitere Umsetzung. Er ersetzt keine vorhandenen Funktionen und fuehrt keine isolierten Features ein. Bestehende HotMess-Funktionen bleiben erhalten und werden ueber zentrale Regeln, Feature Flags, Rollen und Journeys zusammengefuehrt.

## 0. Kritische Grundregel

HotMess ist eine geschlossene Event-, Ticketing-, Reise-, Add-on- und Social-Plattform fuer die Ex-Jugoslawien Diaspora in DACH und Italien.

Alle Funktionen muessen miteinander zusammenhaengen:

- Events erzeugen Ticketing.
- Ticketing ermoeglicht Add-ons.
- Add-ons setzen ein gueltiges Ticket voraus.
- QR-Tickets fuehren zur Einlasskontrolle.
- Check-in und Eventbesuch erzeugen Community- und Loyalty-Signale.
- Chat und Feed bauen auf Mitgliedschaft, Verifikation und Eventkontext auf.
- Admin steuert Events, Nutzer, Verifikationen, Add-ons, Tickets, Scanner, Waitlists, Revenue und Moderation.

Keine Funktion wird geloescht. Wenn eine Funktion nicht sichtbar sein soll, wird sie per Feature Flag als `hidden`, `disabled`, `beta` oder `future` markiert.

## 1. Produktvision

HotMess ist eine geschlossene Plattform fuer verifizierte Mitglieder der Ex-Jugoslawien Community in:

- Deutschland
- Oesterreich
- Schweiz
- Italien

HotMess kombiniert:

- kuratierte Events
- personalisierte Tickets
- Gender-Balance
- Hotelbuchungen
- Tischreservierungen
- Getraenkepakete
- Fast-Lane
- Geburtstagspakete
- Social Feed
- Event-Chat
- Community-Funktionen
- Admin-Steuerung
- Einlasskontrolle

Der Nutzer soll nicht nur ein Ticket kaufen. Der Nutzer entdeckt ein Event, sieht Community-Kontext, verifiziert sich, kauft ein personalisiertes Ticket, bucht optionale Add-ons, erhaelt ein QR-Ticket, nutzt Event-Chat, wird sicher eingelassen und bleibt danach Teil der HotMess Community.

## 2. Positionierung

HotMess ist nicht:

- Eventbrite
- Ticketmaster
- Tinder
- Instagram
- Facebook Events
- ein offener Marktplatz
- eine klassische Party-App
- eine Dating-App

HotMess ist ein exklusiver digitaler Members Club fuer Events, Reisen und Community.

Markenkern:

> HotMess ist nicht fuer jeden. Und das ist der Punkt.

## 3. Kernprinzipien

### Kuratiert

- Nur verifizierte Nutzer.
- Nur Admins erstellen Events.
- Keine fremden Veranstalter im MVP.
- Keine offenen Event-Erstellungen durch Nutzer.
- Events, Add-ons, Hotels, Tische, Getraenkepakete und Codes werden ueber Admin gesteuert.

### Balanciert

Jedes Event besitzt ein Gender-Balance-System mit getrennten Kontingenten:

- female
- male
- diverse

Wenn ein Kontingent voll ist, wird der Nutzer in die passende Warteliste gesetzt. Wenn ein reserviertes Ticket ablaeuft oder eine Zahlung fehlschlaegt, wird der naechste Nutzer aus der passenden Warteliste promoted.

### Sicher

Jedes Ticket ist:

- personalisiert
- mit echtem Profilnamen verbunden
- mit Profilfoto verbunden
- QR-basiert
- HMAC-signiert
- nicht uebertragbar
- nur einmal scanbar

Einlasser sehen beim Scan:

- Foto
- Name
- Geschlecht
- Event
- Ticketstatus
- Fast-Lane Status
- einlassrelevante Add-ons

## 4. Geschaeftsmodell Phase 1

HotMess ist in Phase 1 gleichzeitig:

- Veranstalter
- Plattformbetreiber
- Ticketverkaeufer
- Buchungsplattform fuer Add-ons
- Community-Plattform

Es gibt in Phase 1 keinen Marketplace und kein Stripe Connect. Alle Zahlungen laufen direkt an HotMess.

Zahlungsanbieter:

- Stripe
- PayPal

Verkauft werden:

1. Tickets
2. VIP Tickets
3. Hotelzimmer
4. Tischreservierungen
5. Getraenkepakete
6. Bottle-Service Upgrades
7. Fast-Lane
8. Geburtstagspakete
9. Fruechteplatten
10. Rabatt- und VIP-Codes

## 5. Ticket ist Pflicht

Ohne gueltiges Ticket kann kein Add-on gebucht werden.

Das gilt fuer:

- Hotel
- Tisch
- Getraenkepaket
- Fruechteplatte
- Bottle-Service
- Fast-Lane
- Geburtstagspaket

Diese Regel muss in Frontend, Checkout, API, Datenbankvalidierung und Admin-Logik durchgesetzt werden.

Fehlermeldung:

> Fuer dieses Add-on benoetigst du zuerst ein gueltiges Ticket.

## 6. Rollen

Die Rollen sind zentral in `src/config/roles.ts` definiert.

### Guest

Darf Landingpage, Event Preview, rechtliche Seiten, Login und Registrierung sehen. Darf keine geschuetzten Community-, Ticket-, Profil-, Chat- oder Add-on-Funktionen nutzen.

### User

Eingeloggt und verifiziert. Darf Feed nutzen, Events sehen, Tickets kaufen, Add-ons buchen, Event-Chat mit Ticket nutzen, folgen und Profile nach Privacy-Regeln ansehen.

### Scanner

Temporaerer Einlass-Account. Darf Scanner oeffnen, erlaubtes Event waehlen, QR-Codes scannen, Scan-Ergebnis sehen und Ticket als used markieren.

### Admin

HotMess Betreiber. Darf Events, Nutzer, Tickets, Add-ons, Hotels, Scanner-Zugaenge, Rabattcodes, Posts, Buchungen, Umsaetze, Broadcasts und Moderation verwalten.

## 7. Verifikation

Pflichtfelder bei Registrierung:

- Vorname
- Nachname
- E-Mail
- Passwort
- Geburtsdatum
- Geschlecht
- Profilbild
- Stadt
- Land

Regeln:

- Mindestalter 18 Jahre
- Klarname Pflicht
- Geschlecht Pflicht wegen Gender-Balance
- echtes Profilbild Pflicht
- keine anonymen Accounts

Verifikationsstatus:

- `unverified`
- `pending`
- `verified`
- `rejected`

Nur Nutzer mit `verification_status = "verified"` duerfen Tickets kaufen. Ausweisdaten werden nicht dauerhaft gespeichert, nur der Status.

## 8. Produkt-Hierarchie

1. Events
2. Ticketing
3. Add-ons
4. Einlasskontrolle
5. Community
6. Chat
7. Erweiterte Social Features

Spaetere Social Features wie Stories, Snap-Modus, Pokes, Musik-Sticker, Auto-Uebersetzung und Live-Standort bleiben als Future Feature Flags erhalten.

## 9. Haupt-Journeys

Die strukturierten Journeys liegen in `src/config/journeys.ts`:

- neuer Nutzer
- Ticketkauf mit freiem Kontingent
- Warteliste
- Gruppenbuchung
- Add-on Buchung
- Einlasskontrolle
- Admin Journey

## 10. Rechtliche Produktregeln

Zentral in `src/config/legal.ts`:

- Account ist Pflicht.
- Mindestalter 18 Jahre.
- Verifikation ist Pflicht fuer Ticketkauf.
- Tickets sind nicht uebertragbar.
- Kein Weiterverkauf.
- Kein Refund.
- QR-Code ist nur einmal gueltig.
- Ausweisdaten werden nicht dauerhaft gespeichert.
- Datenschutz, AGB und Impressum muessen sichtbar sein.
- In Phase 1 nur notwendige Cookies.

Checkout-Hinweise:

- Tickets sind personalisiert und nicht uebertragbar.
- Am Einlass wird dein Profilfoto mit deinem Ticket abgeglichen.
- Kein Rueckgaberecht nach erfolgreichem Kauf.

## 11. Technische Zielarchitektur

Langfristiger Zielstack:

- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand
- TanStack Query
- next-intl
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions
- Stripe
- PayPal
- Resend
- OneSignal
- Vercel

Aktuelle Live-Seite ist PHP/Hostinger. Diese Masterplan-Dateien dienen als typisiertes Fundament fuer den spaeteren Zielstack, ohne die bestehende Live-Plattform zu brechen.

## 12. Datenmodell-Grundregel

Das Datenmodell muss abdecken:

- users / profiles
- roles
- verification
- venues
- events
- gender config
- ticket types
- tickets
- waitlist
- orders
- split payments
- hotel partners
- hotel contingents
- hotel bookings
- event tables
- table bookings
- drink packages
- bottle service bookings
- fastlane bookings
- birthday packages
- discount codes
- follows
- posts
- likes
- comments
- event attendees
- conversations
- messages
- notifications
- scanner access

## 13. Sprache

Launch-Sprache ist Deutsch.

Regel fuer den spaeteren Next.js-Zielstack:

- `next-intl` vorbereiten
- keine hardcoded UI Strings im Zielstack
- UI-Texte ueber Translation Keys
- spaeter SR/HR und Italienisch moeglich

Event-Beschreibungen duerfen zusaetzlich SR/HR Freitext enthalten.

## 14. Implementierte Abschnitt-1-Dateien

- `src/config/features.ts`
- `src/config/product.ts`
- `src/config/roles.ts`
- `src/config/legal.ts`
- `src/config/journeys.ts`
- `src/types/features.ts`
- `src/types/roles.ts`
- `src/types/product.ts`
- `docs/masterplan/section-01-vision-business-foundation.md`

## 15. Akzeptanzstatus Abschnitt 1

Erfuellt:

- Produktvision dokumentiert.
- Kernprinzipien als technische Regeln abgebildet.
- Feature Flags vorhanden.
- Rollenlogik zentral definiert.
- Produkt-Hierarchie dokumentiert.
- Haupt-User-Journey strukturiert.
- Ticket-, Add-on-, Gruppenbuchung-, Scanner-, Community- und Admin-Logik verbunden.
- Keine bestehende Funktion geloescht.
- Spaetere Features nicht entfernt, sondern als `future` oder `disabled` markiert.
- Texte in den TypeScript-Konfigurationen als Translation Keys vorbereitet.

