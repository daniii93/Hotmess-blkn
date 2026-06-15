# HotMess Environment Configuration

Central env access lives in `src/config/env.ts`.

## Required Core Keys

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `QR_HMAC_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Optional / Phase-2 Keys

- `STRIPE_IDENTITY_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_API_KEY`
- `DEEPL_API_KEY`
- `GIPHY_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

## Security Rules

- Never commit `.env`.
- Never expose service role keys to the client.
- Only `NEXT_PUBLIC_*` values may be used in browser code.
- Payment and QR secrets are server-only.
- Env validation must happen through `src/config/env.ts`.

