<?php

declare(strict_types=1);

require_once __DIR__ . '/email-templates.php';

function isEmailProviderConfigured(): bool
{
    return trim((string) getenv('RESEND_API_KEY')) !== '';
}

function hotmess_email_from(): string
{
    return trim((string) getenv('RESEND_FROM_EMAIL')) ?: 'no-reply@hotmess-blkn.com';
}

function hotmess_email_reply_to(): string
{
    return trim((string) getenv('RESEND_REPLY_TO_EMAIL')) ?: 'hello@hotmess-blkn.com';
}

function hotmess_ensure_email_log_table(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS email_logs (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          to_email VARCHAR(190) NOT NULL,
          subject VARCHAR(190) NOT NULL,
          template_key VARCHAR(120) NULL,
          status ENUM('queued', 'sent', 'failed', 'skipped_provider_missing') NOT NULL DEFAULT 'queued',
          provider VARCHAR(80) NOT NULL DEFAULT 'mock',
          provider_message_id VARCHAR(190) NULL,
          error_message TEXT NULL,
          meta_json JSON NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX email_logs_status_idx (status, created_at),
          INDEX email_logs_template_idx (template_key, created_at),
          INDEX email_logs_to_idx (to_email, created_at)
        )"
    );
}

function hotmess_sanitize_provider_error(string $message): string
{
    $apiKey = (string) getenv('RESEND_API_KEY');
    if ($apiKey !== '') {
        $message = str_replace($apiKey, '[redacted]', $message);
    }

    return function_exists('mb_substr') ? mb_substr($message, 0, 900) : substr($message, 0, 900);
}

function logEmailAttempt(string $to, string $subject, ?string $templateKey, string $status, ?string $providerResponse = null, array $meta = []): int
{
    try {
        hotmess_ensure_email_log_table();
        $provider = isEmailProviderConfigured() ? 'resend' : 'mock';
        $response = $providerResponse ? json_decode($providerResponse, true) : null;
        $messageId = is_array($response) ? (string) ($response['id'] ?? '') : '';
        $error = '';
        if ($status === 'failed' || $status === 'skipped_provider_missing') {
            $error = $providerResponse ? hotmess_sanitize_provider_error($providerResponse) : null;
        }
        db()->prepare(
            'INSERT INTO email_logs (to_email, subject, template_key, status, provider, provider_message_id, error_message, meta_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $to,
            $subject,
            $templateKey,
            $status,
            $provider,
            $messageId !== '' ? $messageId : null,
            $error,
            json_encode($meta, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        ]);

        return (int) db()->lastInsertId();
    } catch (Throwable) {
        return 0;
    }
}

function getEmailProviderStatus(): array
{
    $lastLog = null;
    try {
        hotmess_ensure_email_log_table();
        $lastLog = db()->query('SELECT * FROM email_logs ORDER BY created_at DESC, id DESC LIMIT 1')->fetch() ?: null;
    } catch (Throwable) {
    }

    return [
        'provider' => isEmailProviderConfigured() ? 'resend' : 'mock',
        'configured' => isEmailProviderConfigured(),
        'fromEmail' => hotmess_email_from(),
        'replyToEmail' => hotmess_email_reply_to(),
        'postmarkPrepared' => trim((string) getenv('POSTMARK_SERVER_TOKEN')) !== '',
        'lastLog' => $lastLog,
    ];
}

function hotmess_resend_api_request(array $payload): array
{
    $apiKey = trim((string) getenv('RESEND_API_KEY'));
    if ($apiKey === '') {
        throw new RuntimeException('RESEND_API_KEY fehlt.');
    }

    $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new RuntimeException('E-Mail Payload konnte nicht serialisiert werden.');
    }

    if (function_exists('curl_init')) {
        $curl = curl_init('https://api.resend.com/emails');
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 12,
        ]);
        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        if ($body === false || $status < 200 || $status >= 300) {
            throw new RuntimeException($error !== '' ? $error : 'Resend HTTP Status ' . $status . ': ' . (string) $body);
        }

        return json_decode((string) $body, true) ?: ['raw' => (string) $body];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: Bearer {$apiKey}\r\nContent-Type: application/json\r\n",
            'content' => $json,
            'timeout' => 12,
        ],
    ]);
    $body = @file_get_contents('https://api.resend.com/emails', false, $context);
    if ($body === false) {
        throw new RuntimeException('Resend Request fehlgeschlagen.');
    }

    return json_decode($body, true) ?: ['raw' => $body];
}

function sendEmail(string $to, string $subject, string $html, ?string $text = null, array $meta = []): array
{
    $to = trim($to);
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        logEmailAttempt($to, $subject, $meta['templateKey'] ?? null, 'failed', 'Ungueltige E-Mail-Adresse.', $meta);
        return [
            'success' => false,
            'status' => 'failed',
            'provider' => 'resend',
            'message' => 'Ungueltige E-Mail-Adresse.',
        ];
    }

    if (!isEmailProviderConfigured()) {
        logEmailAttempt($to, $subject, $meta['templateKey'] ?? null, 'skipped_provider_missing', 'RESEND_API_KEY fehlt. E-Mail wurde nur geloggt.', $meta);
        return [
            'success' => false,
            'status' => 'skipped_provider_missing',
            'provider' => 'mock',
            'message' => 'Provider nicht konfiguriert. E-Mail wurde geloggt.',
        ];
    }

    $payload = [
        'from' => 'HOTMESS <' . hotmess_email_from() . '>',
        'to' => [$to],
        'subject' => $subject,
        'html' => $html,
        'text' => $text ?: strip_tags($html),
        'reply_to' => hotmess_email_reply_to(),
    ];

    try {
        $response = hotmess_resend_api_request($payload);
        logEmailAttempt($to, $subject, $meta['templateKey'] ?? null, 'sent', json_encode($response, JSON_UNESCAPED_SLASHES), $meta);
        return [
            'success' => true,
            'status' => 'sent',
            'provider' => 'resend',
            'message' => 'E-Mail wurde gesendet.',
            'providerResponse' => $response,
        ];
    } catch (Throwable $exception) {
        $error = hotmess_sanitize_provider_error($exception->getMessage());
        logEmailAttempt($to, $subject, $meta['templateKey'] ?? null, 'failed', $error, $meta);
        return [
            'success' => false,
            'status' => 'failed',
            'provider' => 'resend',
            'message' => $error,
        ];
    }
}

function sendTemplateEmail(string $templateKey, string $to, array $data = [], array $meta = []): array
{
    $rendered = hotmess_render_email_template($templateKey, $data);
    $meta['templateKey'] = $templateKey;

    return sendEmail($to, $rendered['subject'], $rendered['html'], $rendered['text'], $meta);
}

function hotmess_email_logs(int $limit = 80): array
{
    try {
        hotmess_ensure_email_log_table();
        $stmt = db()->prepare('SELECT * FROM email_logs ORDER BY created_at DESC, id DESC LIMIT ?');
        $stmt->bindValue(1, max(1, min(200, $limit)), PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (Throwable) {
        return [];
    }
}
