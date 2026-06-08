<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/components.php';
require_once __DIR__ . '/app/events-data.php';

$placements = hotmess_event_partner_placements();
$events = hotmess_public_events();

render_header('Partner Events');
?>

<main class="partner-events-page">
  <section class="luxury-hero partner-events-hero">
    <div class="luxury-hero__image" style="background-image: url('/assets/packages.png')" aria-hidden="true"></div>
    <div class="luxury-hero__overlay"></div>
    <div class="luxury-hero__content">
      <p class="eyebrow">Partner Portal Preview</p>
      <h1>Event visibility for partners.</h1>
      <p class="hero-lead">A prepared sponsor and partner view for event listings, benefits, logo placement, app placement, offers, clicks and lead signals.</p>
      <div class="hero-actions">
        <a class="button primary" href="/partners">Partner platform</a>
        <a class="button ghost" href="/events">View events</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Placements</p>
      <h2>Booked visibility and benefits.</h2>
      <p>These cards are structured placeholders for later real partner analytics.</p>
    </div>
    <div class="event-admin-grid">
      <?php foreach ($placements as $placement): ?>
        <article class="premium-card partner-placement-card">
          <span><?= e($placement['visibility']) ?></span>
          <h3><?= e($placement['name']) ?></h3>
          <p><?= e($placement['benefits']) ?></p>
          <dl class="event-meta-list">
            <div><dt>Logo</dt><dd><?= e($placement['logoPlacement']) ?></dd></div>
            <div><dt>Event page</dt><dd><?= e($placement['eventPagePlacement']) ?></dd></div>
            <div><dt>App</dt><dd><?= e($placement['appPlacement']) ?></dd></div>
            <div><dt>Offer</dt><dd><?= e($placement['discountCode']) ?></dd></div>
          </dl>
          <div class="partner-signal-row">
            <strong><?= e((string) $placement['clicks']) ?></strong><span>clicks</span>
            <strong><?= e((string) $placement['leads']) ?></strong><span>leads</span>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Listed events</p>
      <h2>Partner event surfaces.</h2>
    </div>
    <div class="events-grid">
      <?php foreach ($events as $event): ?>
        <article class="event-list-card">
          <div class="event-list-card__media" style="background-image: url('<?= e($event['heroImage']) ?>')" aria-hidden="true"></div>
          <div class="event-list-card__body">
            <span><?= e($event['city']) ?> / <?= e(hotmess_ticket_status_label($event['ticketStatus'])) ?></span>
            <h3><?= e($event['title']) ?></h3>
            <p><?= e($event['shortDescription']) ?></p>
            <a class="button ghost" href="/events/<?= e($event['slug']) ?>">Open event</a>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
