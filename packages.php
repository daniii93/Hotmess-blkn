<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/components.php';
require_once __DIR__ . '/app/packages-data.php';

$city = trim((string) ($_GET['city'] ?? ''));
$date = trim((string) ($_GET['date'] ?? ''));
$type = trim((string) ($_GET['type'] ?? ''));
$price = trim((string) ($_GET['price'] ?? ''));
$availability = trim((string) ($_GET['availability'] ?? ''));

$packages = hotmess_public_packages();
$filteredPackages = array_values(array_filter($packages, function (array $package) use ($city, $date, $type, $price, $availability): bool {
    if ($city !== '' && strcasecmp($package['city'], $city) !== 0) {
        return false;
    }

    if ($date !== '' && $package['startDate'] < $date) {
        return false;
    }

    if ($type !== '' && $package['packageType'] !== $type) {
        return false;
    }

    if ($availability !== '' && $package['availabilityStatus'] !== $availability) {
        return false;
    }

    if ($price !== '') {
        $maxPrice = (int) $price;
        if ($maxPrice > 0 && (int) $package['priceFrom'] > $maxPrice) {
            return false;
        }
    }

    return true;
}));

$cities = array_values(array_unique(array_map(fn (array $package): string => $package['city'], $packages)));
$types = ['basic', 'travel', 'vip', 'signature'];
$statuses = array_values(array_unique(array_map(fn (array $package): string => $package['availabilityStatus'], $packages)));

render_header('HOTMESS Weekends');
?>

<main class="packages-page">
  <section class="packages-hero">
    <div class="packages-hero__image" aria-hidden="true"></div>
    <div class="packages-hero__overlay"></div>
    <div class="packages-hero__content">
      <p class="eyebrow">HOTMESS Weekends</p>
      <h1>Nicht nur ein Ticket. Ein ganzes Wochenende.</h1>
      <p class="hero-lead">Event, Hoteloptionen, Shuttle-Hinweise, Partnerorte, VIP-Ebenen und Passport-Vorteile werden zu einem kuratierten Reiseerlebnis verbunden.</p>
      <div class="hero-actions">
        <a class="button primary" href="#packages-list">Package ansehen</a>
        <a class="button ghost" href="/tickets">Ticket einzeln kaufen</a>
        <a class="button ghost" href="/membership">Passport Vorteile ansehen</a>
      </div>
    </div>
  </section>

  <section class="packages-filter-section">
    <form class="packages-filter" method="get">
      <label>Stadt
        <select name="city">
          <option value="">Alle Städte</option>
          <?php foreach ($cities as $item): ?>
            <option value="<?= e($item) ?>" <?= $city === $item ? 'selected' : '' ?>><?= e($item) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Datum ab<input type="date" name="date" value="<?= e($date) ?>" /></label>
      <label>Pakettyp
        <select name="type">
          <option value="">Alle Typen</option>
          <?php foreach ($types as $item): ?>
            <option value="<?= e($item) ?>" <?= $type === $item ? 'selected' : '' ?>><?= e(hotmess_package_type_label($item)) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Preis bis
        <select name="price">
          <option value="">Alle Preise</option>
          <option value="100" <?= $price === '100' ? 'selected' : '' ?>>bis 100 EUR</option>
          <option value="250" <?= $price === '250' ? 'selected' : '' ?>>bis 250 EUR</option>
          <option value="500" <?= $price === '500' ? 'selected' : '' ?>>bis 500 EUR</option>
          <option value="1000" <?= $price === '1000' ? 'selected' : '' ?>>bis 1000 EUR</option>
        </select>
      </label>
      <label>Verfügbarkeit
        <select name="availability">
          <option value="">Alle Status</option>
          <?php foreach ($statuses as $item): ?>
            <option value="<?= e($item) ?>" <?= $availability === $item ? 'selected' : '' ?>><?= e(hotmess_package_availability_label($item)) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <button class="button primary" type="submit">Filtern</button>
      <a class="button ghost" href="/packages">Zurücksetzen</a>
    </form>
  </section>

  <section class="platform-section package-comparison-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Package Logik</p>
      <h2>Basic, Travel, VIP, Signature.</h2>
      <p>Jede Stufe erweitert das Wochenende vom einfachen Zugang bis zum begleiteten Reise- und Concierge-Erlebnis.</p>
    </div>
    <div class="package-comparison-grid">
      <?php foreach ($types as $item): ?>
        <article class="premium-card package-compare-card package-compare-card--<?= e($item) ?>">
          <span><?= e(hotmess_package_type_label($item)) ?></span>
          <h3>HOTMESS <?= e(hotmess_package_type_label($item)) ?> Weekend</h3>
          <ul class="luxury-list">
            <?php if ($item === 'basic'): ?>
              <li>Event Ticket</li><li>App Zugang</li><li>City Guide</li><li>Partner Benefits</li>
            <?php elseif ($item === 'travel'): ?>
              <li>Event Ticket</li><li>Hotelvorteil oder Kontingent</li><li>Shuttle Hinweise</li><li>Welcome Benefit</li>
            <?php elseif ($item === 'vip'): ?>
              <li>VIP Ticket</li><li>Fast Lane</li><li>Host Hotel Empfehlung</li><li>Concierge Kontakt</li>
            <?php else: ?>
              <li>Premium Hotel</li><li>VIP Ticket</li><li>Welcome Bag</li><li>Community Dinner oder Brunch</li>
            <?php endif; ?>
          </ul>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section id="packages-list" class="platform-section packages-list-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Verfügbare Weekends</p>
      <h2>Wählt die passende Erlebnisstufe.</h2>
      <p>Passport Mitglieder erhalten frühere Zuteilung, höhere Antwortpriorität und ausgewählte Partnervorteile.</p>
    </div>

    <div class="packages-grid">
      <?php foreach ($filteredPackages as $package): ?>
        <article class="package-list-card">
          <div class="package-list-card__media" style="background-image: url('<?= e($package['heroImage']) ?>')" aria-hidden="true">
            <span class="package-status-badge package-status-badge--<?= e($package['packageType']) ?>"><?= e(hotmess_package_type_label($package['packageType'])) ?></span>
          </div>
          <div class="package-list-card__body">
            <span><?= e($package['city']) ?> / <?= e(hotmess_package_availability_label($package['availabilityStatus'])) ?></span>
            <h3><?= e($package['title']) ?></h3>
            <p><?= e($package['shortDescription']) ?></p>
            <dl class="event-meta-list">
              <div><dt>Zeitraum</dt><dd><?= e(date('d.m.Y', strtotime($package['startDate']))) ?> - <?= e(date('d.m.Y', strtotime($package['endDate']))) ?></dd></div>
              <div><dt>Preis ab</dt><dd><?= e((string) $package['priceFrom']) ?> EUR</dd></div>
              <div><dt>Hotel</dt><dd><?= $package['hotelIds'] ? 'enthalten / vorbereitet' : 'separat' ?></dd></div>
              <div><dt>Shuttle</dt><dd><?= $package['shuttleIncluded'] ? 'enthalten / Hinweise' : 'nicht enthalten' ?></dd></div>
              <div><dt>VIP</dt><dd><?= $package['vipIncluded'] ? 'enthalten' : 'optional' ?></dd></div>
              <div><dt>Passport</dt><dd><?= e($package['membershipBenefits'][0] ?? 'Passport Vorteil vorbereitet') ?></dd></div>
            </dl>
            <ul class="package-mini-benefits">
              <?php foreach (array_slice($package['includedItems'], 0, 4) as $included): ?>
                <li><?= e($included['title']) ?></li>
              <?php endforeach; ?>
            </ul>
            <div class="event-card-actions">
              <a class="button primary" href="/packages/<?= e($package['slug']) ?>">Package ansehen</a>
              <a class="button ghost" href="/hotels">Hotel separat buchen</a>
            </div>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
