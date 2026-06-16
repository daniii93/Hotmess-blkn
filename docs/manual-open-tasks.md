# Manuelle offene Aufgaben

Stand: 15. Juni 2026

Diese Punkte sind bewusst nicht im Code automatisiert, weil sie externe Provider- oder Dashboard-Aktionen brauchen.

## Teil 2 - Events & Ticketing

- Supabase Migration `supabase/migrations/009_finalize_ticketing_part2.sql` im Supabase SQL Editor ausfuehren.
- Vercel Environment Variables pruefen/setzen:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
  - optional `PAYPAL_ENV=live`
  - optional `CRON_SECRET`
- Stripe Webhook einrichten:
  - `https://www.hotmess-blkn.app/api/webhooks/stripe`
- PayPal Webhook einrichten:
  - `https://www.hotmess-blkn.app/api/webhooks/paypal`
- Cron alle 60 Sekunden einrichten:
  - `https://www.hotmess-blkn.app/api/cron/expire-reservations`
- Stripe/PayPal im Testmodus je einmal komplett durchspielen.
- Danach Service Role/Secret Key rotieren, weil ein Supabase Secret im Chat sichtbar geteilt wurde.

## Teil 3a - Social-Kern

- Supabase Migration `supabase/migrations/010_social_core_runtime.sql` im Supabase SQL Editor ausfuehren.
- Danach Feed, Chat, Notifications und Explore mit einem echten eingeloggten Testnutzer pruefen.

## Teil 4 - Dating

- Supabase Migration `supabase/migrations/004_dating_part4.sql` im Supabase SQL Editor ausfuehren, falls noch nicht passiert.
- Danach die neue Dating-Runtime-Migration aus diesem Arbeitsblock ebenfalls im Supabase SQL Editor ausfuehren.

## Teil 5 - Business & Jobs

- Supabase Migration `supabase/migrations/005_business_jobs_part5.sql` im Supabase SQL Editor ausfuehren, falls noch nicht passiert.
- Danach die neue Business-Runtime-Migration aus diesem Arbeitsblock ebenfalls im Supabase SQL Editor ausfuehren.
- Business-Profil, Verbindung und Job-Bewerbung mit zwei echten Testnutzern pruefen.

## Teil 6 - Admin-Dashboard

- Supabase Migration `supabase/migrations/006_admin_dashboard_part6.sql` im Supabase SQL Editor ausfuehren, falls noch nicht passiert.
- Admin-Account in Supabase erstellen und `profiles.role='admin'` setzen.
- Danach `/admin`, `/admin/users`, `/admin/moderation`, `/admin/finance` und `/admin/analytics` mit echtem Admin-Login pruefen.

## Teil 7 - Vertriebspartner-Plattform

- Supabase Migration `supabase/migrations/007_partner_platform_part7.sql` im Supabase SQL Editor ausfuehren, falls noch nicht passiert.
- Vercel-Projekt fuer `partner.hotmess-blkn.app` separat aus `partner-platform` deployen.
- Environment Variables im Partner-Projekt setzen: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `NEXT_PUBLIC_APP_URL=https://partner.hotmess-blkn.app`.
- Domain/Subdomain `partner.hotmess-blkn.app` in Vercel verbinden.
- Vor Launch: Anwaltspruefung Vertriebsrecht AT/DE und Steuerberater-Freigabe dokumentieren.
- Tracking live testen: `/r/[code]` -> Hauptplattform mit `ref`, Ticketkauf -> `attribute-sale`, Event completed -> `confirm-commissions`, Auszahlung -> Admin-Freigabe.
