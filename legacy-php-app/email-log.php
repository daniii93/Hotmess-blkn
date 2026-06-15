<?php

declare(strict_types=1);

require_once __DIR__ . '/email-service.php';

function hotmess_email_latest_log(): ?array
{
    $logs = hotmess_email_logs(1);
    return $logs[0] ?? null;
}

function hotmess_email_status_label(string $status): string
{
    return [
        'queued' => 'Warteschlange',
        'sent' => 'Gesendet',
        'failed' => 'Fehlgeschlagen',
        'skipped_provider_missing' => 'Provider fehlt',
    ][$status] ?? $status;
}
