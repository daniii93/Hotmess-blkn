# HOTMESS Verification

Verifikation ist mehrstufig vorbereitet:

- `email_verified`: Basis fuer Kontoaktivierung.
- `verification_status`: `unverified`, `pending`, `verified`, `rejected`.
- MVP: Stripe Identity.
- Alternative: manuelle Admin-Pruefung.

Ticketkauf, Scanner-Zugang und sensible Chat-Funktionen sollen nur fuer verifizierte Nutzer freigegeben werden.

## DSGVO-Regel

Ausweisdaten duerfen nicht dauerhaft in HOTMESS gespeichert werden. Gespeichert werden nur:

- `verification_status`
- `verified_at`
- `verification_provider`

Dokumente muessen nach Abschluss beim jeweiligen Verifikationsanbieter geloescht oder gemaess Provider-Regeln kurzzeitig verarbeitet werden.

## Notifications

Nach erfolgreicher oder abgelehnter Verifikation werden In-App-, E-Mail- und Push-Notifications vorbereitet. Der Versand darf den Verifikationsworkflow nicht blockieren.
