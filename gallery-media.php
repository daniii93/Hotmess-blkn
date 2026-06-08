<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/gallery-data.php';

$section = (string) ($_GET['section'] ?? 'photos');
$mediaType = $section === 'videos' ? null : 'photos';
$items = array_values(array_filter(hotmess_gallery_items(), function (array $item) use ($section, $mediaType): bool {
    if ($section === 'videos') {
        return in_array($item['mediaType'], ['video', 'aftermovie'], true);
    }

    return $item['mediaType'] === $mediaType;
}));
$title = $section === 'videos' ? 'Videos & Aftermovies' : 'Photo Stories';
$claim = $section === 'videos'
    ? 'Cinematic cuts, aftermovies and campaign movement from the HotMess archive.'
    : 'Editorial photo stories from nights, hotels, community moments and partner-led chapters.';

render_header('Gallery ' . $title);
?>

<main class="gallery-page gallery-media-page">
  <section class="gallery-hero gallery-media-hero">
    <div class="gallery-hero__image" aria-hidden="true"></div>
    <div class="gallery-hero__overlay" aria-hidden="true"></div>
    <div class="gallery-hero__content">
      <p class="eyebrow">Gallery / <?= e($title) ?></p>
      <h1><?= e($title) ?></h1>
      <p><?= e($claim) ?></p>
      <div class="hero-actions">
        <a class="button primary" href="/gallery">Alle Medien</a>
        <a class="button ghost" href="/events">Events</a>
        <a class="button ghost" href="/membership">Passport</a>
      </div>
    </div>
  </section>

  <section class="gallery-grid-section">
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
