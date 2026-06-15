# HOTMESS RLS Konzept

RLS ist fuer alle sensiblen Tabellen vorbereitet. Oeffentliche Inhalte bleiben lesbar, sofern sie veroeffentlicht sind. Private Daten sind nur fuer den jeweiligen Nutzer oder spaeter ueber serverseitige Admin-Service-Role-Operationen erreichbar.

## Regeln

- Oeffentliche Events: nur `published`, `sold_out` und `completed`.
- Nutzer: Nutzer lesen nur das eigene User-Objekt.
- Tickets und Orders: nur eigene Datensaetze.
- Chat: nur Teilnehmer koennen Nachrichten lesen.
- Notifications: nur der jeweilige Empfaenger.
- Audit Logs: keine freie Client-Policy, nur serverseitig.

## Admin-Zugriff

Admin-Operationen sollen nicht ueber Client-RLS laufen. Dafuer ist spaeter ausschliesslich die serverseitige Service Role mit Audit Logging vorgesehen.
