# HotMess Project Structure

This document defines the target Next.js/Supabase structure while the current live project remains PHP/Hostinger based.

## Target Structure

```txt
src/
  app/
    (public)/
    (auth)/
    (app)/
    (admin)/
    (scanner)/
    api/
  components/
    ui/
    layout/
    forms/
    events/
    tickets/
    checkout/
    addons/
    feed/
    chat/
    admin/
    scanner/
  config/
  constants/
  features/
  hooks/
  lib/
  server/
    actions/
    queries/
    mutations/
  stores/
  types/
  schemas/
  styles/
  emails/
  middleware/
supabase/
  migrations/
  functions/
  seed/
tests/
  e2e/
  unit/
```

## Rules

- UI components display data and emit user intent.
- Queries read only.
- Mutations change data.
- Actions connect UI to validated server logic.
- Critical business logic such as reservation, payment confirmation and scan validation must not run in the browser.
- Empty route shells are allowed, fake business logic is not.

