<?php

declare(strict_types=1);

function hotmess_legal_pages(): array
{
    return [
        'privacy' => ['title' => 'Datenschutzerklaerung', 'description' => 'Vorbereitete DSGVO-Struktur fuer HotMess. Nicht als finale Rechtsberatung verwenden.', 'sections' => ['Verantwortlicher', 'Datenkategorien', 'Zwecke der Verarbeitung', 'Rechtsgrundlagen', 'Empfaenger', 'Speicherdauer', 'Betroffenenrechte', 'Kontakt fuer Datenschutz']],
        'terms' => ['title' => 'Terms', 'description' => 'Vorbereitete Nutzungsbedingungen fuer Events, Membership, App, Partnerangebote und Concierge.', 'sections' => ['Leistungsumfang', 'Account', 'Tickets', 'Membership', 'Partnerangebote', 'Concierge', 'Haftung', 'Aenderungen']],
        'imprint' => ['title' => 'Impressum', 'description' => 'Platzhalter fuer rechtlich erforderliche Anbieterkennzeichnung.', 'sections' => ['Betreiber', 'Adresse', 'Kontakt', 'Vertretung', 'Registerdaten', 'Haftungshinweise']],
        'cookies' => ['title' => 'Cookie Policy', 'description' => 'Vorbereitung fuer Consent Management, notwendige Cookies, Analytics und Marketing Consent.', 'sections' => ['Notwendige Cookies', 'Analytics', 'Marketing', 'Consent Speicherung', 'Widerruf']],
    ];
}

function hotmess_system_status(): array
{
    return [
        'environment' => 'production-prepared',
        'mode' => getenv('NEXT_PUBLIC_SUPABASE_URL') ? 'supabase-ready' : 'mock-fallback',
        'integrations' => [
            ['name' => 'Supabase', 'status' => getenv('NEXT_PUBLIC_SUPABASE_URL') ? 'configured' : 'missing'],
            ['name' => 'Stripe', 'status' => getenv('STRIPE_SECRET_KEY') ? 'configured' : 'placeholder'],
            ['name' => 'Resend', 'status' => getenv('RESEND_API_KEY') ? 'configured' : 'mock-mail'],
            ['name' => 'OpenAI', 'status' => getenv('OPENAI_API_KEY') ? 'configured' : 'ai-ready-placeholder'],
            ['name' => 'Analytics', 'status' => getenv('ANALYTICS_WRITE_KEY') ? 'configured' : 'placeholder'],
        ],
        'deployments' => [['version' => '2026-06-02-platform', 'status' => 'latest', 'createdAt' => '2026-06-02']],
        'errors' => [['title' => 'No live error tracker connected', 'severity' => 'warning']],
        'tasks' => ['Connect email provider', 'Legal review', 'Configure backups', 'Production analytics review'],
    ];
}

function hotmess_audit_logs(): array
{
    return [
        ['id' => 'audit-login', 'userId' => 'admin', 'action' => 'login', 'entityType' => 'session', 'entityId' => 'admin', 'details' => 'Admin login verified', 'createdAt' => '2026-06-02 21:00'],
        ['id' => 'audit-event', 'userId' => 'admin', 'action' => 'event_update', 'entityType' => 'event', 'entityId' => 'hm-innsbruck-2026', 'details' => 'Mock event management prepared', 'createdAt' => '2026-06-02 20:20'],
        ['id' => 'audit-system', 'userId' => 'admin', 'action' => 'system_update', 'entityType' => 'security', 'entityId' => 'rate-limit', 'details' => 'Rate limit structure prepared', 'createdAt' => '2026-06-02 19:40'],
    ];
}

function hotmess_security_checks(): array
{
    return [
        ['area' => 'Roles', 'status' => 'prepared', 'detail' => 'Admin, partner, sponsor, member and city roles documented in TypeScript structures.'],
        ['area' => 'CSRF', 'status' => 'active', 'detail' => 'Existing forms use CSRF token verification.'],
        ['area' => 'XSS', 'status' => 'active', 'detail' => 'Output escaping helper e() is used in PHP templates.'],
        ['area' => 'Rate limiting', 'status' => 'prepared', 'detail' => 'TS rate-limit helper prepared for future API enforcement.'],
        ['area' => 'API protection', 'status' => 'prepared', 'detail' => 'Concierge API is read-only mock mode until provider is configured.'],
    ];
}
