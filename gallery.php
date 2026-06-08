<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/gallery-data.php';

$city = trim((string) ($_GET['city'] ?? ''));
$year = trim((string) ($_GET['year'] ?? ''));
$eventId = trim((string) ($_GET['event'] ?? ''));
$mediaType = trim((string) ($_GET['type'] ?? ''));
$items = hotmess_gallery_filtered($city ?: null, $year ?: null, $eventId ?: null, $mediaType ?: null);
$featured = hotmess_gallery_featured();
$cities = array_values(array_unique(array_column(hotmess_gallery_items(), 'city')));
$years = array_values(array_unique(array_map(fn (array $item): string => date('Y', strtotime($item['eventDate'])), hotmess_gallery_items())));
$events = array_values(array_unique(array_map(fn (array $item): string => $item['eventId'], hotmess_gallery_items())));

render_header('Gallery');
?>

<main class="gallery-page">
  <section class="gallery-hero">
    <div class="gallery-hero__image" aria-hidden="true"></div>
    <div class="gallery-hero__overlay" aria-hidden="true"></div>
    <div class="gallery-hero__content">
      <p class="eyebrow">Gallery / Media / Aftermovies</p>
      <h1>Every HotMess chapter leaves a trace.</h1>
      <p>A curated media archive for aftermovies, campaign photos and member-led moments. Less photo folder, more private brand memory.</p>
      <div class="hero-actions">
        <a class="button primary" href="/events">Event ansehen</a>
        <a class="button ghost" href="/tickets">Tickets kaufen</a>
        <a class="button ghost" href="/membership">Passport beitreten</a>
        <a class="button ghost" href="/app">App oeffnen</a>
      </div>
    </div>
  </section>

  <section class="gallery-featured">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Featured Aftermovie</p>
      <h2><?= e($featured['title']) ?></h2>
      <p><?= e($featured['description']) ?></p>
    </div>
    <article class="gallery-featured-card">
      <div class="gallery-featured-card__media" style="background-image:url('<?= e($featured['coverImage']) ?>')">
        <span><?= e($featured['mediaType']) ?> / <?= e(hotmess_gallery_media_label($featured)) ?></span>
      </div>
      <div>
        <p class="eyebrow"><?= e($featured['city']) ?> / <?= e(date('d.m.Y', strtotime($featured['eventDate']))) ?></p>
        <h3><?= e($featured['eventName']) ?></h3>
        <p><?= e($featured['photographer']) ?> / <?= e($featured['visibility']) ?></p>
        <div class="hero-actions">
          <a class="button primary" href="/gallery/<?= e($featured['slug']) ?>">Aftermovie ansehen</a>
          <a class="button ghost" href="/events">Naechstes Event</a>
        </div>
      </div>
    </article>
  </section>

  <section class="gallery-filter-section">
    <form class="gallery-filter" method="get">
      <label>Stadt
        <select name="city">
          <option value="">Alle Staedte</option>
          <?php foreach ($cities as $filterCity): ?>
            <option value="<?= e($filterCity) ?>" <?= $city === $filterCity ? 'selected' : '' ?>><?= e($filterCity) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Jahr
        <select name="year">
          <option value="">Alle Jahre</option>
          <?php foreach ($years as $filterYear): ?>
            <option value="<?= e($filterYear) ?>" <?= $year === $filterYear ? 'selected' : '' ?>><?= e($filterYear) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Event
        <select name="event">
          <option value="">Alle Events</option>
          <?php foreach ($events as $filterEvent): ?>
            <option value="<?= e($filterEvent) ?>" <?= $eventId === $filterEvent ? 'selected' : '' ?>><?= e($filterEvent) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Medientyp
        <select name="type">
          <option value="">Alle Medien</option>
          <option value="photos" <?= $mediaType === 'photos' ? 'selected' : '' ?>>Photos</option>
          <option value="video" <?= $mediaType === 'video' ? 'selected' : '' ?>>Video</option>
          <option value="aftermovie" <?= $mediaType === 'aftermovie' ? 'selected' : '' ?>>Aftermovie</option>
        </select>
      </label>
      <button class="button primary" type="submit">Filtern</button>
      <a class="button ghost" href="/gallery/photos">Photos</a>
      <a class="button ghost" href="/gallery/videos">Videos</a>
    </form>
  </section>

  <section class="gallery-grid-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Campaign Archive</p>
      <h2>Event galleries, videos and aftermovies.</h2>
    </div>
    <div class="gallery-card-grid">
      <?php foreach ($items as $item): ?>
        <article class="gallery-card">
          <div class="gallery-card__media" style="background-image:url('<?= e($item['coverImage']) ?>')">
            <span><?= e($item['mediaType']) ?></span>
          </div>
          <div class="gallery-card__body">
            <p class="eyebrow"><?= e($item['city']) ?> / <?= e(date('d.m.Y', strtotime($item['eventDate']))) ?></p>
            <h3><?= e($item['title']) ?></h3>
            <p><?= e($item['eventName']) ?> / <?= e(hotmess_gallery_media_label($item)) ?></p>
            <a class="button ghost" href="/gallery/<?= e($item['slug']) ?>">Detail ansehen</a>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
