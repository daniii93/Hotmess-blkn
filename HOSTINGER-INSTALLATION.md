# HOTMESS BLKN Installation auf Hostinger

## 1. Datenbank erstellen

Erstelle im Hostinger hPanel eine MySQL-Datenbank und notiere:

- Datenbank-Host
- Datenbankname
- Datenbankbenutzer
- Datenbankpasswort

## 2. Konfiguration anlegen

Kopiere `app/config.example.php` zu `app/config.php` und trage die Hostinger-Daten ein.

```php
const DB_HOST = 'localhost';
const DB_NAME = 'dein_datenbankname';
const DB_USER = 'dein_datenbankuser';
const DB_PASS = 'dein_passwort';
const APP_URL = 'https://hotmess-blkn.com';
const ADMIN_EMAIL = 'deine-admin-mail@example.com';
```

`app/config.php` darf nicht öffentlich geteilt werden.

## 3. Tabellen importieren

Öffne phpMyAdmin bei Hostinger und importiere den Inhalt von `app/schema.sql`.

## 4. Dateien hochladen

Lade alle Dateien und Ordner in den Webspace von `hotmess-blkn.com`, normalerweise in `public_html`.

Wichtig: `index.php` muss im Hauptordner liegen.

## 5. Admin erstellen

Lege nach dem Import einen Admin in phpMyAdmin an oder führe per SSH aus:

```bash
php app/create-admin.php "HOTMESS Admin" "admin@hotmess-blkn.com" "sicheres-passwort"
```

Wenn Hostinger kein SSH bereitstellt, sag mir Bescheid, dann erstelle ich dir einen SQL-Befehl für phpMyAdmin.

## 6. Ablauf für Mitglieder

1. Kunde erstellt Account mit Name, E-Mail, Stadt und Instagram-Handle.
2. Kunde bestätigt, dass er `@hotmess.blkn.clubbing` folgt.
3. Kunde sendet Waitlist-Anfrage.
4. Admin prüft Instagram/Stadt/Community-Fit in `admin.php`.
5. Admin setzt Status auf `Zugelassen` oder `Abgelehnt`.
6. Ticketseite wird nur für zugelassene Mitglieder sichtbar.

## Hinweis zur Instagram-Prüfung

Instagram erlaubt für normale Websites keinen zuverlässigen automatischen Check, ob ein bestimmter User einem Profil folgt. Deshalb ist die sichere Version eine manuelle Prüfung über den angegebenen Instagram-Handle und die Admin-Mitgliederliste.

