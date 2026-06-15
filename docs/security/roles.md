# HOTMESS Rollen

Vorbereitete Rollen:

- `user`
- `admin`
- `scanner`

Rollen sollen ueber zentrale Permission-Guards ausgewertet werden. Kein UI darf allein ueber Sichtbarkeit absichern; serverseitige Pruefung bleibt Pflicht.

## Rechte

`user` darf Feed, Events, Tickets, Add-ons, Profile und Chat nutzen.

`scanner` darf QR-Codes scannen, Status sehen und Einlass bestaetigen. Scanner sehen nur Name, Foto, Geschlecht und Ticketstatus.

`admin` darf alles, aber jede kritische Aktion muss im Audit Log landen.

## Scanner-Datenminimierung

Scanner duerfen keine E-Mail-Adressen, Adressen, Zahlungsdaten oder vollstaendige Bestellungen sehen. Dafuer ist ein eigener Scanner-View im Code vorbereitet.
