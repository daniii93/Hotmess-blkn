# HOTMESS Security RLS

RLS ist die Datenbankgrenze fuer Client-Zugriffe. Admin- und Payment-Prozesse laufen serverseitig ueber kontrollierte Funktionen mit Audit Log.

## Kein freier Admin-Chat-Zugriff

Admins duerfen Chatinhalte nicht frei durchsuchen. Zugriff ist nur bei Meldung, Sicherheitsfall oder Supportfall vorgesehen und muss protokolliert werden.

## Policies

- Nutzer lesen und bearbeiten eigene Daten.
- Admins koennen Nutzer, Orders und Tickets ueber serverseitig kontrollierte Rollen pruefen.
- Scanner koennen nur Tickets der zugewiesenen Events lesen.
- Chat ist nur fuer Teilnehmer lesbar.
- Event-Chat muss zusaetzlich ein gueltiges Ticket pruefen.

RLS ist auf allen vorbereiteten HOTMESS-Tabellen aktiviert. Tabellen ohne explizite Client-Policy bleiben dadurch standardmaessig geschlossen und koennen spaeter gezielt serverseitig oder per Policy geoeffnet werden.
