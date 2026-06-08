<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/app-data.php';

$placements = hotmess_app_partner_placements();
$offers = hotmess_app_offers();

render_header('Partner App');
?>

<main class="partners-app-page">
  <section class="app-hero partners-app-hero">
    <div class="app-hero__image" aria-hidden="true"></div>
    <div class="app-hero__overlay"></div>
    <div class="app-hero__content">
      <p class="eyebrow">Partner / HotMess Guide</p>
      <h1>Premium app placements, not banner noise.</h1>
      <p class="hero-lead">Partner visibility for city, tier and journey: banner placeholders, offer cards, codes, views, clicks, redemptions and upgrade options.</p>
      <div class="hero-actions">
        <a class="button primary" href="/app">Open Guide</a>
        <a class="button ghost" href="/partners">Partner platform</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Placements</p>
      <h2>Visibility by city and tier.</h2>
    </div>
    <div class="event-admin-grid">
      <?php foreach ($placements as $placement): ?>
        <article class="premium-card partner-placement-card">
          <span><?= e($placement['placementType']) ?> / <?= e($placement['city']) ?></span>
          <h3><?= e($placement['title']) ?></h3>
          <p><?= e($placement['description']) ?></p>
          <dl class="event-meta-list">
            <div><dt>Code</dt><dd><?= e($placement['code']) ?></dd></div>
            <div><dt>Tier</dt><dd><?= e($placement['tierRequired']) ?></dd></div>
            <div><dt>Upgrade</dt><dd><?= e(implode(', ', $placement['upgradeOptions'])) ?></dd></div>
          </dl>
          <div class="partner-signal-row">
            <strong><?= e((string) $placement['views']) ?></strong><span>views</span>
            <strong><?= e((string) $placement['clicks']) ?></strong><span>clicks</span>
            <strong><?= e((string) $placement['redemptions']) ?></strong><span>redeemed</span>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
