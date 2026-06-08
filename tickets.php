<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/events-data.php';
require_once __DIR__ . '/app/payments.php';

$user = current_user();
$request = null;
$activeSalesEvent = active_sales_event();
$selectedSlug = (string) ($_GET['event'] ?? '');
$events = hotmess_public_events();
$selectedEvent = $selectedSlug !== '' ? hotmess_event_by_slug($selectedSlug) : (hotmess_next_event() ?: ($events[0] ?? null));

if (!$selectedEvent) {
    $selectedEvent = $events[0] ?? null;
}

if ($user) {
    mark_user_seen((int) $user['id']);
    $stmt = db()->prepare('SELECT * FROM waitlist_requests WHERE user_id = ? LIMIT 1');
    $stmt->execute([$user['id']]);
    $request = $stmt->fetch();
}

$canBuyTickets = false;
$ticketGateMessage = '';

if (!$user) {
    $ticketGateMessage = 'Bitte registrieren oder einloggen, um Tickets kaufen zu koennen.';
} elseif (($user['role'] ?? '') === 'admin') {
    $canBuyTickets = true;
} elseif (($user['status'] ?? '') === 'approved' && $request && ($request['status'] ?? '') === 'approved') {
    $canBuyTickets = true;
} elseif (($user['status'] ?? '') === 'rejected' || ($request['status'] ?? '') === 'rejected') {
    $ticketGateMessage = 'Der Ticketkauf ist nur fuer freigegebene Mitglieder moeglich.';
} else {
    $ticketGateMessage = 'Deine Mitgliedschaft wird noch geprueft. Der Ticketkauf ist erst nach Freigabe durch den Administrator moeglich.';
}

$orders = [];
if ($user) {
    $stmt = db()->prepare('SELECT * FROM ticket_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 8');
    $stmt->execute([$user['id']]);
    $orders = $stmt->fetchAll();
}

render_header('Tickets');
?>

<main class="tickets-page premium-tickets-page">
  <section class="tickets-hero">
    <div>
      <p class="eyebrow">Tickets</p>
      <h1>Access is curated before it is sold.</h1>
      <p class="hero-lead">Choose event access, VIP, table requests or Passport member allocation. Paid tickets now start through Stripe Checkout when Stripe keys are configured.</p>
      <div class="hero-actions">
        <a class="button primary" href="/events">Verfuegbare Events</a>
        <a class="button ghost" href="/membership">Passport Member Access</a>
      </div>
    </div>
    <?php if ($selectedEvent): ?>
      <aside class="ticket-selected-event">
        <span><?= e($selectedEvent['city']) ?> / <?= e(hotmess_ticket_status_label($selectedEvent['ticketStatus'])) ?></span>
        <h2><?= e($selectedEvent['title']) ?></h2>
        <p><?= e($selectedEvent['shortDescription']) ?></p>
      </aside>
    <?php endif; ?>
  </section>

  <section class="ticket-events-strip">
    <?php foreach ($events as $event): ?>
      <a class="<?= $selectedEvent && $selectedEvent['slug'] === $event['slug'] ? 'is-active' : '' ?>" href="/tickets?event=<?= e($event['slug']) ?>">
        <span><?= e($event['city']) ?></span>
        <strong><?= e($event['title']) ?></strong>
        <small><?= e(date('d.m.Y', strtotime($event['startDate']))) ?> / <?= e(hotmess_ticket_status_label($event['ticketStatus'])) ?></small>
      </a>
    <?php endforeach; ?>
  </section>

  <section class="platform-section">
    <?php render_flash(); ?>
    <?php if (!$canBuyTickets): ?>
      <p class="notice"><?= e($ticketGateMessage) ?></p>
    <?php endif; ?>

    <div class="section-heading platform-heading">
      <p class="eyebrow">Ticket types</p>
      <h2>Premium access tiers.</h2>
      <p>Early Bird, Regular, VIP, Table / Bottle Service and Passport access are connected to the HOTMESS checkout flow. Sold out and member-only logic remains protected.</p>
    </div>

    <?php if ($selectedEvent): ?>
      <div class="ticket-tier-grid">
        <?php foreach ($selectedEvent['tickets'] as $ticket): ?>
          <?php $isSoldOut = $selectedEvent['ticketStatus'] === 'sold_out' || $ticket['status'] === 'sold_out'; ?>
          <article class="ticket-tier-card <?= $isSoldOut ? 'is-sold-out' : '' ?>">
            <span><?= e($ticket['availability']) ?></span>
            <h3><?= e($ticket['title']) ?></h3>
            <strong><?= $ticket['priceFrom'] > 0 ? 'ab ' . e((string) $ticket['priceFrom']) . ' EUR' : 'Member allocation' ?></strong>
            <ul class="luxury-list">
              <?php foreach ($ticket['benefits'] as $benefit): ?>
                <li><?= e($benefit) ?></li>
              <?php endforeach; ?>
            </ul>
            <p class="ticket-membership-note">
              <?= $ticket['requiresMembership'] ? 'Membership required or prioritized.' : 'Membership recommended, not required.' ?>
            </p>
            <form method="post" action="/payment/checkout">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="kind" value="ticket" />
              <input type="hidden" name="return_to" value="/tickets?event=<?= e($selectedEvent['slug']) ?>" />
              <input type="hidden" name="event_slug" value="<?= e($selectedEvent['slug']) ?>" />
              <input type="hidden" name="ticket_id" value="<?= e($ticket['id']) ?>" />
              <label>
                Anzahl
                <select name="quantity" <?= $isSoldOut ? 'disabled' : '' ?>>
                  <?php for ($i = 1; $i <= 6; $i++): ?>
                    <option value="<?= e((string) $i) ?>"><?= e((string) $i) ?></option>
                  <?php endfor; ?>
                </select>
              </label>
              <button class="button primary" type="submit" <?= $isSoldOut ? 'disabled' : '' ?>>
                <?= $isSoldOut ? 'Sold out' : (hotmess_stripe_is_configured() ? 'Stripe Checkout starten' : 'Stripe nicht konfiguriert') ?>
              </button>
            </form>
          </article>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </section>

  <?php if ($user): ?>
    <section class="ticket-history">
      <h2>Bestellhistorie</h2>
      <?php if (!$orders): ?>
        <p>Noch keine bezahlte Ticketbestellung.</p>
      <?php endif; ?>
      <?php foreach ($orders as $order): ?>
        <article>
          <div>
            <strong><?= e($order['event_name']) ?> / <?= e($order['ticket_type']) ?></strong>
            <span><?= e($order['order_reference']) ?> / <?= e(date('d.m.Y H:i', strtotime((string) $order['created_at']))) ?></span>
          </div>
          <p><?= e((string) $order['quantity']) ?> x <?= e(number_format((float) $order['unit_price'], 2, ',', '.')) ?> <?= e($order['currency']) ?> / <?= e($order['payment_status']) ?></p>
          <b><?= e(number_format((float) $order['total_price'], 2, ',', '.')) ?> <?= e($order['currency']) ?></b>
        </article>
      <?php endforeach; ?>
    </section>
  <?php endif; ?>
</main>

<?php render_footer(); ?>
