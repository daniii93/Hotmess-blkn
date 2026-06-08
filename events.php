<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/components.php';
require_once __DIR__ . '/app/events-data.php';

$city = trim((string) ($_GET['city'] ?? ''));
$category = trim((string) ($_GET['category'] ?? ''));
$availability = trim((string) ($_GET['availability'] ?? ''));
$date = trim((string) ($_GET['date'] ?? ''));

$events = hotmess_public_events();
$filteredEvents = array_values(array_filter($events, function (array $event) use ($city, $category, $availability, $date): bool {
    if ($city !== '' && strcasecmp($event['city'], $city) !== 0) {
        return false;
    }

    if ($category !== '' && strcasecmp($event['category'], $category) !== 0) {
        return false;
    }

    if ($availability !== '' && $event['ticketStatus'] !== $availability) {
        return false;
    }

    if ($date !== '' && $event['startDate'] < $date) {
        return false;
    }

    return true;
}));

$nextEvent = hotmess_next_event() ?: ($events[0] ?? null);
$cities = array_values(array_unique(array_map(fn (array $event): string => $event['city'], $events)));
$categories = array_values(array_unique(array_map(fn (array $event): string => $event['category'], $events)));
$statuses = array_values(array_unique(array_map(fn (array $event): string => $event['ticketStatus'], $events)));

render_header('Events');
?>

<main class="events-page">
  <section class="events-hero">
    <div class="events-hero__image" aria-hidden="true"></div>
    <div class="events-hero__overlay"></div>
    <div class="events-hero__content">
      <p class="eyebrow">HOTMESS Events</p>
      <h1>Nächte, die nicht nur stattfinden. Sie bleiben.</h1>
      <p class="hero-lead">Kuratierte Erlebnisse mit bewusstem Zugang, starken Bildern, ausgewählten Orten, Hoteloptionen, Weekends, App-Erinnerungen und Passport-Vorteilen.</p>
      <div class="hero-actions">
        <a class="button primary" href="/tickets">Tickets ansehen</a>
        <a class="button ghost" href="/membership">Mitglied werden</a>
      </div>
    </div>
  </section>

  <?php if ($nextEvent): ?>
    <section class="highlight-event">
      <div class="highlight-event__media" style="background-image: url('<?= e($nextEvent['heroImage']) ?>')" aria-hidden="true"></div>
      <div class="highlight-event__content">
        <p class="eyebrow">Nächstes Highlight</p>
        <h2><?= e($nextEvent['title']) ?></h2>
        <p><?= e($nextEvent['shortDescription']) ?></p>
        <dl class="event-meta-list">
          <div><dt>Stadt</dt><dd><?= e($nextEvent['city']) ?></dd></div>
          <div><dt>Ort</dt><dd><?= e($nextEvent['venue']) ?></dd></div>
          <div><dt>Datum</dt><dd><?= e(date('d.m.Y', strtotime($nextEvent['startDate']))) ?></dd></div>
          <div><dt>Zugang</dt><dd><?= e($nextEvent['membershipAccess']) ?></dd></div>
        </dl>
        <div class="hero-actions">
          <a class="button primary" href="<?= e($nextEvent['ticketUrl']) ?>">Tickets ansehen</a>
          <a class="button ghost" href="/hotels">Hotel buchen</a>
          <a class="button ghost" href="/packages">Package ansehen</a>
        </div>
      </div>
    </section>
  <?php endif; ?>

  <section class="events-filter-section">
    <form class="events-filter" method="get">
      <label>
        Stadt
        <select name="city">
          <option value="">Alle Städte</option>
          <?php foreach ($cities as $item): ?>
            <option value="<?= e($item) ?>" <?= $city === $item ? 'selected' : '' ?>><?= e($item) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>
        Datum ab
        <input type="date" name="date" value="<?= e($date) ?>" />
      </label>
      <label>
        Kategorie
        <select name="category">
          <option value="">Alle Kategorien</option>
          <?php foreach ($categories as $item): ?>
            <option value="<?= e($item) ?>" <?= $category === $item ? 'selected' : '' ?>><?= e($item) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>
        Verfügbarkeit
        <select name="availability">
          <option value="">Alle Status</option>
          <?php foreach ($statuses as $item): ?>
            <option value="<?= e($item) ?>" <?= $availability === $item ? 'selected' : '' ?>><?= e(hotmess_ticket_status_label($item)) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <button class="button primary" type="submit">Events filtern</button>
      <a class="button ghost" href="/events">Zurücksetzen</a>
    </form>
  </section>

  <section class="platform-section events-list-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Kalender</p>
      <h2>Alle HOTMESS Erlebnisse.</h2>
      <p>Jede Karte zeigt die wichtigsten Informationen klar, ruhig und mit direktem Weg zu Detailseite, Tickets und weiteren Vorteilen.</p>
    </div>

    <div class="events-grid">
      <?php foreach ($filteredEvents as $event): ?>
        <article class="event-list-card">
          <div class="event-list-card__media" style="background-image: url('<?= e($event['heroImage']) ?>')" aria-hidden="true">
            <span class="event-status-badge event-status-badge--<?= e($event['ticketStatus']) ?>"><?= e(hotmess_ticket_status_label($event['ticketStatus'])) ?></span>
          </div>
          <div class="event-list-card__body">
            <span><?= e($event['category']) ?></span>
            <h3><?= e($event['title']) ?></h3>
            <dl class="event-meta-list">
              <div><dt>Stadt</dt><dd><?= e($event['city']) ?></dd></div>
              <div><dt>Location</dt><dd><?= e($event['venue']) ?></dd></div>
              <div><dt>Datum</dt><dd><?= e(date('d.m.Y', strtotime($event['startDate']))) ?></dd></div>
              <div><dt>Einlass</dt><dd><?= e($event['doorsOpen']) ?></dd></div>
              <div><dt>Dresscode</dt><dd><?= e($event['dressCode']) ?></dd></div>
              <div><dt>Preis ab</dt><dd><?= e((string) $event['priceFrom']) ?> EUR</dd></div>
              <div><dt>Passport Vorteil</dt><dd><?= e($event['membershipAccess']) ?></dd></div>
            </dl>
            <div class="event-card-actions">
              <a class="button primary" href="/events/<?= e($event['slug']) ?>">Detailseite</a>
              <a class="button ghost" href="<?= e($event['ticketUrl']) ?>">Tickets</a>
            </div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
