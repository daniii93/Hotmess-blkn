# HotMess BLKN

HotMess BLKN is a PHP-based premium event, travel, membership, partner, concierge and operations platform.

## Requirements

- PHP 8.x with PDO MySQL.
- MySQL database.
- Apache with `.htaccess` rewrite support for clean routes.
- Optional: Supabase, Stripe, Resend, analytics and AI provider credentials.

## Local Run

The project currently runs as a PHP site. A portable PHP binary is available locally under `.tools/php/php.exe` in this workspace.

Basic local static/PHP server used during checks:

```powershell
python -m http.server 8090 --bind 127.0.0.1
```

Note: Python's built-in server does not process `.htaccess`. For clean routes such as `/events/...`, use Apache or test direct PHP entry files locally.

## Configuration

Copy `app/config.example.php` to `app/config.php` and add database credentials.

Do not commit:

- `app/config.php`
- `.env`
- migration/debug/reset scripts
- ZIP exports
- `.tools/`

## Validation

PHP lint:

```powershell
.tools\php\php.exe -l path\to\file.php
```

Full lint can be run over all PHP files excluding `.tools/`.

TypeScript structure exists for future Next/Supabase readiness, but `npm`, `npx` and `tsc` are not available in this local environment.

## Deployment Notes

- Upload changed PHP, CSS, docs and schema files via FTP.
- Do not upload real secrets.
- Temporary password reset or migration scripts must be deleted immediately after use.
- Public helper scripts are blocked in `.htaccess`.

## Current Admin

Admin login is managed in the live database. Rotate credentials after every operational reset.
