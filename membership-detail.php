<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/membership-data.php';
require_once __DIR__ . '/app/payments.php';

$slug = (string) ($_GET['slug'] ?? '');
$tier = hotmess_membership_tier_by_slug($slug);

if (!$tier || !in_array($slug, ['plus', 'black'], true)) {
    http_response_code(404);
    render_header('Membership not found');
    ?>
    <main class="platform-page">
      <section class="tickets-panel">
        <p class="eyebrow">Membership</p>
        <h1>Membership tier not found</h1>
        <a class="button primary" href="/membership">Back to Passport</a>
      </section>
    </main>
    <?php
    render_footer();
    exit;
}

render_header($tier['name']);
?>

<main class="membership-detail-page membership-detail-page--<?= e($tier['slug']) ?>">
  <section class="membership-hero membership-detail-hero">
    <div class="membership-hero__image" aria-hidden="true"></div>
    <div class="membership-hero__overlay"></div>
    <div class="membership-hero__content">
      <p class="eyebrow">HotMess Passport / <?= e($tier['badgeLabel']) ?></p>
      <h1><?= e($tier['name']) ?></h1>
      <p class="hero-lead"><?= e($tier['description']) ?></p>
      <div class="event-detail-facts">
        <span><?= e((string) $tier['priceMonthly']) ?> EUR / month</span>
        <span><?= e((string) $tier['priceYearly']) ?> EUR / year</span>
        <span>Stripe Checkout ready</span>
      </div>
      <div class="hero-actions">
        <form method="post" action="/payment/checkout">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="kind" value="membership" />
          <input type="hidden" name="tier_slug" value="<?= e($tier['slug']) ?>" />
          <input type="hidden" name="billing_cycle" value="monthly" />
          <input type="hidden" name="return_to" value="/membership/<?= e($tier['slug']) ?>" />
          <button class="button primary" type="submit"><?= hotmess_stripe_is_configured() ? e($tier['name'] . ' kaufen') : 'Stripe nicht konfiguriert' ?></button>
        </form>
        <form method="post" action="/payment/checkout">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="kind" value="membership" />
          <input type="hidden" name="tier_slug" value="<?= e($tier['slug']) ?>" />
          <input type="hidden" name="billing_cycle" value="yearly" />
          <input type="hidden" name="return_to" value="/membership/<?= e($tier['slug']) ?>" />
          <button class="button ghost" type="submit">Jährlich buchen</button>
        </form>
        <a class="button ghost" href="/membership">Compare tiers</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="membership-benefit-grid">
      <?php foreach (hotmess_membership_category_map($tier) as $category => $items): ?>
        <article class="premium-card">
          <span><?= e($category) ?></span>
          <h3><?= e($category) ?></h3>
          <ul class="luxury-list">
            <?php foreach ($items as $item): ?>
              <li><?= e($item) ?></li>
            <?php endforeach; ?>
          </ul>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="passport-intro">
    <div>
      <p class="eyebrow">Member card</p>
      <h2>Designed for account, app and partner redemption.</h2>
      <p>Member card, benefit wallet, discount codes, renewal state and Stripe subscription ID are connected to the live payment structure.</p>
    </div>
    <aside class="member-card-preview member-card-preview--<?= e($tier['slug']) ?>">
      <span>HOTMESS PASSPORT</span>
      <strong><?= e(strtoupper($tier['badgeLabel'])) ?></strong>
      <p><?= e($tier['name']) ?> / Priority <?= e((string) $tier['priority']) ?></p>
    </aside>
  </section>
</main>

<?php render_footer(); ?>
