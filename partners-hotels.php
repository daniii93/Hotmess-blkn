<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/partners-data.php';

$hotelPartners = hotmess_partners_by_category('Hotels');
$placements = array_values(array_filter(hotmess_partner_placements(), fn (array $placement): bool => in_array($placement['placementType'], ['website', 'hotel', 'package', 'app', 'membership'], true)));

render_header('Partner Hotels');
?>

<main class="partners-page partners-hotels-page">
  <section class="partners-hero partners-hotels-hero">
    <div class="partners-hero__image" aria-hidden="true"></div>
    <div class="partners-hero__overlay"></div>
    <div class="partners-hero__content">
      <p class="eyebrow">Hotel Partners</p>
      <h1>Premium stays connected to HotMess Weekends.</h1>
      <p class="hero-lead">Hotel partners can appear in travel weekends, Signature packages, Passport benefits, city guide cards and app placements.</p>
      <div class="hero-actions">
        <a class="button primary" href="/partners/apply">Apply as hotel partner</a>
        <a class="button ghost" href="/packages">View packages</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Hotel visibility</p>
      <h2>From stay benefit to Signature package.</h2>
    </div>
    <div class="partner-logo-grid">
      <?php foreach ($hotelPartners as $partner): ?>
        <article class="partner-logo-card">
          <div><?= e($partner['logo']) ?></div>
          <span><?= e($partner['visibilityLevel']) ?></span>
          <h3><?= e($partner['name']) ?></h3>
          <p><?= e($partner['description']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="event-admin-grid">
      <?php foreach ($placements as $placement): ?>
        <article class="premium-card">
          <span><?= e($placement['placementType']) ?></span>
          <h3><?= e($placement['visibilityLevel']) ?></h3>
          <p>Related surface: <?= e($placement['relatedId']) ?> / Status: <?= e($placement['status']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
