# Abschnitt 5/10: Auth, Verification, Rollen und Security

HOTMESS verwendet im MVP eigene Konten. Google und Apple sind nur als Phase-2-`future` Flags vorbereitet und nicht aktiv.

## Umgesetzt

- Auth Session Typen in `src/lib/auth/session.ts`.
- Verification Guards in `src/lib/auth/verification.ts`.
- Identity Verification Record Helper in `src/lib/auth/identity.ts`.
- Security Helper fuer Rate Limits und Storage Uploads.
- Route Access Matrix in `src/lib/security/route-access.ts`.
- Audit Event Helper.
- Security Dokumentation in `docs/security`.
- RLS Policies fuer Nutzer, Tickets, Orders, Posts, Chat, Scanner Assignments und Storage Buckets.
- Audit-Event-Katalog in `src/lib/audit/events.ts`.
- Suspicious-Activity-Basis in `src/lib/security/suspicious-activity.ts`.
- Scanner-Datenminimierung in `src/lib/security/scanner-scope.ts`.
- Verification Notification Trigger in `src/lib/auth/verification-notifications.ts`.

## Sicherheitsgrundsatz

Oeffentliche Seiten bleiben offen. Geschuetzte Aktionen werden ueber Login, E-Mail-Verifikation, Rolle und Safety-Status vorbereitet.

## Core-Rollen

Abschnitt 5 nutzt bewusst nur:

- `user`
- `scanner`
- `admin`

Membership-Stufen bleiben Produkt-/Billing-Zustaende, aber keine Basis-Security-Rollen.
