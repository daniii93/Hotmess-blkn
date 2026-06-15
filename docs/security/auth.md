# HOTMESS Auth

HOTMESS nutzt im MVP eigene Benutzerkonten mit E-Mail und Passwort. Google und Apple sind nur als Phase-2-Feature-Flags `future` vorbereitet und nicht aktiv.

## Pflichtfluss

1. Registrierung mit Vorname, Nachname, E-Mail und Passwort.
2. Geburtsdatum und Geschlecht erfassen.
3. Echtes Profilfoto hochladen.
4. Stadt und Land erfassen.
5. E-Mail-Verifizierung.
6. Onboarding.
7. Feed.

## Mindestalter

HOTMESS ist 18+. Die Registrierung muss serverseitig blockieren, wenn Nutzer juenger als 18 sind. Die Fehlermeldung lautet:

`Du musst mindestens 18 Jahre alt sein.`

## Geschuetzte Bereiche

- Account
- Tickets
- Membership
- Chat
- Scanner
- Admin

Oeffentliche Landingpages bleiben ohne Login sichtbar.

## Keine Gastkaeufe

Ticketkauf ist nur fuer `verification_status = verified` erlaubt. Nicht verifizierte Nutzer werden in den Verifikationsfluss geleitet.

## Suspicious Activity

Rate Limiting, IP Velocity, Failed Login Tracking, Verification Retries und Scanner-Mismatches sind als Phase-2-Signale vorbereitet. Sie duerfen spaeter nur serverseitig ausgewertet werden.
