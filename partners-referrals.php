<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/crm-data.php';

$metrics = hotmess_partner_referral_metrics();

render_header('Partner Referrals');
?>

<main class="partners-page partner-referrals-page">
  <section class="partners-hero partner-referrals-hero">
    <div class="partners-hero__image" aria-hidden="true"></div>
    <div class="partners-hero__overlay"></div>
    <div class="partners-hero__content">
      <p class="eyebrow">Partner Referrals</p>
      <h1>Referral performance for premium partnerships.</h1>
      <p class="hero-lead">Track leads, registrations and bookings generated through curated HotMess partner campaigns. Metrics are prepared for future partner portal access.</p>
      <div class="hero-actions">
        <a class="button primary" href="/partners/apply">Neue Kampagne anfragen</a>
        <a class="button ghost" href="/partners">Partner Portal</a>
      </div>
    </div>
  </section>

  <section class="partners-intro">
    <div>
      <p class="eyebrow">Campaign visibility</p>
      <h2>From partner benefit to measurable relationship.</h2>
      <p>Referral campaigns can connect welcome drinks, hotel benefits, VIP upgrades, app offers and membership perks to real lead and booking signals.</p>
    </div>
    <aside class="partner-metric-panel">
      <span>Total leads</span>
      <strong><?= e((string) array_sum(array_column($metrics, 'leads'))) ?></strong>
      <p>prepared referral leads across active campaigns</p>
    </aside>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Referral campaigns</p>
      <h2>Leads, registrations, bookings and conversion.</h2>
    </div>
    <div class="table-wrap">
      <table class="admin-lux-table">
        <thead><tr><th>Partner</th><th>Kampagne</th><th>Leads</th><th>Registrierungen</th><th>Buchungen</th><th>Conversion</th><th>Status</th></tr></thead>
        <tbody>
          <?php foreach ($metrics as $metric): ?>
            <tr>
              <td><strong><?= e($metric['partner']) ?></strong></td>
              <td><?= e($metric['campaign']) ?></td>
              <td><?= e((string) $metric['leads']) ?></td>
              <td><?= e((string) $metric['registrations']) ?></td>
              <td><?= e((string) $metric['bookings']) ?></td>
              <td><?= e($metric['conversionRate']) ?></td>
              <td><span class="premium-badge"><?= e($metric['status']) ?></span></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
</main>

<?php render_footer(); ?>
