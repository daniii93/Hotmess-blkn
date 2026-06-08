<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/events-data.php';
require_once __DIR__ . '/membership-data.php';
require_once __DIR__ . '/packages-data.php';

function hotmess_env(string $key, string $fallback = ''): string
{
    $value = getenv($key);

    if (is_string($value) && trim($value) !== '') {
        return trim($value);
    }

    return defined($key) ? trim((string) constant($key)) : $fallback;
}

function hotmess_stripe_secret_key(): string
{
    return hotmess_env('STRIPE_SECRET_KEY');
}

function hotmess_stripe_publishable_key(): string
{
    return hotmess_env('STRIPE_PUBLISHABLE_KEY');
}

function hotmess_stripe_webhook_secret(): string
{
    return hotmess_env('STRIPE_WEBHOOK_SECRET');
}

function hotmess_stripe_is_configured(): bool
{
    return str_starts_with(hotmess_stripe_secret_key(), 'sk_');
}

function hotmess_payments_column_exists(string $table, string $column): bool
{
    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $stmt->execute([$table, $column]);

    return (int) $stmt->fetchColumn() > 0;
}

function hotmess_payments_table_exists(string $table): bool
{
    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?'
    );
    $stmt->execute([$table]);

    return (int) $stmt->fetchColumn() > 0;
}

function hotmess_payments_add_column(string $table, string $column, string $definition): void
{
    if (!hotmess_payments_column_exists($table, $column)) {
        db()->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
    }
}

function hotmess_ensure_payment_tables(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS hotmess_payment_sessions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            kind ENUM('ticket', 'membership', 'package') NOT NULL,
            source_id VARCHAR(190) NOT NULL,
            source_label VARCHAR(190) NOT NULL,
            quantity INT UNSIGNED NOT NULL DEFAULT 1,
            amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            currency CHAR(3) NOT NULL DEFAULT 'EUR',
            stripe_session_id VARCHAR(190) NULL UNIQUE,
            stripe_customer_id VARCHAR(190) NULL,
            stripe_subscription_id VARCHAR(190) NULL,
            stripe_payment_intent_id VARCHAR(190) NULL,
            local_reference VARCHAR(80) NOT NULL UNIQUE,
            status ENUM('pending', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
            metadata JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX hotmess_payment_sessions_user_idx (user_id, created_at),
            INDEX hotmess_payment_sessions_kind_idx (kind, status, created_at),
            INDEX hotmess_payment_sessions_source_idx (source_id, created_at),
            CONSTRAINT hotmess_payment_sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS hotmess_user_memberships (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            tier_slug ENUM('free', 'plus', 'black') NOT NULL DEFAULT 'free',
            status ENUM('active', 'trialing', 'past_due', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
            started_at DATETIME NOT NULL,
            renews_at DATETIME NULL,
            cancelled_at DATETIME NULL,
            stripe_customer_id VARCHAR(190) NULL,
            stripe_subscription_id VARCHAR(190) NULL,
            payment_session_id INT UNSIGNED NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY hotmess_user_memberships_user_unique (user_id),
            INDEX hotmess_user_memberships_tier_idx (tier_slug, status),
            INDEX hotmess_user_memberships_stripe_idx (stripe_subscription_id),
            CONSTRAINT hotmess_user_memberships_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT hotmess_user_memberships_session_fk FOREIGN KEY (payment_session_id) REFERENCES hotmess_payment_sessions(id) ON DELETE SET NULL
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS hotmess_ticket_wallet (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            payment_session_id INT UNSIGNED NULL,
            ticket_order_id INT UNSIGNED NULL,
            ticket_number VARCHAR(80) NOT NULL UNIQUE,
            qr_code VARCHAR(190) NOT NULL UNIQUE,
            event_id VARCHAR(190) NOT NULL,
            event_name VARCHAR(190) NOT NULL,
            ticket_type VARCHAR(120) NOT NULL,
            status ENUM('valid', 'checked_in', 'cancelled') NOT NULL DEFAULT 'valid',
            purchased_at DATETIME NOT NULL,
            checked_in_at DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX hotmess_ticket_wallet_user_idx (user_id, status),
            INDEX hotmess_ticket_wallet_event_idx (event_id, status),
            CONSTRAINT hotmess_ticket_wallet_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT hotmess_ticket_wallet_session_fk FOREIGN KEY (payment_session_id) REFERENCES hotmess_payment_sessions(id) ON DELETE SET NULL
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS hotmess_payment_audit_log (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            payment_session_id INT UNSIGNED NULL,
            action VARCHAR(120) NOT NULL,
            detail TEXT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX hotmess_payment_audit_session_idx (payment_session_id, created_at),
            CONSTRAINT hotmess_payment_audit_session_fk FOREIGN KEY (payment_session_id) REFERENCES hotmess_payment_sessions(id) ON DELETE SET NULL
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS hotmess_email_outbox (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NULL,
            payment_session_id INT UNSIGNED NULL,
            email_type ENUM('membership_welcome', 'membership_upgrade', 'membership_renewal', 'ticket_confirmation', 'package_confirmation') NOT NULL,
            recipient VARCHAR(190) NOT NULL,
            subject VARCHAR(190) NOT NULL,
            body MEDIUMTEXT NOT NULL,
            status ENUM('queued', 'sent', 'failed') NOT NULL DEFAULT 'queued',
            provider_message_id VARCHAR(190) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            sent_at DATETIME NULL,
            INDEX hotmess_email_outbox_status_idx (status, created_at),
            INDEX hotmess_email_outbox_payment_idx (payment_session_id),
            CONSTRAINT hotmess_email_outbox_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            CONSTRAINT hotmess_email_outbox_session_fk FOREIGN KEY (payment_session_id) REFERENCES hotmess_payment_sessions(id) ON DELETE SET NULL
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_revenue_transactions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_id VARCHAR(120) NULL,
            source_type ENUM('ticket', 'hotel_package', 'drink_package', 'membership', 'package', 'vip', 'partner', 'tickets', 'hotels', 'packages', 'memberships', 'partner_offers', 'sponsoring', 'referrals', 'vip_services', 'concierge') NOT NULL,
            source_id VARCHAR(120) NOT NULL,
            label VARCHAR(190) NULL,
            amount DECIMAL(12,2) NOT NULL DEFAULT 0,
            currency CHAR(3) NOT NULL DEFAULT 'EUR',
            city_id VARCHAR(120) NULL,
            user_id INT UNSIGNED NULL,
            payment_session_id INT UNSIGNED NULL,
            payment_status ENUM('paid', 'pending', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'paid',
            metadata JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX platform_revenue_transactions_event_idx (event_id, created_at),
            INDEX platform_revenue_transactions_source_idx (source_type, source_id),
            INDEX platform_revenue_transactions_payment_status_idx (payment_status, created_at),
            INDEX platform_revenue_transactions_created_idx (created_at),
            INDEX platform_revenue_transactions_payment_idx (payment_session_id),
            CONSTRAINT platform_revenue_transactions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )"
    );
    hotmess_payments_add_column('platform_revenue_transactions', 'label', 'VARCHAR(190) NULL');
    hotmess_payments_add_column('platform_revenue_transactions', 'payment_session_id', 'INT UNSIGNED NULL');
    hotmess_payments_add_column('platform_revenue_transactions', 'event_id', 'VARCHAR(120) NULL');
    hotmess_payments_add_column('platform_revenue_transactions', 'payment_status', "ENUM('paid', 'pending', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'paid'");

    if (hotmess_payments_table_exists('ticket_orders')) {
        db()->exec(
            "ALTER TABLE ticket_orders MODIFY payment_status ENUM('simulated_paid', 'pending', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending'"
        );
        hotmess_payments_add_column('ticket_orders', 'stripe_session_id', 'VARCHAR(190) NULL');
        hotmess_payments_add_column('ticket_orders', 'stripe_payment_intent_id', 'VARCHAR(190) NULL');
        hotmess_payments_add_column('ticket_orders', 'payment_session_id', 'INT UNSIGNED NULL');
    }

    if (hotmess_payments_table_exists('platform_user_tickets')) {
        hotmess_payments_add_column('platform_user_tickets', 'ticket_number', 'VARCHAR(80) NULL');
        hotmess_payments_add_column('platform_user_tickets', 'payment_session_id', 'INT UNSIGNED NULL');
        hotmess_payments_add_column('platform_user_tickets', 'purchased_at', 'DATETIME NULL');
    }
}

function hotmess_stripe_request(string $method, string $path, array $params = []): array
{
    if (!hotmess_stripe_is_configured()) {
        throw new RuntimeException('Stripe ist nicht konfiguriert.');
    }

    $url = 'https://api.stripe.com/v1/' . ltrim($path, '/');
    $body = http_build_query($params);
    $headers = [
        'Authorization: Bearer ' . hotmess_stripe_secret_key(),
        'Content-Type: application/x-www-form-urlencoded',
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => strtoupper($method),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_TIMEOUT => 25,
        ]);
        $response = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => strtoupper($method),
                'header' => implode("\r\n", $headers),
                'content' => $body,
                'timeout' => 25,
                'ignore_errors' => true,
            ],
        ]);
        $response = file_get_contents($url, false, $context);
        $status = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $match)) {
            $status = (int) $match[1];
        }
        $error = '';
    }

    if ($response === false || $response === '') {
        throw new RuntimeException('Stripe API konnte nicht erreicht werden. ' . $error);
    }

    $decoded = json_decode((string) $response, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Stripe API lieferte keine gueltige JSON-Antwort.');
    }

    if ($status >= 400 || isset($decoded['error'])) {
        $message = $decoded['error']['message'] ?? 'Stripe API Fehler.';
        throw new RuntimeException((string) $message);
    }

    return $decoded;
}

function hotmess_payment_reference(string $prefix): string
{
    return $prefix . '-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
}

function hotmess_payment_amount_cents(float $amount): int
{
    return max(0, (int) round($amount * 100));
}

function hotmess_stripe_price_id(string $kind, string $slug, string $cycle = 'monthly'): string
{
    $key = 'STRIPE_PRICE_' . strtoupper($kind) . '_' . strtoupper(str_replace('-', '_', $slug)) . '_' . strtoupper($cycle);
    return hotmess_env($key);
}

function hotmess_checkout_line_item(array $checkout): array
{
    $line = [];
    $line['line_items[0][quantity]'] = (string) $checkout['quantity'];
    $priceId = (string) ($checkout['stripePriceId'] ?? '');

    if ($priceId !== '') {
        $line['line_items[0][price]'] = $priceId;
        return $line;
    }

    $line['line_items[0][price_data][currency]'] = strtolower((string) $checkout['currency']);
    $line['line_items[0][price_data][unit_amount]'] = (string) hotmess_payment_amount_cents((float) $checkout['unitAmount']);
    $line['line_items[0][price_data][product_data][name]'] = (string) $checkout['label'];

    if (($checkout['mode'] ?? 'payment') === 'subscription') {
        $line['line_items[0][price_data][recurring][interval]'] = (string) ($checkout['interval'] ?? 'month');
    }

    return $line;
}

function hotmess_create_payment_checkout(array $checkout, array $user): string
{
    hotmess_ensure_payment_tables();

    $reference = hotmess_payment_reference(strtoupper(substr((string) $checkout['kind'], 0, 3)));
    $metadata = $checkout['metadata'] ?? [];
    $metadata['local_reference'] = $reference;
    $metadata['kind'] = $checkout['kind'];
    $metadata['source_id'] = $checkout['sourceId'];
    $metadata['user_id'] = (string) $user['id'];

    $stmt = db()->prepare(
        'INSERT INTO hotmess_payment_sessions (user_id, kind, source_id, source_label, quantity, amount, currency, local_reference, status, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending", ?)'
    );
    $stmt->execute([
        $user['id'],
        $checkout['kind'],
        $checkout['sourceId'],
        $checkout['label'],
        $checkout['quantity'],
        number_format((float) $checkout['totalAmount'], 2, '.', ''),
        $checkout['currency'],
        $reference,
        json_encode($metadata, JSON_UNESCAPED_SLASHES),
    ]);

    $localSessionId = (int) db()->lastInsertId();

    $params = [
        'mode' => $checkout['mode'],
        'success_url' => APP_URL . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => APP_URL . '/payment/cancel?ref=' . urlencode($reference),
        'client_reference_id' => $reference,
        'customer_email' => (string) $user['email'],
        'metadata[local_session_id]' => (string) $localSessionId,
        'metadata[local_reference]' => $reference,
        'metadata[kind]' => (string) $checkout['kind'],
        'metadata[source_id]' => (string) $checkout['sourceId'],
        'metadata[user_id]' => (string) $user['id'],
    ];

    if (($checkout['allowPromotionCodes'] ?? true) === true) {
        $params['allow_promotion_codes'] = 'true';
    }

    $params += hotmess_checkout_line_item($checkout);
    $stripeSession = hotmess_stripe_request('POST', 'checkout/sessions', $params);

    $stmt = db()->prepare(
        'UPDATE hotmess_payment_sessions
         SET stripe_session_id = ?, stripe_customer_id = ?, stripe_subscription_id = ?, stripe_payment_intent_id = ?
         WHERE id = ?'
    );
    $stmt->execute([
        $stripeSession['id'] ?? null,
        $stripeSession['customer'] ?? null,
        $stripeSession['subscription'] ?? null,
        $stripeSession['payment_intent'] ?? null,
        $localSessionId,
    ]);

    return (string) ($stripeSession['url'] ?? '');
}

function hotmess_payment_checkout_for_ticket(array $event, array $ticket, int $quantity, array $user): string
{
    $unitPrice = (float) $ticket['priceFrom'];
    if ($unitPrice <= 0) {
        throw new RuntimeException('Kostenlose Member-Allocations werden nicht ueber Stripe bezahlt.');
    }

    return hotmess_create_payment_checkout([
        'kind' => 'ticket',
        'mode' => 'payment',
        'sourceId' => (string) $event['id'],
        'label' => $event['title'] . ' / ' . $ticket['title'],
        'quantity' => $quantity,
        'unitAmount' => $unitPrice,
        'totalAmount' => $unitPrice * $quantity,
        'currency' => 'EUR',
        'metadata' => [
            'event_slug' => $event['slug'],
            'event_title' => $event['title'],
            'event_city' => $event['city'],
            'ticket_id' => $ticket['id'],
            'ticket_title' => $ticket['title'],
            'quantity' => (string) $quantity,
        ],
    ], $user);
}

function hotmess_payment_checkout_for_membership(array $tier, string $cycle, array $user): string
{
    $isYearly = $cycle === 'yearly';
    $amount = (float) ($isYearly ? $tier['priceYearly'] : $tier['priceMonthly']);
    $stripePriceId = hotmess_stripe_price_id('membership', (string) $tier['slug'], $isYearly ? 'yearly' : 'monthly');

    return hotmess_create_payment_checkout([
        'kind' => 'membership',
        'mode' => 'subscription',
        'sourceId' => (string) $tier['slug'],
        'label' => $tier['name'] . ' / ' . ($isYearly ? 'Yearly' : 'Monthly'),
        'quantity' => 1,
        'unitAmount' => $amount,
        'totalAmount' => $amount,
        'currency' => 'EUR',
        'interval' => $isYearly ? 'year' : 'month',
        'stripePriceId' => $stripePriceId,
        'metadata' => [
            'tier_slug' => $tier['slug'],
            'tier_name' => $tier['name'],
            'billing_cycle' => $isYearly ? 'yearly' : 'monthly',
        ],
    ], $user);
}

function hotmess_payment_checkout_for_package(array $package, array $user): string
{
    return hotmess_create_payment_checkout([
        'kind' => 'package',
        'mode' => 'payment',
        'sourceId' => (string) $package['id'],
        'label' => $package['title'],
        'quantity' => 1,
        'unitAmount' => (float) $package['priceFrom'],
        'totalAmount' => (float) $package['priceFrom'],
        'currency' => 'EUR',
        'metadata' => [
            'package_slug' => $package['slug'],
            'package_title' => $package['title'],
            'package_city' => $package['city'],
            'package_type' => $package['packageType'],
        ],
    ], $user);
}

function hotmess_verify_stripe_signature(string $payload, string $header): bool
{
    $secret = hotmess_stripe_webhook_secret();
    if ($secret === '' || $header === '') {
        return false;
    }

    $timestamp = null;
    $signatures = [];
    foreach (explode(',', $header) as $part) {
        [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
        if ($key === 't') {
            $timestamp = $value;
        }
        if ($key === 'v1') {
            $signatures[] = $value;
        }
    }

    if (!$timestamp || !$signatures) {
        return false;
    }

    if (abs(time() - (int) $timestamp) > 300) {
        return false;
    }

    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) {
            return true;
        }
    }

    return false;
}

function hotmess_fulfill_checkout_session(array $session): void
{
    hotmess_ensure_payment_tables();

    $metadata = $session['metadata'] ?? [];
    $localReference = (string) ($metadata['local_reference'] ?? $session['client_reference_id'] ?? '');
    if ($localReference === '') {
        return;
    }

    $stmt = db()->prepare('SELECT * FROM hotmess_payment_sessions WHERE local_reference = ? LIMIT 1');
    $stmt->execute([$localReference]);
    $payment = $stmt->fetch();
    if (!$payment || ($payment['status'] ?? '') === 'paid') {
        return;
    }

    $stripeSessionId = (string) ($session['id'] ?? $payment['stripe_session_id']);
    $stripeCustomerId = is_string($session['customer'] ?? null) ? $session['customer'] : ($payment['stripe_customer_id'] ?? null);
    $stripeSubscriptionId = is_string($session['subscription'] ?? null) ? $session['subscription'] : ($payment['stripe_subscription_id'] ?? null);
    $stripePaymentIntentId = is_string($session['payment_intent'] ?? null) ? $session['payment_intent'] : ($payment['stripe_payment_intent_id'] ?? null);

    $stmt = db()->prepare(
        'UPDATE hotmess_payment_sessions
         SET status = "paid", stripe_session_id = ?, stripe_customer_id = ?, stripe_subscription_id = ?, stripe_payment_intent_id = ?
         WHERE id = ?'
    );
    $stmt->execute([$stripeSessionId, $stripeCustomerId, $stripeSubscriptionId, $stripePaymentIntentId, $payment['id']]);

    $meta = json_decode((string) ($payment['metadata'] ?? '{}'), true);
    $meta = is_array($meta) ? $meta : [];

    if ($payment['kind'] === 'ticket') {
        hotmess_fulfill_ticket_payment($payment, $meta, $stripeSessionId, $stripePaymentIntentId);
    } elseif ($payment['kind'] === 'membership') {
        hotmess_fulfill_membership_payment($payment, $meta, $stripeCustomerId, $stripeSubscriptionId);
    } elseif ($payment['kind'] === 'package') {
        hotmess_fulfill_package_payment($payment, $meta, $stripeSessionId);
    }

    hotmess_payment_audit((int) $payment['id'], 'checkout_session_completed', 'Stripe Checkout Session fulfilled: ' . $stripeSessionId);
}

function hotmess_fulfill_ticket_payment(array $payment, array $meta, ?string $stripeSessionId, ?string $stripePaymentIntentId): void
{
    $quantity = max(1, (int) ($meta['quantity'] ?? $payment['quantity'] ?? 1));
    $reference = (string) $payment['local_reference'];
    $orderId = null;

    if (hotmess_payments_table_exists('ticket_orders')) {
        $stmt = db()->prepare(
            'INSERT INTO ticket_orders (user_id, event_id, event_name, ticket_type, quantity, unit_price, total_price, currency, payment_status, order_reference, stripe_session_id, stripe_payment_intent_id, payment_session_id)
             VALUES (?, NULL, ?, ?, ?, ?, ?, ?, "paid", ?, ?, ?, ?)'
        );
        $stmt->execute([
            $payment['user_id'],
            $meta['event_title'] ?? $payment['source_label'],
            $meta['ticket_title'] ?? 'Ticket',
            $quantity,
            number_format(((float) $payment['amount']) / $quantity, 2, '.', ''),
            number_format((float) $payment['amount'], 2, '.', ''),
            $payment['currency'],
            $reference,
            $stripeSessionId,
            $stripePaymentIntentId,
            $payment['id'],
        ]);
        $orderId = (int) db()->lastInsertId();
    }

    for ($i = 1; $i <= $quantity; $i++) {
        $ticketNumber = $reference . '-' . str_pad((string) $i, 2, '0', STR_PAD_LEFT);
        $qrCode = 'HOTMESS:' . hash('sha256', $ticketNumber . '|' . $payment['user_id'] . '|' . APP_URL);
        $stmt = db()->prepare(
            'INSERT IGNORE INTO hotmess_ticket_wallet (user_id, payment_session_id, ticket_order_id, ticket_number, qr_code, event_id, event_name, ticket_type, status, purchased_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, "valid", NOW())'
        );
        $stmt->execute([
            $payment['user_id'],
            $payment['id'],
            $orderId,
            $ticketNumber,
            $qrCode,
            $meta['event_slug'] ?? $payment['source_id'],
            $meta['event_title'] ?? $payment['source_label'],
            $meta['ticket_title'] ?? 'Ticket',
        ]);
    }

    hotmess_record_revenue_transaction('tickets', (string) ($meta['event_slug'] ?? $payment['source_id']), (string) $payment['source_label'], (float) $payment['amount'], (string) $payment['currency'], (int) $payment['user_id'], (int) $payment['id'], (string) ($meta['event_city'] ?? ''));
    hotmess_queue_payment_email((int) $payment['user_id'], (int) $payment['id'], 'ticket_confirmation', 'Dein HOTMESS Ticket', 'Dein Ticket wurde bezahlt. QR-Tickets findest du in deinem HOTMESS Account unter Ticket Wallet.');
}

function hotmess_fulfill_membership_payment(array $payment, array $meta, ?string $stripeCustomerId, ?string $stripeSubscriptionId): void
{
    $tierSlug = (string) ($meta['tier_slug'] ?? $payment['source_id']);
    $cycle = (string) ($meta['billing_cycle'] ?? 'monthly');
    $renewsAt = $cycle === 'yearly' ? 'DATE_ADD(NOW(), INTERVAL 1 YEAR)' : 'DATE_ADD(NOW(), INTERVAL 1 MONTH)';

    db()->prepare(
        "INSERT INTO hotmess_user_memberships (user_id, tier_slug, status, started_at, renews_at, stripe_customer_id, stripe_subscription_id, payment_session_id)
         VALUES (?, ?, 'active', NOW(), {$renewsAt}, ?, ?, ?)
         ON DUPLICATE KEY UPDATE tier_slug = VALUES(tier_slug), status = 'active', renews_at = VALUES(renews_at), stripe_customer_id = VALUES(stripe_customer_id), stripe_subscription_id = VALUES(stripe_subscription_id), payment_session_id = VALUES(payment_session_id)"
    )->execute([(int) $payment['user_id'], $tierSlug, $stripeCustomerId, $stripeSubscriptionId, (int) $payment['id']]);

    hotmess_record_revenue_transaction('memberships', $tierSlug, (string) $payment['source_label'], (float) $payment['amount'], (string) $payment['currency'], (int) $payment['user_id'], (int) $payment['id'], 'Multi-city');
    hotmess_queue_payment_email((int) $payment['user_id'], (int) $payment['id'], 'membership_welcome', 'Willkommen im HOTMESS Passport', 'Deine Membership ist aktiv. Deine digitale Member Card und Benefits findest du in deinem HOTMESS Account.');
}

function hotmess_fulfill_package_payment(array $payment, array $meta, ?string $stripeSessionId): void
{
    if (hotmess_payments_table_exists('platform_user_saved_packages')) {
        db()->prepare(
            'INSERT INTO platform_user_saved_packages (user_id, package_id, status, vip_interest)
             VALUES (?, ?, "booked", ?)
             ON DUPLICATE KEY UPDATE status = "booked", vip_interest = VALUES(vip_interest)'
        )->execute([(int) $payment['user_id'], (string) $payment['source_id'], !empty($meta['package_type']) && in_array($meta['package_type'], ['vip', 'signature'], true) ? 1 : 0]);
    }

    hotmess_record_revenue_transaction('packages', (string) ($meta['package_slug'] ?? $payment['source_id']), (string) $payment['source_label'], (float) $payment['amount'], (string) $payment['currency'], (int) $payment['user_id'], (int) $payment['id'], (string) ($meta['package_city'] ?? ''));
    hotmess_queue_payment_email((int) $payment['user_id'], (int) $payment['id'], 'package_confirmation', 'Dein HOTMESS Weekend', 'Dein Package wurde bezahlt. Details und Concierge-Hinweise findest du in deinem HOTMESS Account.');
}

function hotmess_record_revenue_transaction(string $sourceType, string $sourceId, string $label, float $amount, string $currency, int $userId, int $paymentSessionId, string $city = ''): void
{
    $stmt = db()->prepare('SELECT id FROM platform_revenue_transactions WHERE payment_session_id = ? LIMIT 1');
    $stmt->execute([$paymentSessionId]);
    if ($stmt->fetch()) {
        return;
    }

    $eventId = in_array($sourceType, ['ticket', 'tickets'], true) ? $sourceId : null;
    db()->prepare(
        'INSERT INTO platform_revenue_transactions (event_id, source_type, source_id, label, amount, currency, city_id, user_id, payment_session_id, payment_status, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "paid", ?)'
    )->execute([
        $eventId,
        $sourceType,
        $sourceId,
        $label,
        number_format($amount, 2, '.', ''),
        $currency,
        $city !== '' ? $city : null,
        $userId,
        $paymentSessionId,
        json_encode(['createdBy' => 'stripe_webhook'], JSON_UNESCAPED_SLASHES),
    ]);
}

function hotmess_live_user_membership(?array $user): ?array
{
    if (!$user) {
        return null;
    }

    hotmess_ensure_payment_tables();
    $stmt = db()->prepare('SELECT * FROM hotmess_user_memberships WHERE user_id = ? LIMIT 1');
    $stmt->execute([(int) $user['id']]);
    $membership = $stmt->fetch();

    return $membership ?: null;
}

function hotmess_live_user_tickets(int $userId): array
{
    hotmess_ensure_payment_tables();
    $stmt = db()->prepare('SELECT * FROM hotmess_ticket_wallet WHERE user_id = ? ORDER BY purchased_at DESC, id DESC');
    $stmt->execute([$userId]);

    return $stmt->fetchAll();
}

function hotmess_live_revenue_transactions(): array
{
    hotmess_ensure_payment_tables();
    $stmt = db()->query(
        'SELECT event_id AS eventId, source_type AS sourceType, source_id AS sourceId, COALESCE(label, source_id) AS label, amount, currency, COALESCE(city_id, "") AS city, COALESCE(CAST(user_id AS CHAR), "") AS userId, payment_status AS paymentStatus, created_at AS createdAt
         FROM platform_revenue_transactions
         ORDER BY created_at DESC
         LIMIT 100'
    );

    return $stmt->fetchAll();
}

function hotmess_live_revenue_kpis(): array
{
    $sources = function_exists('hotmess_revenue_sources')
        ? hotmess_revenue_sources()
        : ['tickets', 'hotels', 'packages', 'memberships', 'partner_offers', 'sponsoring', 'referrals', 'vip_services', 'concierge'];
    $totals = array_fill_keys($sources, 0);
    foreach (hotmess_live_revenue_transactions() as $transaction) {
        $source = (string) $transaction['sourceType'];
        if (array_key_exists($source, $totals)) {
            $totals[$source] += (float) $transaction['amount'];
        }
    }

    return [
        'totalRevenue' => array_sum($totals),
        'tickets' => $totals['tickets'],
        'hotels' => $totals['hotels'],
        'packages' => $totals['packages'],
        'memberships' => $totals['memberships'],
        'partnerOffers' => $totals['partner_offers'],
        'sponsoring' => $totals['sponsoring'],
        'referrals' => $totals['referrals'],
        'vip' => $totals['vip_services'],
        'concierge' => $totals['concierge'],
    ];
}

function hotmess_payment_session_by_stripe_id(string $sessionId): ?array
{
    hotmess_ensure_payment_tables();
    $stmt = db()->prepare('SELECT * FROM hotmess_payment_sessions WHERE stripe_session_id = ? LIMIT 1');
    $stmt->execute([$sessionId]);
    $session = $stmt->fetch();

    return $session ?: null;
}

function hotmess_payment_audit(?int $paymentSessionId, string $action, string $detail = ''): void
{
    hotmess_ensure_payment_tables();
    db()->prepare('INSERT INTO hotmess_payment_audit_log (payment_session_id, action, detail) VALUES (?, ?, ?)')
        ->execute([$paymentSessionId, $action, $detail]);
}

function hotmess_queue_payment_email(int $userId, int $paymentSessionId, string $type, string $subject, string $body): void
{
    hotmess_ensure_payment_tables();
    $stmt = db()->prepare('SELECT email FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $email = (string) ($stmt->fetchColumn() ?: '');

    if ($email === '') {
        return;
    }

    db()->prepare(
        'INSERT INTO hotmess_email_outbox (user_id, payment_session_id, email_type, recipient, subject, body, status)
         VALUES (?, ?, ?, ?, ?, ?, "queued")'
    )->execute([$userId, $paymentSessionId, $type, $email, $subject, $body]);
}

function hotmess_mark_payment_session_status_by_stripe(string $stripeSessionId, string $status, string $auditAction): void
{
    hotmess_ensure_payment_tables();
    $stmt = db()->prepare('SELECT id FROM hotmess_payment_sessions WHERE stripe_session_id = ? LIMIT 1');
    $stmt->execute([$stripeSessionId]);
    $id = $stmt->fetchColumn();
    if (!$id) {
        return;
    }

    db()->prepare('UPDATE hotmess_payment_sessions SET status = ? WHERE id = ? AND status <> "paid"')
        ->execute([$status, $id]);
    hotmess_payment_audit((int) $id, $auditAction, 'Stripe session status changed to ' . $status);
}
