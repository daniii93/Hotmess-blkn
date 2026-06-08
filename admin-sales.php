<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

require_admin();

$events = db()->query('SELECT * FROM sales_events ORDER BY start_date DESC')->fetchAll();
$partners = db()->query('SELECT * FROM sales_partners ORDER BY level DESC, name ASC')->fetchAll();
$orders = db()->query(
    'SELECT ticket_orders.*, users.name AS customer_name, sales_partners.name AS partner_name
     FROM ticket_orders
     LEFT JOIN users ON users.id = ticket_orders.user_id
     LEFT JOIN sales_partners ON sales_partners.id = ticket_orders.partner_id
     ORDER BY ticket_orders.created_at DESC
     LIMIT 30'
)->fetchAll();

render_header('Vertrieb');
?>

<main class="admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Admin</p>
    <h1>Event-Vertrieb</h1>
    <p>Eventbezogene Referral-Links, Codes und Provisionen. Keine lebenslange Kundenzuordnung.</p>
  </section>

  <section class="member-table-wrap">
    <h2>Events</h2>
    <table class="member-table">
      <thead><tr><th>ID</th><th>Event</th><th>Start</th><th>Ende</th><th>Status</th></tr></thead>
      <tbody>
        <?php foreach ($events as $event): ?>
          <tr>
            <td><?= e((string) $event['id']) ?></td>
            <td><?= e($event['title']) ?></td>
            <td><?= e(date('d.m.Y H:i', strtotime((string) $event['start_date']))) ?></td>
            <td><?= e(date('d.m.Y H:i', strtotime((string) $event['end_date']))) ?></td>
            <td><?= e($event['status']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </section>

  <section class="member-table-wrap">
    <h2>Partner</h2>
    <table class="member-table">
      <thead><tr><th>Name</th><th>Level</th><th>Provision</th><th>Basis-Code</th><th>Status</th></tr></thead>
      <tbody>
        <?php foreach ($partners as $partner): ?>
          <tr>
            <td><?= e($partner['name']) ?></td>
            <td><?= e(partner_level_label((int) $partner['level'])) ?></td>
            <td><?= e(number_format(partner_commission_rate((int) $partner['level']), 2, ',', '.')) ?> %</td>
            <td><?= e($partner['base_code']) ?></td>
            <td><?= e($partner['status']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </section>

  <section class="member-table-wrap">
    <h2>Ticketkäufe und Provisionen</h2>
    <table class="member-table">
      <thead><tr><th>Kunde</th><th>Event</th><th>Partner</th><th>Code</th><th>Umsatz</th><th>Provision</th><th>Zeit</th></tr></thead>
      <tbody>
        <?php foreach ($orders as $order): ?>
          <tr>
            <td><?= e($order['customer_name'] ?? '-') ?></td>
            <td><?= e($order['event_name']) ?></td>
            <td><?= e($order['partner_name'] ?? 'Keine Vermittlung') ?></td>
            <td><?= e($order['referral_code'] ?? '-') ?></td>
            <td><?= e(number_format((float) $order['total_price'], 2, ',', '.')) ?> <?= e($order['currency']) ?></td>
            <td><?= e(number_format((float) $order['commission_amount'], 2, ',', '.')) ?> <?= e($order['currency']) ?></td>
            <td><?= e(date('d.m.Y H:i', strtotime((string) $order['created_at']))) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </section>
</main>

<?php render_footer(); ?>
