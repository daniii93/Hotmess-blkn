<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/membership-data.php';

$tiers = hotmess_membership_tiers();
$partnerBenefits = hotmess_partner_membership_benefits();

render_header('Partner Membership');
?>

<main class="partners-membership-page">
  <section class="membership-hero partners-membership-hero">
    <div class="membership-hero__image" aria-hidden="true"></div>
    <div class="membership-hero__overlay"></div>
    <div class="membership-hero__content">
      <p class="eyebrow">Partner / HotMess Passport</p>
      <h1>Benefits placed inside a private member journey.</h1>
      <p class="hero-lead">Partners can offer VIP upgrades, welcome drinks, hotel, shopping, restaurant, travel and member-only benefits across Free, Plus and Black.</p>
      <div class="hero-actions">
        <a class="button primary" href="/membership">View Passport</a>
        <a class="button ghost" href="/partners">Partner platform</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Membership tiers</p>
      <h2>Audience by access level.</h2>
    </div>
    <div class="membership-tier-grid">
      <?php foreach ($tiers as $tier): ?>
        <article class="membership-tier-card">
          <span><?= e($tier['badgeLabel']) ?></span>
          <h3><?= e($tier['name']) ?></h3>
          <p><?= e($tier['description']) ?></p>
          <strong><?= (int) $tier['priceMonthly'] === 0 ? 'Free' : e((string) $tier['priceMonthly']) . ' EUR / month' ?></strong>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Partner benefits</p>
      <h2>Placement, usage and upgrades.</h2>
    </div>
    <div class="event-admin-grid">
      <?php foreach ($partnerBenefits as $benefit): ?>
        <article class="premium-card partner-placement-card">
          <span><?= e($benefit['benefitType']) ?></span>
          <h3><?= e($benefit['name']) ?></h3>
          <p><?= e($benefit['description']) ?></p>
          <dl class="event-meta-list">
            <div><dt>Audience</dt><dd><?= e($benefit['audience']) ?></dd></div>
            <div><dt>Tiers</dt><dd><?= e(implode(', ', $benefit['targetTiers'])) ?></dd></div>
            <div><dt>Placement</dt><dd><?= e($benefit['placement']) ?></dd></div>
            <div><dt>Upgrade</dt><dd><?= e(implode(', ', $benefit['upgradeOptions'])) ?></dd></div>
          </dl>
          <div class="partner-signal-row">
            <strong><?= e((string) $benefit['usedCount']) ?></strong><span>used</span>
            <strong><?= e((string) $benefit['clicks']) ?></strong><span>clicks</span>
            <strong><?= e((string) $benefit['leads']) ?></strong><span>leads</span>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
