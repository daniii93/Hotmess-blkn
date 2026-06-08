<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/partners-data.php';

$partners = array_values(array_filter(hotmess_partners(), fn (array $partner): bool => in_array($partner['category'], ['Bars', 'Restaurants', 'Fashion / Shops', 'Lifestyle Brands'], true)));
$placements = array_values(array_filter(hotmess_partner_placements(), fn (array $placement): bool => in_array($placement['placementType'], ['community', 'membership', 'app', 'event'], true)));

render_header('Partner Community');
?>

<main class="partners-page partners-community-page">
  <section class="partners-hero partners-community-hero">
    <div class="partners-hero__image" aria-hidden="true"></div>
    <div class="partners-hero__overlay"></div>
    <div class="partners-hero__content">
      <p class="eyebrow">Community Partners</p>
      <h1>Partner presence inside member moments.</h1>
      <p class="hero-lead">Community partners can support pre-drinks, brunches, city socials, partner bar nights, shopping nights and member-only formats.</p>
      <div class="hero-actions">
        <a class="button primary" href="/partners/apply">Apply as community partner</a>
        <a class="button ghost" href="/community">View community</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Community surfaces</p>
      <h2>Warm, trusted, member-led visibility.</h2>
    </div>
    <div class="partner-logo-grid">
      <?php foreach ($partners as $partner): ?>
        <article class="partner-logo-card">
          <div><?= e($partner['logo']) ?></div>
          <span><?= e($partner['category']) ?> / <?= e($partner['partnerType']) ?></span>
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
