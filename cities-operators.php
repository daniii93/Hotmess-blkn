<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/city-ops-data.php';

render_header('City Operators');
?>
<main class="partners-page">
  <section class="partners-hero">
    <div class="partners-hero__image" aria-hidden="true"></div><div class="partners-hero__overlay"></div>
    <div class="partners-hero__content"><p class="eyebrow">City Operator System</p><h1>HotMess city teams for premium local growth.</h1><p class="hero-lead">Each city can be operated by a City Lead, Community Lead, Partner Lead and Ambassador Team under central HotMess brand standards.</p><div class="hero-actions"><a class="button primary" href="/partners/apply">Become a City Partner</a><a class="button ghost" href="/contact">Contact HotMess</a></div></div>
  </section>
  <section class="platform-section"><div class="section-heading platform-heading"><p class="eyebrow">Prepared cities</p><h2>Operator model and expansion markets.</h2></div><div class="event-admin-grid"><?php foreach (hotmess_expansion_markets() as $market): ?><article class="premium-card"><span><?= e($market['priority']) ?> / <?= e($market['status']) ?></span><h3><?= e($market['city']) ?></h3><p><?= e($market['country']) ?> / potential <?= e((string) $market['marketPotential']) ?> / competition <?= e($market['competitionLevel']) ?></p></article><?php endforeach; ?></div></section>
</main>
<?php render_footer(); ?>
