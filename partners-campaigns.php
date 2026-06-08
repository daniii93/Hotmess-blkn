<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/revenue-data.php';

$campaigns = hotmess_partner_campaigns();

render_header('Partner Campaigns');
?>

<main class="partners-page partner-campaigns-page">
  <section class="partners-hero partner-campaigns-hero">
    <div class="partners-hero__image" aria-hidden="true"></div>
    <div class="partners-hero__overlay"></div>
    <div class="partners-hero__content">
      <p class="eyebrow">Partner Campaigns</p>
      <h1>Campaign planning for brand visibility and measurable intent.</h1>
      <p class="hero-lead">Campaigns connect partner benefits with HotMess surfaces: event pages, app offers, membership perks, city guides and referral journeys.</p>
      <div class="hero-actions"><a class="button primary" href="/partners/apply">Neue Kampagne anfragen</a><a class="button ghost" href="/partners/analytics">Analytics</a></div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading"><p class="eyebrow">Campaigns</p><h2>Active and planned partner campaigns.</h2></div>
    <div class="event-admin-grid">
      <?php foreach ($campaigns as $campaign): ?>
        <article class="premium-card">
          <span><?= e($campaign['status']) ?> / <?= e($campaign['budget']) ?></span>
          <h3><?= e($campaign['name']) ?></h3>
          <p><?= e($campaign['surface']) ?></p>
          <strong><?= e($campaign['nextStep']) ?></strong>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
