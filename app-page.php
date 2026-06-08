<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/app-data.php';

$features = hotmess_app_features();
$offers = hotmess_app_offers();
$savedItems = hotmess_app_saved_items();

render_header('HOTMESS Guide');
?>

<main class="hotmess-app-page">
  <section class="app-hero">
    <div class="app-hero__image" aria-hidden="true"></div>
    <div class="app-hero__overlay"></div>
    <div class="app-hero__content">
      <p class="eyebrow">HOTMESS Guide</p>
      <h1>Euer digitaler Concierge für die ganze Reise.</h1>
      <p class="hero-lead">Ein Begleiter vor, während und nach dem Erlebnis: Ticket Wallet, QR-Platzhalter, Hotels, Weekends, Partnerangebote, City Guide, Shuttle-Hinweise und Passport Card.</p>
      <div class="hero-actions">
        <a class="button primary" href="/app/profile">HOTMESS Guide öffnen</a>
        <a class="button ghost" href="/membership">Passport verbinden</a>
      </div>
      <p class="field-hint">PWA-Installation vorbereitet: Installationshinweis, Offline-Shell und Push-Berechtigungen können später angeschlossen werden.</p>
    </div>
    <aside class="app-phone-mockup">
      <div class="app-phone-screen">
        <span>HOTMESS GUIDE</span>
        <h2>Heute</h2>
        <article>
          <strong>Innsbruck Private Weekend</strong>
          <p>Ticket Wallet / QR-Platzhalter / Einlass 22:30</p>
        </article>
        <article>
          <strong>Passport Plus</strong>
          <p>3 gespeicherte Vorteile / 2 Event-Erinnerungen</p>
        </article>
        <nav class="app-bottom-nav" aria-label="App preview navigation">
          <a href="/app/events">Events</a>
          <a href="/app/tickets">Wallet</a>
          <a href="/app/map">Karte</a>
          <a href="/app/profile">Profil</a>
        </nav>
      </div>
    </aside>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">App Funktionen</p>
      <h2>Alles, was Gäste brauchen. Ohne Unruhe.</h2>
    </div>
    <div class="app-feature-grid">
      <?php foreach ($features as $feature): ?>
        <article class="app-feature-card">
          <span><?= e($feature['category']) ?></span>
          <h3><?= e($feature['title']) ?></h3>
          <p><?= e($feature['description']) ?></p>
          <a class="button ghost" href="/app/<?= e($feature['slug']) ?>">Öffnen</a>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="app-screen-section">
    <div class="app-mini-screen">
      <span>Ticket Wallet</span>
      <h3>QR-Platzhalter</h3>
      <p>HB-260718 / Fast Lane Signal / gespeichertes Event</p>
    </div>
    <div class="app-mini-screen">
      <span>Vorteile</span>
      <h3><?= e($offers[0]['title']) ?></h3>
      <p><?= e($offers[0]['code']) ?> / <?= e($offers[0]['tierRequired']) ?></p>
    </div>
    <div class="app-mini-screen">
      <span>Gespeichert</span>
      <h3><?= e($savedItems[0]['title']) ?></h3>
      <p>Event-Erinnerung und City Guide vorbereitet.</p>
    </div>
  </section>
</main>

<?php render_footer(); ?>
