<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/payments.php';

$user = require_login();
$sessionId = (string) ($_GET['session_id'] ?? '');
$payment = $sessionId !== '' ? hotmess_payment_session_by_stripe_id($sessionId) : null;

render_header('Payment erfolgreich');
?>

<main class="platform-page payment-result-page">
  <section class="tickets-panel">
    <p class="eyebrow">Payment</p>
    <h1>Deine Zahlung wurde angenommen.</h1>
    <p>Stripe hat den Checkout abgeschlossen. Tickets, Memberships oder Packages werden ueber den Stripe Webhook final im Account aktiviert.</p>
    <?php if ($payment): ?>
      <div class="event-detail-facts">
        <span><?= e($payment['kind']) ?></span>
        <span><?= e($payment['source_label']) ?></span>
        <span><?= e($payment['status']) ?></span>
      </div>
    <?php endif; ?>
    <div class="hero-actions">
      <a class="button primary" href="/account/tickets">Ticket Wallet</a>
      <a class="button ghost" href="/account/membership">Membership</a>
      <a class="button ghost" href="/admin/revenue">Revenue</a>
    </div>
  </section>
</main>

<?php render_footer(); ?>
