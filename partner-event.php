<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_login();
$eventId = (int) ($_GET['event'] ?? 0);
$partnerId = (int) ($_GET['partner'] ?? 0);
$event = null;
$link = null;

if ($eventId > 0 && $partnerId > 0) {
    $stmt = db()->prepare('SELECT * FROM sales_events WHERE id = ? AND status = "active" LIMIT 1');
    $stmt->execute([$eventId]);
    $event = $stmt->fetch() ?: null;
    $link = $event ? event_partner_link($eventId, $partnerId) : null;
}

if (!$event || !$link) {
    http_response_code(404);
    exit('Eventseite nicht gefunden.');
}

remember_event_referral($link, 'landingpage', (int) $user['id']);
$ticketUrl = 'tickets.php?event=' . $eventId . '&partner=' . $partnerId;
$qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' . rawurlencode('https://hotmess-blkn.com/' . $ticketUrl);

render_header('Eventseite');
?>

<main class="partner-page">
  <section class="profile-hero">
    <div class="profile-cover">
      <span class="avatar profile-avatar">HB</span>
      <div>
        <p class="eyebrow">Persönliche Eventseite</p>
        <h1><?= e($event['title']) ?></h1>
        <p>Vermittelt durch <?= e($link['name']) ?> · Code <?= e($link['referral_code']) ?></p>
      </div>
    </div>
    <div class="profile-actions">
      <a class="button primary" href="<?= e($ticketUrl) ?>">Ticket kaufen</a>
    </div>
  </section>

  <section class="partner-grid">
    <article class="tickets-panel">
      <h2>Event</h2>
      <p>Start: <?= e(date('d.m.Y H:i', strtotime((string) $event['start_date']))) ?></p>
      <p>Ende: <?= e(date('d.m.Y H:i', strtotime((string) $event['end_date']))) ?></p>
      <p>Dieser Link gilt ausschließlich für dieses Event.</p>
    </article>
    <article class="tickets-panel">
      <h2>QR-Code</h2>
      <img class="qr-code" src="<?= e($qrUrl) ?>" alt="QR-Code für dieses Event" />
    </article>
  </section>
</main>

<?php render_footer(); ?>
