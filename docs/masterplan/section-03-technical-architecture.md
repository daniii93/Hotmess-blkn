# HotMess Masterplan v5.0

## Abschnitt 3/10: Technische Architektur, Projektstruktur, Standards & Grundsetup

Stand: 2026-06-12

Dieser Abschnitt definiert die technische Zielarchitektur und bereitet das Projekt fuer Auth, Datenbank, Events, Ticketing, Checkout, Add-ons, Scanner, Feed, Chat, Admin, Notifications und Deployment vor.

Die aktuelle Live-Seite bleibt PHP/Hostinger-basiert. Die in diesem Abschnitt angelegten `src/*` Dateien bilden das typisierte Fundament fuer den geplanten Next.js/Supabase-Zielstack und loeschen keine bestehende Funktion.

## Tech Stack

Verbindlicher Zielstack:

- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui
- Framer Motion
- next-intl
- Zustand
- TanStack Query v5
- Supabase Auth, PostgreSQL, Storage, Realtime, Edge Functions
- Stripe
- PayPal
- Stripe Identity
- Resend und React Email
- OneSignal
- qrcode und html5-qrcode
- Vercel
- Zod, react-hook-form, zodResolver

`package.json` dokumentiert diesen Zielstack. Dependencies wurden nicht installiert, damit die aktuelle PHP-Live-Seite nicht unkontrolliert veraendert wird.

## Projektstruktur

Vorbereitet:

- `src/app`
- `src/components`
- `src/config`
- `src/constants`
- `src/features`
- `src/hooks`
- `src/lib`
- `src/server`
- `src/stores`
- `src/types`
- `src/schemas`
- `src/styles`
- `src/emails`
- `src/middleware`
- `supabase/migrations`
- `supabase/functions`
- `supabase/seed`
- `tests/e2e`
- `tests/unit`

Regel: Fachlogik gehoert nicht in UI-Komponenten. UI zeigt Daten an. Server Actions, Queries, Mutations und Edge Functions enthalten Geschaeftslogik.

## TypeScript Standards

`tsconfig.json` ist auf strict ausgelegt und wurde erweitert um:

- `noUncheckedIndexedAccess`
- `noImplicitOverride`
- `noFallthroughCasesInSwitch`
- TSX-Unterstuetzung
- JSON-Imports

Keine `any` ohne technische Begruendung.

## Env

Zentrale Env-Validierung:

- `src/config/env.ts`

Kern-Keys werden validiert, Phase-2-Keys sind optional. Service Role Keys sind nur serverseitig vorgesehen.

## Supabase Clients

Vorbereitet:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/middleware.ts`

Trennung:

- Browser Client nur mit Public Keys.
- Server Client fuer Server Components und Actions.
- Admin Client nur serverseitig mit Service Role.
- Middleware fuer Session Refresh.

## Permissions

Vorbereitet:

- `src/lib/permissions/roles.ts`
- `src/lib/permissions/can.ts`
- `src/lib/permissions/guards.ts`

Rollen:

- `guest`
- `user`
- `scanner`
- `admin`

Guards:

- `requireAuth`
- `requireVerified`
- `requireAdmin`
- `requireScanner`
- `requireFeature`
- `requireTicketForAddon`
- `requireTicketForEventChat`

## Feature Flags

`src/config/features.ts` enthaelt aktive, Beta-, future-, hidden- und disabled-Features. Nicht benoetigte Features werden niemals geloescht.

## Status Types

Zentral:

- `src/types/status.ts`

Enthaelt Verification, Event, Ticket, Waitlist, Order, Booking und Scan Result Status.

## API Response Standard

Zentral:

- `src/types/api.ts`

Alle spaeteren Actions und Edge Functions sollen `ApiResponse<T>` nutzen.

## Error Handling

Vorbereitet:

- `src/lib/errors/app-error.ts`
- `src/lib/errors/error-codes.ts`
- `src/lib/errors/to-api-error.ts`

Fehler werden mit `code` und `messageKey` abgebildet.

## i18n

Vorbereitet:

- `messages/de.json`
- `messages/sr-latn.json`
- `messages/it.json`
- `src/lib/i18n/routing.ts`
- `src/lib/i18n/request.ts`
- `src/middleware.ts`

Deutsch ist Launch-Sprache.

## Layout Shells

Vorbereitet:

- `PublicLayout`
- `AuthLayout`
- `AppLayout`
- `AdminLayout`
- `ScannerLayout`

Admin und Scanner bleiben visuell und rollenlogisch getrennt.

## Third Party Clients

Vorbereitet:

- Stripe Client/Server
- PayPal Client/Server
- Resend Client
- OneSignal Config
- QR HMAC Sign/Verify

Keine vollstaendige Paymentlogik in diesem Abschnitt.

## Security Standards

- Keine Secrets im Client.
- Service Role nur serverseitig.
- QR Signatur niemals clientseitig erzeugen.
- Zahlungsstatus niemals clientseitig vertrauen.
- Admin-/Scannerzugriff immer serverseitig pruefen.
- Add-on Buchung immer mit Ticket pruefen.

## Testing

Vorbereitet:

- `tests/e2e`
- `tests/unit`

Testfaelle folgen in spaeteren Abschnitten.

## Definition of Done

Abschnitt 3 ist erfuellt, weil:

- Projektstruktur vorbereitet ist.
- Zielstack dokumentiert ist.
- TypeScript strict erweitert wurde.
- Env Config zentral existiert.
- Supabase Clients getrennt sind.
- Permission System vorbereitet ist.
- Feature Flags vorhanden sind.
- Status Types zentral definiert sind.
- API Response Standard existiert.
- Error Handling vorbereitet ist.
- i18n Setup vorbereitet ist.
- Layout Shells existieren.
- Middleware vorbereitet ist.
- Third Party Clients gekapselt sind.
- QR Sign/Verify vorbereitet ist.
- Keine Businesslogik erfunden oder geloescht wurde.

