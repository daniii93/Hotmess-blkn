# HotMess Permission System

Permissions are centralized in:

- `src/types/roles.ts`
- `src/config/roles.ts`
- `src/lib/permissions/roles.ts`
- `src/lib/permissions/can.ts`
- `src/lib/permissions/guards.ts`

## Roles

- `guest`
- `user`
- `scanner`
- `admin`

## Guards

- `requireAuth`
- `requireVerified`
- `requireAdmin`
- `requireScanner`
- `requireFeature`
- `requireTicketForAddon`
- `requireTicketForEventChat`

## Rules

- Public routes may be viewed by guests.
- App routes require an authenticated user.
- Ticket purchase requires verification.
- Scanner routes require scanner or admin role.
- Admin routes require admin role.
- Add-on booking requires a valid ticket.
- Event chat requires a valid ticket for that event.

