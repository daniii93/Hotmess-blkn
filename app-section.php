<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/app-data.php';
require_once __DIR__ . '/app/events-data.php';
require_once __DIR__ . '/app/packages-data.php';
require_once __DIR__ . '/app/membership-data.php';

$section = (string) ($_GET['section'] ?? 'events');
$feature = hotmess_app_feature_by_slug($section) ?: hotmess_app_feature_by_slug('events');
$title = $feature ? $feature['title'] : 'HotMess Guide';
$offers = hotmess_app_offers();
$guideItems = hotmess_app_city_guide_items();
$savedItems = hotmess_app_saved_items();
$events = hotmess_public_events();
$packages = hotmess_public_packages();
$membership = hotmess_user_membership(current_user());

render_header($title);
?>

<main class="hotmess-app-page app-section-page app-section-page--<?= e($section) ?>">
  <section class="app-section-shell">
    <aside class="app-phone-mockup app-section-phone">
      <div class="app-phone-screen">
        <span>HOTMESS GUIDE</span>
        <h2><?= e($title) ?></h2>
        <?php if ($section === 'tickets'): ?>
          <article><strong>Ticket Wallet</strong><p>QR-Code Platzhalter / HB-260718 / Passport <?= e($membership['tier']['badgeLabel']) ?></p></article>
          <article><strong>Entry notes</strong><p>Doors 22:30 / Fast lane signal prepared.</p></article>
        <?php elseif ($section === 'hotels'): ?>
          <?php foreach (array_slice($guideItems, 0, 2) as $item): ?><article><strong><?= e($item['title']) ?></strong><p><?= e($item['city']) ?> / <?= e($item['description']) ?></p></article><?php endforeach; ?>
        <?php elseif ($section === 'packages'): ?>
          <?php foreach (array_slice($packages, 0, 2) as $package): ?><article><strong><?= e($package['title']) ?></strong><p><?= e($package['city']) ?> / ab <?= e((string) $package['priceFrom']) ?> EUR</p></article><?php endforeach; ?>
        <?php elseif ($section === 'map'): ?>
          <?php foreach (array_slice($guideItems, 0, 2) as $item): ?><article><strong><?= e($item['title']) ?></strong><p><?= e($item['type']) ?> / <?= e($item['address']) ?></p></article><?php endforeach; ?>
        <?php elseif ($section === 'offers'): ?>
          <?php foreach (array_slice($offers, 0, 2) as $offer): ?><article><strong><?= e($offer['title']) ?></strong><p><?= e($offer['code']) ?> / <?= e($offer['city']) ?></p></article><?php endforeach; ?>
        <?php elseif ($section === 'profile'): ?>
          <article><strong><?= e($membership['tier']['name']) ?></strong><p>Digital member card / renewal <?= e($membership['renewsAt']) ?></p></article>
          <article><strong>Saved benefits</strong><p><?= e(implode(', ', $membership['codes'])) ?></p></article>
        <?php else: ?>
          <?php foreach (array_slice($events, 0, 2) as $event): ?><article><strong><?= e($event['title']) ?></strong><p><?= e($event['city']) ?> / <?= e($event['doorsOpen']) ?></p></article><?php endforeach; ?>
        <?php endif; ?>
        <nav class="app-bottom-nav" aria-label="App navigation">
          <a href="/app/events">Events</a>
          <a href="/app/tickets">Wallet</a>
          <a href="/app/map">Map</a>
          <a href="/app/profile">Profile</a>
        </nav>
      </div>
    </aside>

    <div class="app-section-content">
      <p class="eyebrow">HotMess Guide</p>
      <h1><?= e($title) ?></h1>
      <p><?= e($feature['description'] ?? 'A premium app surface prepared for the HOTMESS platform.') ?></p>
      <div class="hero-actions">
        <a class="button primary" href="/membership">Connect Passport</a>
        <a class="button ghost" href="/app">Back to Guide</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Prepared modules</p>
      <h2><?= e($title) ?> content.</h2>
    </div>
    <div class="app-feature-grid">
      <?php
      $cards = match ($section) {
          'tickets' => [
              ['title' => 'QR-Code Platzhalter', 'text' => 'Ticket wallet structure for event entry and check-in.'],
              ['title' => 'Ticket history', 'text' => 'Prepared connection to orders and external providers.'],
              ['title' => 'Fast lane signal', 'text' => 'Passport Black upgrade state can appear here.'],
          ],
          'hotels' => array_map(fn (array $item): array => ['title' => $item['title'], 'text' => $item['description']], $guideItems),
          'packages' => array_map(fn (array $package): array => ['title' => $package['title'], 'text' => $package['shortDescription']], $packages),
          'map' => array_map(fn (array $item): array => ['title' => $item['title'], 'text' => $item['city'] . ' / ' . $item['description']], $guideItems),
          'offers' => array_map(fn (array $offer): array => ['title' => $offer['title'], 'text' => $offer['code'] . ' / ' . $offer['description']], $offers),
          'profile' => [
              ['title' => 'Digital Member Card', 'text' => $membership['tier']['name'] . ' / Stripe placeholder ready.'],
              ['title' => 'Saved items', 'text' => implode(', ', array_map(fn (array $item): string => $item['title'], $savedItems))],
              ['title' => 'Stored benefits', 'text' => implode(', ', $membership['codes'])],
          ],
          default => array_map(fn (array $event): array => ['title' => $event['title'], 'text' => $event['shortDescription']], $events),
      };
      ?>
      <?php foreach (array_slice($cards, 0, 6) as $card): ?>
        <article class="app-feature-card">
          <span><?= e($section) ?></span>
          <h3><?= e($card['title']) ?></h3>
          <p><?= e($card['text']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
