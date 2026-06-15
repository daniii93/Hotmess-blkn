# HotMess Deployment und PWA Launch

Stand: Juni 2026

## Ziel-Domains

- Haupt-App: `https://hotmess-blkn.app`
- Partner-App: `https://partner.hotmess-blkn.app`
- Lokale Haupt-App: `http://127.0.0.1:3000`
- Lokale Partner-App: `http://127.0.0.1:3001`

Die Kunden-App enthaelt keinen Link zur Vertriebspartner-Plattform. `partner.hotmess-blkn.app` wird als eigenes Vercel-Projekt aus `partner-platform/` deployed.

## Vercel Projekte

### Haupt-App

- Framework Preset: Next.js
- Root Directory: Repository Root
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`

### Partner-App

- Framework Preset: Next.js
- Root Directory: `partner-platform`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`

## Environment Variables in Vercel

Diese Variablen im Vercel-Projekt der Haupt-App hinterlegen. `NEXT_PUBLIC_*` sind clientseitig sichtbar, alle anderen bleiben serverseitig.

```env
NEXT_PUBLIC_APP_URL=https://hotmess-blkn.app
NEXT_PUBLIC_SITE_URL=https://hotmess-blkn.app
SITE_URL=https://hotmess-blkn.app

SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_IDENTITY_WEBHOOK_SECRET=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=

RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@hotmess-blkn.app
RESEND_REPLY_TO_EMAIL=hello@hotmess-blkn.app

NEXT_PUBLIC_ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=

QR_HMAC_SECRET=
DEEPL_API_KEY=
GIPHY_API_KEY=
```

Partner-App:

```env
NEXT_PUBLIC_APP_URL=https://partner.hotmess-blkn.app
NEXT_PUBLIC_MAIN_APP_URL=https://hotmess-blkn.app
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Hostinger DNS fuer Vercel

In Vercel zuerst die Domain zum Projekt hinzufuegen. Vercel zeigt danach die genauen DNS-Werte.

Typischer Aufbau:

```txt
hotmess-blkn.app          A      76.76.21.21
www.hotmess-blkn.app      CNAME  cname.vercel-dns.com
partner.hotmess-blkn.app  CNAME  cname.vercel-dns.com
```

Wenn Hostinger bereits eigene Records fuer die Domain hat, alte A-/CNAME-Records fuer Webhosting entfernen oder ersetzen. MX-Records fuer E-Mail nicht loeschen.

## Webhook URLs

Nach dem Domain-Connect in den Zahlungsdiensten setzen:

```txt
Stripe Checkout:  https://hotmess-blkn.app/api/webhooks/stripe
Stripe Identity:  https://hotmess-blkn.app/api/webhooks/stripe-identity
PayPal:           https://hotmess-blkn.app/api/webhooks/paypal
```

Danach die neu erzeugten Secrets in Vercel aktualisieren:

```env
STRIPE_WEBHOOK_SECRET=
STRIPE_IDENTITY_WEBHOOK_SECRET=
PAYPAL_WEBHOOK_ID=
```

Vor Live-Schaltung im Stripe-Testmodus einen kompletten Ticketkauf testen.

## PWA

Implementiert:

- `public/manifest.json`
- Icons in `public/icons/`
- eigener Service Worker in `public/sw.js`
- globale Registrierung ueber `ServiceWorkerRegister`
- Installationskomponente `InstallPrompt`
- Landing-Abschnitt "HotMess auf deinem Handy"

Caching-Regel:

- statische Assets und Bilder werden gecacht
- `/admin`, `/scanner`, `/api`, Auth-Flows, Checkout, Verify und Onboarding bleiben Network-only bzw. vom Navigations-Fallback ausgeschlossen
- Scanner-Offline-Cache bleibt separat als IndexedDB-Funktion geplant

Hinweis: `@ducanh2912/next-pwa` wurde wegen einer aktuellen High-Severity-Audit-Kette in Workbox/Terser nicht eingebunden. Die manuelle Variante erfuellt die Installierbarkeit ohne zusaetzlichen PWA-Build-Stack.

## Go-Live Check

1. `npm run db:validate`
2. `npm run typecheck`
3. `npm run build`
4. Vercel Preview pruefen
5. Domain verbinden
6. Webhooks auf Produktionsdomain setzen
7. Lighthouse PWA Audit ausfuehren
8. iPhone Safari: "Zum Home-Bildschirm" testen
9. Android Chrome: Install Prompt testen
10. Stripe Testkauf durchspielen
