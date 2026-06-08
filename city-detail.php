<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$slug = strtolower((string) ($_GET['city'] ?? 'innsbruck'));
$cities = [
    'innsbruck' => ['name' => 'Innsbruck', 'status' => 'Aktiv', 'image' => '/assets/community-hero.png'],
    'wien' => ['name' => 'Wien', 'status' => 'Demnächst', 'image' => '/assets/packages.png'],
    'vienna' => ['name' => 'Wien', 'status' => 'Demnächst', 'image' => '/assets/packages.png'],
    'dubrovnik' => ['name' => 'Dubrovnik', 'status' => 'In Planung', 'image' => '/assets/waitlist.png'],
];

$city = $cities[$slug] ?? ['name' => ucwords(str_replace('-', ' ', $slug)), 'status' => 'In Planung', 'image' => '/assets/community-hero.png'];

render_header($city['name'] . ' entdecken');
?>

<main class="platform-page">
  <section class="luxury-hero">
    <div class="luxury-hero__media" style="background-image: url('<?= e($city['image']) ?>')" aria-hidden="true"></div>
    <div class="luxury-hero__content">
      <p class="eyebrow">HOTMESS City · <?= e($city['status']) ?></p>
      <h1><?= e($city['name']) ?></h1>
      <p>Jede Stadt bringt ihre eigene Energie, ihre eigenen Begegnungen und ihre eigenen Erinnerungen mit sich. Diese City-Seite ist als kuratierter Ausgangspunkt für Events, Hotels, Weekends und Community-Momente vorbereitet.</p>
      <div class="hero-actions">
        <a class="button primary" href="/events?city=<?= e(urlencode($city['name'])) ?>">Events entdecken</a>
        <a class="button ghost" href="/packages">Wochenenden entdecken</a>
        <a class="button ghost" href="/hotels">Hotels entdecken</a>
      </div>
    </div>
  </section>
</main>

<?php render_footer(); ?>
