# HotMess — Teil 9: Creator Economy, Marktplätze & Eat

Stand: 17. Juni 2026

## Plattform-Grundregel

HotMess hat keine aktiven nicht-verifizierten Profile.

Nicht verifiziert bedeutet:

- kein Feed
- keine Profilsuche
- keine Einsicht in andere Profile
- keine Chats
- keine Beiträge, Kommentare oder Likes
- keine Communities
- keine Events
- kein Dating
- kein Business
- keine Creator Economy
- keine lokalen Dienstleistungen
- kein KI-Marktplatz
- kein Eat

Erlaubt bleiben nur:

- Registrierung
- Profilanlage
- Verifizierungsprozess
- Einstellungen
- Support

Sichtbarkeitsregel:

```text
Nicht verifiziert = unsichtbar
Verifiziert = sichtbar
```

## Persönliches Profil

Jeder Nutzer besitzt ein persönliches Profil. Dieses Profil ist die Basis für Social, Events, Dating, Communities, Käufe, Bewertungen und Kommunikation.

Der Status liegt in `profiles.verification_status`:

- `pending`
- `verified`
- `rejected`
- `suspended`

Standard für neue Konten ist `pending`.

## Unternehmensprofil

Ein Unternehmensprofil ist optional, aber verpflichtend für Anbieterfunktionen.

Ein Unternehmensprofil darf nur von einer verifizierten Privatperson sinnvoll genutzt werden. Anbieterfunktionen werden erst freigegeben, wenn das Unternehmensprofil selbst `verified` ist.

Pflicht- und Prüffelder:

- offizieller Firmenname
- Anzeigename
- Rechtsform
- Firmenbuchnummer
- UID/USt-ID
- Geschäftsadresse
- Land
- Telefon
- geschäftliche E-Mail
- Website
- vertretungsberechtigte Person
- Bankdaten für Auszahlungen
- Admin-Prüfung

Unternehmensstatus:

- `pending`
- `verified`
- `rejected`
- `suspended`

## Anbieter-Module

Freigaben liegen in `business_profile_modules.module_key`:

- `business`
- `dating_entrepreneur`
- `creator_business`
- `local_services`
- `ai_marketplace`
- `eat_restaurant`
- `event_vendor`

Anbieterfunktionen dürfen nur genutzt werden, wenn:

```sql
business_profiles.verification_status = 'verified'
AND business_profile_modules.module_key = '<required_module>'
AND business_profile_modules.is_active = true
```

## Module

### HotMess Creator Economy

Ersetzt den alten Begriff HotMess Privat.

Opt-in-Modul für Creator, Coaches, Experten, Künstler, Veranstalter, Unternehmer und Communities.

Monetarisierung:

- Abos
- Premium-Communities
- exklusive Inhalte
- Pay-per-View
- Trinkgelder
- digitale Produkte
- Coachings
- Kurse
- Bundle-Verkäufe

Launch-Regel: nur jugendfrei/SFW.

### HotMess Lokale Dienstleistungen

MyHammer-ähnliches Modell:

- Privatprofile erstellen Anfragen
- verifizierte Dienstleister kaufen Leads oder senden Angebote
- Abschlüsse und Bewertungen laufen über HotMess

Erlöse:

- Lead-Verkauf
- Angebotsgebühren
- Erfolgsprovisionen
- Premium-Mitgliedschaften

### HotMess KI-Marktplatz

Marktplatz für:

- KI-Agenten
- Automatisierungen
- Prompt-Bibliotheken
- KI-Tools
- GPTs
- Workflows
- SaaS-Produkte

Nur verifizierte Unternehmensprofile mit Modul `ai_marketplace` dürfen Produkte veröffentlichen und verkaufen.

### HotMess Eat

Event-Commerce und Restaurant-Modul:

- Event-Vorbestellung
- QR-Abholung
- Partner-Lokale
- Food-Stände
- später Restaurant-Selbstlieferung

Nur verifizierte Unternehmensprofile mit Modul `eat_restaurant` dürfen Menüs veröffentlichen, Bestellungen annehmen und Auszahlungen erhalten.

### Unternehmer-Dating

Zusatzoption innerhalb von Dating.

Nur sichtbar/nutzbar, wenn ein verifiziertes Unternehmensprofil mit Modul `dating_entrepreneur` existiert.

## Technische Umsetzung

Umgesetzt in:

- `src/middleware.ts`
- `supabase/migrations/022_verified_platform_rule_part9.sql`

Middleware-Regel:

- unverifizierte Nutzer werden für App-Seiten auf `/verify?required=1` geleitet
- erlaubte Bereiche bleiben `/profile`, `/profile/edit`, `/settings`, `/verify`, `/onboarding`, `/logout`
- sensible APIs geben `403 Verifizierung erforderlich` zurück

RLS-Grundlage:

- `public.is_verified_user()`
- `public.has_verified_business_module(module_key)`
- zentrale Policies für Profile, Events, Posts, Kommentare, Likes, Chats, Follows, Dating und Business

## Sicherheitsziel

HotMess ist ein verifiziertes Ökosystem für echte Menschen, echte Unternehmen und geprüfte Anbieter.

Keine aktive Teilnahme ohne Identitätsprüfung.
Keine Anbieterfunktion ohne Unternehmensprüfung.
