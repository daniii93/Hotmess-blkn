<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/components.php';
require_once __DIR__ . '/app/packages-data.php';

$packages = hotmess_public_packages();
$placements = hotmess_package_partner_placements();

render_header('Partner Packages');
?>

<main class="partner-packages-page">
  <section class="packages-hero partner-packages-hero">
    <div class="packages-hero__image" aria-hidden="true"></div>
    <div class="packages-hero__overlay"></div>
    <div class="packages-hero__content">
      <p class="eyebrow">Partner Portal Preview</p>
      <h1>Package visibility for hotels, sponsors and city partners.</h1>
      <p class="hero-lead">Prepared partner views for contribution, placement, package type assignment, clicks, leads, bookings and upgrade opportunities.</p>
      <div class="hero-actions">
        <a class="button primary" href="/packages">View packages</a>
        <a class="button ghost" href="/partners">Partner platform</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Partner roles</p>
      <h2>Where partners enter the weekend.</h2>
      <p>Hotel, restaurant, bar, shuttle, fashion, wellness, VIP and welcome bag partners can be assigned per package level.</p>
    </div>
    <div class="event-admin-grid">
      <?php foreach ($placements as $placement): ?>
        <article class="premium-card partner-placement-card">
          <span><?= e($placement['partnerType']) ?></span>
          <h3><?= e($placement['name']) ?></h3>
          <p><?= e($placement['contribution']) ?></p>
          <dl class="event-meta-list">
            <div><dt>Packages</dt><dd><?= e(implode(', ', array_map('hotmess_package_type_label', $placement['packageTypes']))) ?></dd></div>
            <div><dt>Visibility</dt><dd><?= e($placement['visibility']) ?></dd></div>
            <div><dt>Upgrade</dt><dd><?= e(implode(', ', $placement['upgradeOptions'])) ?></dd></div>
          </dl>
          <div class="partner-signal-row">
            <strong><?= e((string) $placement['clicks']) ?></strong><span>clicks</span>
            <strong><?= e((string) $placement['leads']) ?></strong><span>leads</span>
            <strong><?= e((string) $placement['bookings']) ?></strong><span>bookings</span>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Included packages</p>
      <h2>Partner package surfaces.</h2>
    </div>
    <div class="packages-grid">
      <?php foreach ($packages as $package): ?>
        <article class="package-list-card">
          <div class="package-list-card__media" style="background-image: url('<?= e($package['heroImage']) ?>')" aria-hidden="true">
            <span class="package-status-badge package-status-badge--<?= e($package['packageType']) ?>"><?= e(hotmess_package_type_label($package['packageType'])) ?></span>
          </div>
          <div class="package-list-card__body">
            <span><?= e($package['city']) ?> / <?= e(hotmess_package_availability_label($package['availabilityStatus'])) ?></span>
            <h3><?= e($package['title']) ?></h3>
            <p><?= e($package['shortDescription']) ?></p>
            <a class="button ghost" href="/packages/<?= e($package['slug']) ?>">Open package</a>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
