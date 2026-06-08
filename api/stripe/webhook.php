<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';
require_once __DIR__ . '/../../app/payments.php';

$payload = (string) file_get_contents('php://input');
$signature = (string) ($_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '');

if (!hotmess_verify_stripe_signature($payload, $signature)) {
    http_response_code(400);
    echo 'Invalid signature';
    exit;
}

$event = json_decode($payload, true);
if (!is_array($event)) {
    http_response_code(400);
    echo 'Invalid payload';
    exit;
}

$type = (string) ($event['type'] ?? '');
$object = $event['data']['object'] ?? [];

try {
    if ($type === 'checkout.session.completed' && is_array($object)) {
        hotmess_fulfill_checkout_session($object);
    }

    if ($type === 'checkout.session.expired' && is_array($object)) {
        hotmess_mark_payment_session_status_by_stripe((string) ($object['id'] ?? ''), 'cancelled', 'checkout_session_expired');
    }

    if (in_array($type, ['customer.subscription.deleted', 'customer.subscription.updated'], true) && is_array($object)) {
        hotmess_ensure_payment_tables();
        $subscriptionId = (string) ($object['id'] ?? '');
        $status = (string) ($object['status'] ?? '');
        if ($subscriptionId !== '') {
            $mapped = match ($status) {
                'active' => 'active',
                'trialing' => 'trialing',
                'past_due', 'unpaid' => 'past_due',
                'canceled' => 'cancelled',
                default => 'expired',
            };
            db()->prepare('UPDATE hotmess_user_memberships SET status = ?, cancelled_at = IF(? = "cancelled", NOW(), cancelled_at) WHERE stripe_subscription_id = ?')
                ->execute([$mapped, $mapped, $subscriptionId]);
        }
    }
} catch (Throwable $error) {
    http_response_code(500);
    echo 'Webhook handling failed';
    exit;
}

http_response_code(200);
echo 'ok';
