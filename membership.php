<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/membership-data.php';
require_once __DIR__ . '/app/payments.php';

$tiers = hotmess_membership_tiers();
$plus = hotmess_membership_tier_by_slug('plus');
$black = hotmess_membership_tier_by_slug('black');

render_header('HOTMESS Passport');
?>

<main class="membership-page">
  <section class="membership-hero">
    <div class="membership-hero__image" aria-hidden="true"></div>
    <div class="membership-hero__overlay"></div>
    <div class="membership-hero__content">
      <p class="eyebrow">HOTMESS Passport</p>
      <h1>Der Schlüssel zur Community.</h1>
      <p class="hero-lead">Ein privater Zugang zu Events, Hotels, Weekends, Community, App-Erinnerungen und Partnervorteilen. Kein Rabattprogramm, sondern eine Einladung in die HOTMESS Welt.</p>
      <div class="hero-actions">
        <a class="button primary" href="/register.php">Kostenlos starten</a>
        <a class="button ghost" href="/membership/plus">Plus Mitglied werden</a>
        <a class="button ghost" href="/membership/black">Black anfragen</a>
      </div>
    </div>
  </section>

  <section class="passport-intro">
    <div>
      <p class="eyebrow">Der Circle</p>
      <h2>Der HOTMESS Passport verbindet alles.</h2>
      <p>Events, Hotels, Weekends, Community, App und Partnerangebote werden nicht einzeln gedacht, sondern als wiederkehrende Reise durch die HOTMESS Community.</p>
    </div>
    <aside class="member-card-preview">
      <span>HOTMESS PASSPORT</span>
      <strong>PRIVATE MEMBER</strong>
      <p>Digitale Member Card / Stripe Checkout / Vorteils-Wallet vorbereitet.</p>
    </aside>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Passport Stufen</p>
      <h2>Free, Plus, Black.</h2>
      <p>Klare Zugänge mit dem Gefühl eines privaten Member Clubs und produktionsbereiter Struktur für Stripe-Abonnements.</p>
    </div>
    <div class="membership-tier-grid">
      <?php foreach ($tiers as $tier): ?>
        <article class="membership-tier-card membership-tier-card--<?= e($tier['slug']) ?>">
          <span><?= e($tier['badgeLabel']) ?></span>
          <h3><?= e($tier['name']) ?></h3>
          <p><?= e($tier['description']) ?></p>
          <strong><?= (int) $tier['priceMonthly'] === 0 ? 'Kostenlos' : e((string) $tier['priceMonthly']) . ' EUR / Monat' ?></strong>
          <?php if ((int) $tier['priceYearly'] > 0): ?>
            <small><?= e((string) $tier['priceYearly']) ?> EUR jährlich / Stripe Checkout</small>
          <?php endif; ?>
          <ul class="luxury-list">
            <?php foreach ($tier['benefits'] as $benefit): ?>
              <li><?= e($benefit) ?></li>
            <?php endforeach; ?>
          </ul>
          <?php if ($tier['slug'] === 'free'): ?>
            <a class="button primary" href="/register.php">Kostenlos starten</a>
          <?php else: ?>
            <form method="post" action="/payment/checkout">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="kind" value="membership" />
              <input type="hidden" name="tier_slug" value="<?= e($tier['slug']) ?>" />
              <input type="hidden" name="billing_cycle" value="monthly" />
              <input type="hidden" name="return_to" value="/membership" />
              <button class="button <?= $tier['slug'] === 'black' ? 'ghost' : 'primary' ?>" type="submit">
                <?= hotmess_stripe_is_configured() ? e($tier['badgeLabel'] . ' kaufen') : 'Stripe nicht konfiguriert' ?>
              </button>
            </form>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section membership-benefits-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Vorteile nach Bereich</p>
      <h2>Ein Passport, mehrere Erlebnisebenen.</h2>
    </div>
    <div class="membership-benefit-grid">
      <?php foreach (hotmess_membership_category_map($black ?: $tiers[0]) as $category => $items): ?>
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

  <section class="membership-upsell passport-upsell">
    <div>
      <p class="eyebrow">Passport Black</p>
      <h2>Für Gäste, die Priorität suchen, nicht Lautstärke.</h2>
      <p>Fast Lane, VIP Upgrade Optionen, Concierge Anfrage, Signature Hotel Vorteile und limitierte Partnervorteile.</p>
    </div>
    <div class="hero-actions">
      <a class="button primary" href="/membership/black">Black anfragen</a>
      <a class="button ghost" href="/packages">Signature Weekends</a>
    </div>
  </section>

  <section class="event-faq-safety">
    <div>
      <p class="eyebrow">FAQ</p>
      <h2>Fragen zum Passport.</h2>
      <article><h3>Ist der Passport ein Ticket?</h3><p>Nein. Der Passport ist die Zugangs- und Vorteilsebene rund um Tickets, Events, Weekends und Community.</p></article>
      <article><h3>Ist Stripe bereits aktiv?</h3><p>Die Checkout-Struktur ist aktiv. Echte Zahlungen starten, sobald die Stripe-Keys in der Umgebung gesetzt sind.</p></article>
      <article><h3>Kann ich kostenlos starten?</h3><p>Ja. Free Passport startet mit Profil, Erinnerungen, City Guides und Community Updates.</p></article>
    </div>
    <div>
      <p class="eyebrow">Vertrauen</p>
      <h2>Private-Club-Logik.</h2>
      <ul class="luxury-list">
        <li>Member Benefits werden kuratiert, nicht laut beworben.</li>
        <li>Partnerangebote erscheinen in hochwertigen Kontexten.</li>
        <li>Black Vorteile bleiben limitiert und anfragebasiert.</li>
      </ul>
    </div>
  </section>
</main>

<?php render_footer(); ?>
