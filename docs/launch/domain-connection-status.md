# Domain-Verbindung: hotmess-blkn.app

Stand: Juni 2026

## Aktueller DNS-Status

Lokale Pruefung:

```txt
hotmess-blkn.app      A      2.57.91.91
www.hotmess-blkn.app  CNAME  hotmess-blkn.app
partner.hotmess-blkn.app: kein Record gefunden
```

Das bedeutet: Die Hauptdomain zeigt aktuell noch auf Hostinger-Webhosting, nicht auf Vercel.

## Zielzustand fuer Vercel

Sobald die Haupt-App in Vercel als Projekt angelegt ist:

```txt
hotmess-blkn.app      A      76.76.21.21
www.hotmess-blkn.app  CNAME  cname.vercel-dns.com
```

Sobald die Partner-App als eigenes Vercel-Projekt mit Root Directory `partner-platform` angelegt ist:

```txt
partner.hotmess-blkn.app  CNAME  cname.vercel-dns.com
```

## Wichtig

- MX-Records fuer E-Mail nicht loeschen.
- Alte A-/CNAME-Records fuer Webhosting ersetzen, wenn die Domain zu Vercel zeigen soll.
- Nach DNS-Aenderung in Vercel unter `Settings -> Domains` warten, bis beide Status gruen sind.
- HTTPS-Zertifikate werden von Vercel automatisch erstellt.

## Produktionsdaten

Die Produktions-URL ist in den Env-Vorlagen vorbereitet:

- Haupt-App: `.env.production.example`
- Partner-App: `partner-platform/.env.production.example`

Diese Werte in Vercel als Environment Variables eintragen. Keine echten Secrets in Git speichern.
