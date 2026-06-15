# HotMess Handoff fuer Claude

Stand: 14.06.2026
Projektpfad lokal: `C:\Users\PC\Documents\Webseite`

## Ziel

Dieses Projekt ist die HotMess Plattform als Next.js App mit Supabase/Stripe/PayPal/Resend/OneSignal Vorbereitung, PWA, Adminbereich und separatem Partner-Plattform-Geruest. Claude soll ab hier mit vollem Projektkontext weiterarbeiten koennen.

Wichtig: Keine bestehende Arbeit ungefragt loeschen oder zuruecksetzen. Der Git-Status ist absichtlich gross und teilweise dirty, weil alte PHP-Dateien, Legacy-Backups und neue Next.js-Dateien parallel im Workspace liegen.

## Aktueller technischer Stack

- Next.js `15.5.19`
- React `19.2.7`
- TypeScript `5.9.3`
- Tailwind CSS `3.4.17`
- Supabase SSR + Supabase JS
- Stripe, PayPal, Resend, OneSignal vorbereitet
- PWA manuell mit Manifest + Service Worker
- Partnerplattform unter `partner-platform/` vorbereitet

## Wichtige Befehle

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run build
npm.cmd run env:validate
npm.cmd run db:validate
```

Lokale Vorschau:

```text
http://127.0.0.1:3000/
```

Lokaler Demo-Admin:

```text
http://127.0.0.1:3000/demo-admin
```

`/demo-admin` setzt lokal fuer 8 Stunden den Cookie `hotmess_demo_admin=1` und leitet nach `/admin` weiter. Dieser Demo-Zugang funktioniert nur lokal auf `localhost`, `127.0.0.1` oder `0.0.0.0`. In Produktion bleibt der Adminbereich ueber echte Supabase-Rollen geschuetzt.

## Aktueller Domain-/Deployment-Status

Domain: `hotmess-blkn.app`

DNS wurde in Hostinger bereits auf Vercel gesetzt:

```text
hotmess-blkn.app       A      76.76.21.21
www.hotmess-blkn.app   CNAME  cname.vercel-dns.com
partner.hotmess-blkn.app CNAME cname.vercel-dns.com
```

Status zuletzt:

- DNS zeigt auf Vercel.
- Vercel liefert noch `404`, weil die Domain im Vercel-Projekt/deployment noch hinzugefuegt bzw. verbunden werden muss.
- HTTPS-Zertifikat wird erst sauber ausgestellt, wenn Vercel die Domain kennt.

Naechster Deployment-Schritt:

1. Vercel einloggen.
2. Projekt aus GitHub importieren oder bestehendes Projekt oeffnen.
3. Domains hinzufuegen:
   - `hotmess-blkn.app`
   - `www.hotmess-blkn.app`
   - `partner.hotmess-blkn.app` spaeter fuer Partnerprojekt
4. Environment Variables in Vercel setzen.
5. Deploy ausfuehren.

## Environment Variables

Beispiel-Dateien:

- `.env.example`
- `.env.production.example`
- `partner-platform/.env.production.example`

Secrets liegen lokal ggf. in `.env.local`. Diese Datei nicht in Chat-Ausgaben kopieren und nicht committen.

Wichtige Variablen:

```text
NEXT_PUBLIC_APP_URL=https://hotmess-blkn.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_IDENTITY_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
RESEND_API_KEY=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
QR_HMAC_SECRET=
```

Nur `NEXT_PUBLIC_*` darf clientseitig genutzt werden. Alle geheimen Keys nur serverseitig in Route Handlers, Server Actions oder Edge Functions verwenden.

## Wichtige Ordner und Dateien

```text
src/app/                         Next.js App Router
src/app/(public)/                 Landing, Login, Register, Public Pages
src/app/(app)/                    eingeloggte User-App
src/app/(admin)/                  Admin Dashboard
src/app/(scanner)/                Scanner Bereich
src/app/(api)/ oder src/app/api/  API/Webhooks, falls vorhanden
src/components/                   UI und Feature-Komponenten
src/lib/                          Supabase, Security, Domain-Logik
messages/de.json                  Deutsche i18n Texte
supabase/migrations/              Datenbank-Migrationen
supabase/functions/               Edge Function Gerueste
public/manifest.json              PWA Manifest
public/sw.js                      manueller Service Worker
public/icons/                     PWA Icons
docs/launch/                      Launch-/Vercel-/PWA-Dokumentation
partner-platform/                 separate Partnerplattform
legacy-php-app/                   archivierte alte PHP-App
legacy-supabase-migrations/       archivierte alte Migrationen
```

## Bereits umgesetzte Kernbereiche

### Teil 1 Auth/Profil/Onboarding

- Profile- und Auth-Grundlagen als Supabase Migrationen/Scaffold.
- Login/Register/Reset/Onboarding/Settings Routen vorbereitet.
- Middleware prueft Auth, Onboarding, Rollen, Dating/Business Flags.

### Teil 2 Events/Ticketing

- Event-, Ticket-, Order-, Waitlist-, Scanner- und QR-Grundmodelle vorbereitet.
- Eventlisten, Eventdetail, Checkout, Tickets, Scanner und Admin-Eventseiten als UI-Geruest vorhanden.
- Atomic Reservation/Stripe/PayPal/QR/Scanner Edge Function Gerueste vorbereitet.

### Teil 3a Social

- Feed, Stories, Chat, Notifications, Friends Activity und Explore als Geruest.
- Tabellen/Policies/Komponenten fuer Posts, Stories, Messages, Notifications, Suche vorbereitet.

### Teil 4 Dating

- Opt-in Dating, Profile, Swipe/Match, Event-Dating, Premium-Gates als Geruest.
- UI-Routen unter `/dating`.

### Teil 5 Business & Jobs

- Business Opt-in, Profile, Matches, Coffee Chats, Jobs, Gruppen und Business Plus als Geruest.
- UI-Routen unter `/business`.

### Teil 6 Admin

Adminbereich ist lokal sichtbar ueber `/demo-admin`.

Wichtige Adminrouten:

```text
/admin
/admin/events
/admin/events/hotmess-innsbruck/sales
/admin/events/hotmess-innsbruck/operations
/admin/events/hotmess-innsbruck/settlement
/admin/users
/admin/users/verifications
/admin/finance
/admin/partners
/admin/partners-program
/admin/codes
/admin/scanners
/admin/moderation
/admin/broadcast
/admin/analytics
/admin/settings
```

Auf `/admin` gibt es eine Funktionsmatrix "Alle Admin-Funktionen", damit man alle Adminbereiche schnell anklicken kann.

Relevante Dateien:

```text
src/app/(admin)/layout.tsx
src/app/(admin)/admin/page.tsx
src/components/admin/admin-dashboard-sections.tsx
messages/de.json
src/middleware.ts
src/app/(public)/demo-admin/route.ts
```

### Teil 7 Partnerplattform

- Separate Partnerplattform unter `partner-platform/`.
- Hauptapp bleibt fuer Kunden unsichtbar.
- Domain vorgesehen: `partner.hotmess-blkn.app`.

## PWA-Status

PWA wurde eingerichtet:

```text
public/manifest.json
public/sw.js
public/icons/
src/components/pwa/install-prompt.tsx
src/components/pwa/service-worker-register.tsx
src/app/layout.tsx
```

Hinweise:

- Es wird ein manueller Service Worker genutzt.
- `next-pwa` wurde entfernt, weil es eine unguenstige Audit-Kette hatte.
- Admin, Scanner, API, Auth und Payment-Seiten sollen nicht aggressiv gecacht werden.

## Lokaler Adminzugriff

Zum Testen:

```text
http://127.0.0.1:3000/demo-admin
```

Technisch:

- `src/app/(public)/demo-admin/route.ts` setzt den Cookie.
- `src/middleware.ts` erlaubt mit Cookie Zugriff auf App-, Dating-, Business-, Scanner- und Adminbereiche.
- Nur lokal aktiv.
- In Produktion muss ein echter User mit `profiles.role = 'admin'` existieren.

## Bekannte Besonderheiten

1. Der Workspace enthaelt noch viele alte PHP-Dateien im Root. Neue Next.js App liegt vor allem unter `src/`, `supabase/`, `public/`, `messages/`, `partner-platform/`.
2. Nicht blind `git reset --hard`, `git clean` oder alte Dateien loeschen.
3. Nach `next build` kann Next.js `.next/types/**/*.ts` in `tsconfig.json` eintragen. Falls das passiert und TypeScript/Commit stoert, pruefen und bereinigen.
4. Falls `next build` auf Windows mit `.next` Cache-Problemen aussteigt, `.next` vorsichtig entfernen und neu bauen.
5. Der In-App-Browser kann lokal manchmal auf `0.0.0.0` scheitern. Normaler Browser mit `http://127.0.0.1:3000/...` ist verlaesslicher.

## Empfohlene naechste Aufgaben fuer Claude

1. Lokale App starten:

```powershell
npm.cmd run dev
```

2. Admin ansehen:

```text
http://127.0.0.1:3000/demo-admin
```

3. Alle Adminrouten anklicken und fehlende/kaputte Seiten identifizieren.
4. Vercel-Projekt final verbinden und Domains in Vercel eintragen.
5. Supabase Migrationen gegen echtes Supabase-Projekt testen.
6. Einen echten Admin-User in Supabase anlegen:
   - User registrieren
   - in `profiles.role` auf `admin` setzen
   - MFA/2FA fuer echten Admin spaeter verpflichtend machen
7. Demo-Daten/Seed fuer Events, Tickets, Users, Posts, Jobs und Partner ergaenzen, damit alle Seiten lebendig wirken.
8. Danach echte Edge Functions und Zahlungswebhooks Schritt fuer Schritt produktionsreif machen.

## Copy-Paste Prompt fuer Claude

```text
Du arbeitest in meinem lokalen HotMess Projekt:
C:\Users\PC\Documents\Webseite

Bitte lies zuerst die Datei CLAUDE_HANDOFF_HOTMESS.md komplett. Du hast vollen Zugriff auf den Workspace und sollst die bestehende Arbeit nicht loeschen oder zuruecksetzen. Die neue Next.js App liegt vor allem in src/, supabase/, public/, messages/ und partner-platform/. Alte PHP-Dateien im Root sind Legacy und duerfen nicht blind entfernt werden.

Starte mit:
npm.cmd run typecheck
npm.cmd run dev

Lokaler Adminzugang:
http://127.0.0.1:3000/demo-admin

Meine Prioritaet:
1. Adminbereich komplett klickbar und sichtbar machen.
2. Fehlende Seiten mit realistischen Demo-Daten fuellen.
3. Vercel/Domain hotmess-blkn.app fuer Produktion vorbereiten.
4. Keine Secrets aus .env.local ausgeben oder committen.
```

