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
