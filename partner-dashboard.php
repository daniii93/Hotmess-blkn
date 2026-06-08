<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_login();
$realUser = authenticated_user();
$isRealAdmin = (($realUser['role'] ?? '') === 'admin');
$partner = current_partner_for_user((int) $realUser['id']);

if (!$isRealAdmin && !$partner) {
    http_response_code(403);
    exit('Kein Zugriff auf den Vertrieb.');
}

if ($isRealAdmin && !$partner) {
    redirect('/admin-sales.php');
}

$event = active_sales_event();

render_header('Partner Dashboard');
?>

<main class="partner-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Vertriebspartner</p>
    <h1>Event-Provisionen</h1>
    <p>Provisionen entstehen nur durch aktive Vermittlung für ein konkretes Event.</p>
  </section>

  <?php if (!$partner || !$event): ?>
    <section class="tickets-panel">
      <h2>Kein aktiver Partnerzugang</h2>
      <p>Dein Account ist aktuell nicht als Vertriebspartner für ein aktives Event freigeschaltet.</p>
    </section>
  <?php else: ?>
    <?php
      $link = event_partner_link((int) $event['id'], (int) $partner['id']);
      $ticketUrl = 'https://hotmess-blkn.com/tickets.php?event=' . (int) $event['id'] . '&partner=' . (int) $partner['id'];
      $landingUrl = 'https://hotmess-blkn.com/partner-event.php?event=' . (int) $event['id'] . '&partner=' . (int) $partner['id'];
      $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' . rawurlencode($ticketUrl);

      $stmt = db()->prepare(
          'SELECT
            COUNT(*) AS sales_count,
            COALESCE(SUM(quantity), 0) AS tickets_sold,
            COALESCE(SUM(total_price), 0) AS revenue,
            COALESCE(SUM(commission_amount), 0) AS commission
           FROM ticket_orders
           WHERE partner_id = ? AND event_id = ? AND payment_status = "simulated_paid"'
      );
      $stmt->execute([$partner['id'], $event['id']]);
      $stats = $stmt->fetch() ?: [];
    ?>
    <section class="partner-grid">
      <article class="tickets-panel">
        <p class="eyebrow"><?= e($event['title']) ?></p>
        <h2><?= e(partner_level_label((int) $partner['level'])) ?></h2>
        <p>Provision: <?= e(number_format(partner_commission_rate((int) $partner['level']), 2, ',', '.')) ?> %</p>
        <label>Referral-Link
          <input readonly value="<?= e($ticketUrl) ?>" />
        </label>
        <label>Event-Code
          <input readonly value="<?= e((string) $link['referral_code']) ?>" />
        </label>
        <a class="button primary" href="<?= e($landingUrl) ?>">Persönliche Eventseite öffnen</a>
      </article>

      <article class="tickets-panel">
        <h2>QR-Code</h2>
        <img class="qr-code" src="<?= e($qrUrl) ?>" alt="QR-Code für Referral-Link" />
        <p class="field-hint">Dieser QR-Code gilt nur für dieses Event.</p>
      </article>
    </section>

    <section class="visitor-stats">
      <article><span>Verkäufe</span><strong><?= e((string) ((int) ($stats['sales_count'] ?? 0))) ?></strong><p>Bestellungen</p></article>
      <article><span>Tickets</span><strong><?= e((string) ((int) ($stats['tickets_sold'] ?? 0))) ?></strong><p>verkauft</p></article>
      <article><span>Umsatz</span><strong><?= e(number_format((float) ($stats['revenue'] ?? 0), 2, ',', '.')) ?></strong><p>EUR</p></article>
      <article><span>Provision</span><strong><?= e(number_format((float) ($stats['commission'] ?? 0), 2, ',', '.')) ?></strong><p>EUR</p></article>
    </section>
  <?php endif; ?>
</main>

<?php render_footer(); ?>
