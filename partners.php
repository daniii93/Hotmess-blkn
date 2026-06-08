<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/partners-data.php';

$partners = hotmess_partners();
$categories = hotmess_partner_categories();
$placements = hotmess_partner_placements();
$metrics = hotmess_partner_metrics();

render_header('Partner');
?>

<main class="partners-page">
  <section class="partners-hero">
    <div class="partners-hero__image" aria-hidden="true"></div>
    <div class="partners-hero__overlay"></div>
    <div class="partners-hero__content">
      <p class="eyebrow">Partner mit HOTMESS</p>
      <h1>Hochwertige Partnerschaften für Nächte, Aufenthalte und Member Journeys.</h1>
      <p class="hero-lead">HOTMESS verbindet ausgewählte Partner mit Events, Hotels, Weekends, Community, Passport und HOTMESS Guide App. Sichtbarkeit entsteht kuratiert, nicht laut.</p>
      <div class="hero-actions">
        <a class="button primary" href="/partners/apply">Partner werden</a>
        <a class="button ghost" href="/partners/app">App-Platzierungen</a>
        <a class="button ghost" href="/partners/packages">Weekend-Platzierungen</a>
      </div>
    </div>
  </section>

  <section class="partners-intro">
    <div>
      <p class="eyebrow">Warum kooperieren</p>
      <h2>Premium-Zielgruppe, mehrere Sichtbarkeiten, messbare Nachfrage.</h2>
      <p>Partner können auf Website, App, Eventseiten, Hotelseiten, Weekends, Passport Benefits und Community-Formaten sichtbar werden. Kennzahlen für Views, Klicks, Leads und Einlösungen sind vorbereitet.</p>
    </div>
    <aside class="partner-metric-panel">
      <span>Vorbereitete Kennzahlen</span>
      <strong><?= e((string) array_sum(array_column($metrics, 'views'))) ?></strong>
      <p>Mock Views über aktive Partnerplatzierungen</p>
    </aside>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Partnerkategorien</p>
      <h2>Für Hotels, Lifestyle-Marken und Erlebnispartner gedacht.</h2>
    </div>
    <div class="partner-category-grid">
      <?php foreach ($categories as $category): ?>
        <article class="premium-card">
          <span><?= e((string) count(hotmess_partners_by_category($category))) ?> Partner</span>
          <h3><?= e($category) ?></h3>
          <p>Vorbereitet für Website, App, Event, Weekend, Passport oder Community Platzierung, abhängig vom passenden Kontext.</p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Aktuelle Partner</p>
      <h2>Logo-Flächen und Partnerprofile.</h2>
    </div>
    <div class="partner-logo-grid">
      <?php foreach ($partners as $partner): ?>
        <article class="partner-logo-card">
          <div><?= e($partner['logo']) ?></div>
          <span><?= e($partner['category']) ?> / <?= e($partner['partnerType']) ?></span>
          <h3><?= e($partner['name']) ?></h3>
          <p><?= e($partner['city']) ?> / <?= e($partner['visibilityLevel']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Platzierungsmodell</p>
      <h2>Wo Partner sichtbar werden.</h2>
    </div>
    <div class="partner-placement-grid">
      <?php
        $placementBlocks = [
            'Website Platzierung' => ['Partnerlogo', 'Partnerprofil', 'Eventseite', 'Hotelseite', 'Weekend-Seite'],
            'App Platzierung' => ['Offer Card', 'Banner', 'City Guide', 'Kartenplatzierung', 'Push Message Platzhalter'],
            'Event Platzierung' => ['Logo auf Eventseite', 'VIP Area', 'Welcome Drink', 'Fast Lane Branding', 'Goodie Bag'],
            'Passport Platzierung' => ['Benefit für Free, Plus oder Black', 'Rabattcode', 'Member-only Angebot', 'VIP Upgrade'],
            'Weekend Platzierung' => ['Basic Weekend', 'Travel Weekend', 'VIP Weekend', 'Signature Weekend'],
        ];
      ?>
      <?php foreach ($placementBlocks as $title => $items): ?>
        <article class="premium-card">
          <span>Platzierung</span>
          <h3><?= e($title) ?></h3>
          <ul class="luxury-list">
            <?php foreach ($items as $item): ?>
              <li><?= e($item) ?></li>
            <?php endforeach; ?>
          </ul>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="membership-upsell partner-cta-band">
    <div>
      <p class="eyebrow">Sichtbar mit Haltung</p>
      <h2>Eine Partnerpräsenz, die zum Raum passt.</h2>
      <p>HOTMESS Partnerschaften entstehen in hochwertigen Kontexten: Events, Aufenthalte, Passport Vorteile, App-Angebote und kuratierte Weekends.</p>
    </div>
    <div class="hero-actions">
      <a class="button primary" href="/partners/apply">Partner werden</a>
      <a class="button ghost" href="/partners/events">Event-Sichtbarkeit</a>
    </div>
  </section>
</main>

<?php render_footer(); ?>
