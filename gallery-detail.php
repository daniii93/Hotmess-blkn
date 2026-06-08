<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/gallery-data.php';

$slug = (string) ($_GET['slug'] ?? '');
$item = hotmess_gallery_item_by_slug($slug);

if (!$item) {
    http_response_code(404);
    exit('Galerie nicht gefunden.');
}

$relatedEvents = hotmess_events();
$nextEvent = $relatedEvents[0] ?? null;

render_header($item['title'], build_gallery_metadata($item));
?>

<main class="gallery-detail-page">
  <section class="gallery-detail-hero">
    <div class="gallery-detail-hero__image" style="background-image:url('<?= e($item['coverImage']) ?>')" aria-hidden="true"></div>
    <div class="gallery-detail-hero__overlay" aria-hidden="true"></div>
    <div class="gallery-detail-hero__content">
      <p class="eyebrow"><?= e($item['mediaType']) ?> / <?= e($item['city']) ?> / <?= e(date('d.m.Y', strtotime($item['eventDate']))) ?></p>
      <h1><?= e($item['title']) ?></h1>
      <p><?= e($item['description']) ?></p>
      <div class="hero-actions">
        <a class="button primary" href="/events">Naechstes Event</a>
        <a class="button ghost" href="/tickets">Tickets kaufen</a>
        <a class="button ghost" href="/membership">Passport beitreten</a>
        <a class="button ghost" href="/app">In App speichern</a>
      </div>
    </div>
  </section>

  <section class="gallery-detail-intro">
    <article class="premium-card">
      <span>Event</span>
      <h2><?= e($item['eventName']) ?></h2>
      <p><?= e($item['city']) ?> / <?= e(date('d.m.Y', strtotime($item['eventDate']))) ?> / Photographer: <?= e($item['photographer']) ?></p>
    </article>
    <article class="premium-card">
      <span>Visibility</span>
      <h2><?= e($item['visibility']) ?></h2>
      <p>Status: <?= e($item['status']) ?> / Partners: <?= e(implode(', ', $item['partnerIds'])) ?> / Sponsors: <?= e(implode(', ', $item['sponsorIds'])) ?></p>
    </article>
  </section>

  <?php if ($item['videoUrl']): ?>
    <section class="gallery-video-section">
      <div class="gallery-video-placeholder">
        <span><?= e($item['videoLength'] ?: 'Video') ?></span>
        <strong>Aftermovie embed prepared</strong>
        <p><?= e($item['videoUrl']) ?></p>
      </div>
    </section>
  <?php endif; ?>

  <section class="gallery-photo-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Featured Images</p>
      <h2>Lightbox-ready visual grid.</h2>
    </div>
    <div class="gallery-photo-grid">
      <?php foreach ($item['images'] as $index => $image): ?>
        <a class="gallery-photo-tile <?= $index === 0 ? 'is-featured' : '' ?>" href="<?= e($image) ?>" style="background-image:url('<?= e($image) ?>')" aria-label="Open gallery image <?= e((string) ($index + 1)) ?>"></a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="membership-upsell gallery-upsell">
    <div>
      <p class="eyebrow">Membership / App</p>
      <h2>Save this archive in the HotMess App.</h2>
      <p>Passport members receive earlier access to selected private galleries, partner edits and event reminders.</p>
    </div>
    <div class="hero-actions">
      <a class="button primary" href="/membership">Passport ansehen</a>
      <a class="button ghost" href="/app">Open HotMess Guide</a>
    </div>
  </section>

  <?php if ($nextEvent): ?>
    <section class="gallery-next-event">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Next Chapter</p>
        <h2><?= e($nextEvent['title']) ?></h2>
        <p><?= e($nextEvent['shortDescription']) ?></p>
        <div class="hero-actions">
          <a class="button primary" href="/events/<?= e($nextEvent['slug']) ?>">Event ansehen</a>
          <a class="button ghost" href="/tickets">Tickets kaufen</a>
        </div>
      </div>
    </section>
  <?php endif; ?>
</main>

<?php render_footer(); ?>
