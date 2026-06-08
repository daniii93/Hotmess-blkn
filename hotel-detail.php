<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/hotels-data.php';
require_once __DIR__ . '/app/inquiry-data.php';

$slug = (string) ($_GET['slug'] ?? '');
$hotel = hotmess_hotel_by_slug($slug);

if (!$hotel) {
    http_response_code(404);
    render_header('Hotel not found');
    ?>
    <main class="platform-page">
      <section class="tickets-panel">
        <p class="eyebrow">Hotels</p>
        <h1>Hotel not found</h1>
        <p>This HotMess hotel partner is not available.</p>
        <a class="button primary" href="/hotels">Back to hotels</a>
      </section>
    </main>
    <?php
    render_footer();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    hotmess_handle_inquiry_submit(array_merge($_POST, [
        'type' => 'hotel',
        'subject' => $hotel['title'],
        'relatedHotelId' => $hotel['id'],
        'city' => $hotel['city'],
    ]));
    redirect('/hotels/' . $hotel['slug'] . '#inquiry');
}

render_header($hotel['title'], build_hotel_metadata($hotel));
?>

<main class="hotel-detail-page packages-page">
  <section class="packages-hero">
    <div class="packages-hero__image" style="background-image:url('<?= e($hotel['heroImage']) ?>')" aria-hidden="true"></div>
    <div class="packages-hero__overlay"></div>
    <div class="packages-hero__content">
      <p class="eyebrow"><?= e($hotel['city']) ?> / Hotel Concierge</p>
      <h1><?= e($hotel['title']) ?></h1>
      <p class="hero-lead"><?= e($hotel['description']) ?></p>
      <div class="hero-actions">
        <a class="button primary" href="#inquiry">Hotel Anfrage</a>
        <a class="button ghost" href="/packages">Packages ansehen</a>
        <a class="button ghost" href="/membership">Passport Benefits</a>
      </div>
    </div>
  </section>

  <section class="package-story-section">
    <div>
      <p class="eyebrow">Stay layer</p>
      <h2>Hotel benefits prepared for HotMess weekends.</h2>
      <p><?= e($hotel['address']) ?></p>
      <ul class="luxury-list">
        <?php foreach ($hotel['membershipBenefits'] as $benefit): ?>
          <li><?= e($benefit) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <aside class="event-side-panel">
      <h3>Hotel facts</h3>
      <dl class="event-meta-list">
        <div><dt>Partnerstatus</dt><dd><?= e($hotel['partnerStatus']) ?></dd></div>
        <div><dt>Shuttle</dt><dd><?= $hotel['shuttleActive'] ? 'prepared' : 'optional' ?></dd></div>
        <div><dt>Fast Lane</dt><dd><?= $hotel['fastLaneActive'] ? 'active' : 'not active' ?></dd></div>
      </dl>
    </aside>
  </section>

  <section class="event-gallery-grid package-gallery-grid">
    <?php foreach ($hotel['galleryImages'] as $image): ?>
      <div style="background-image: url('<?= e($image) ?>')" aria-label="Hotel gallery image"></div>
    <?php endforeach; ?>
  </section>

  <section id="inquiry" class="inquiry-form-section">
    <?php render_inquiry_form('hotel', [
        'headline' => 'Hotel Anfrage',
        'buttonLabel' => 'Hotel Anfrage senden',
        'subject' => $hotel['title'],
        'relatedHotelId' => $hotel['id'],
        'city' => $hotel['city'],
        'messagePlaceholder' => 'Tell us travel date, guest count, room wish and event connection.',
    ]); ?>
  </section>
</main>

<?php render_footer(); ?>
