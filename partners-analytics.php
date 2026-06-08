<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/revenue-data.php';

$metrics = hotmess_partner_analytics();

render_header('Partner Analytics');
?>

<main class="partners-page partner-analytics-page">
  <section class="partners-hero partner-analytics-hero">
    <div class="partners-hero__image" aria-hidden="true"></div>
    <div class="partners-hero__overlay"></div>
    <div class="partners-hero__content">
      <p class="eyebrow">Partner Analytics</p>
      <h1>Performance visibility for premium placements.</h1>
      <p class="hero-lead">Partners can track views, clicks, leads, bookings, redemptions and conversion across website, app, events, packages and membership benefits.</p>
      <div class="hero-actions"><a class="button primary" href="/partners/campaigns">Campaigns ansehen</a><a class="button ghost" href="/partners/referrals">Referrals</a></div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading"><p class="eyebrow">Metrics</p><h2>Prepared partner reporting.</h2></div>
    <div class="table-wrap">
      <table class="admin-lux-table">
        <thead><tr><th>Partner</th><th>Views</th><th>Clicks</th><th>Leads</th><th>Bookings</th><th>Redemptions</th><th>Conversion</th></tr></thead>
        <tbody>
          <?php foreach ($metrics as $metric): ?>
            <tr><td><strong><?= e($metric['partner']) ?></strong></td><td><?= e((string) $metric['views']) ?></td><td><?= e((string) $metric['clicks']) ?></td><td><?= e((string) $metric['leads']) ?></td><td><?= e((string) $metric['bookings']) ?></td><td><?= e((string) $metric['redemptions']) ?></td><td><?= e($metric['conversionRate']) ?></td></tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
</main>

<?php render_footer(); ?>
