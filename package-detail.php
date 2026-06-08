<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/components.php';
require_once __DIR__ . '/app/packages-data.php';
require_once __DIR__ . '/app/inquiry-data.php';
require_once __DIR__ . '/app/payments.php';

$slug = (string) ($_GET['slug'] ?? '');
$package = hotmess_package_by_slug($slug);

if (!$package) {
    http_response_code(404);
    render_header('Package not found');
    ?>
    <main class="platform-page">
      <section class="tickets-panel">
        <p class="eyebrow">Packages</p>
        <h1>Package not found</h1>
        <p>This HOTMESS Weekend is not available.</p>
        <a class="button primary" href="/packages">Back to packages</a>
      </section>
    </main>
    <?php
    render_footer();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    hotmess_handle_inquiry_submit(array_merge($_POST, [
        'type' => 'package',
        'subject' => $package['title'],
        'relatedPackageId' => $package['id'],
        'city' => $package['city'],
    ]));
    redirect('/packages/' . $package['slug'] . '#inquiry');
}

render_header($package['title'], build_package_metadata($package));
?>

<main class="package-detail-page">
  <section class="package-detail-hero">
    <div class="package-detail-hero__image" style="background-image: url('<?= e($package['heroImage']) ?>')" aria-hidden="true"></div>
    <div class="package-detail-hero__overlay"></div>
    <div class="package-detail-hero__content">
      <p class="eyebrow"><?= e($package['city']) ?> / <?= e(hotmess_package_type_label($package['packageType'])) ?> / <?= e(hotmess_package_availability_label($package['availabilityStatus'])) ?></p>
      <h1><?= e($package['title']) ?></h1>
      <p class="hero-lead"><?= e($package['shortDescription']) ?></p>
      <div class="event-detail-facts">
        <span><?= e(date('d.m.Y', strtotime($package['startDate']))) ?> - <?= e(date('d.m.Y', strtotime($package['endDate']))) ?></span>
        <span>ab <?= e((string) $package['priceFrom']) ?> EUR</span>
        <span><?= $package['vipIncluded'] ? 'VIP included' : 'VIP optional' ?></span>
      </div>
      <div class="hero-actions">
        <?php if (!in_array($package['availabilityStatus'], ['sold_out', 'request_only'], true)): ?>
          <form method="post" action="/payment/checkout">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="kind" value="package" />
            <input type="hidden" name="package_slug" value="<?= e($package['slug']) ?>" />
            <input type="hidden" name="return_to" value="/packages/<?= e($package['slug']) ?>" />
            <button class="button primary" type="submit"><?= hotmess_stripe_is_configured() ? 'Direkt buchen' : 'Stripe nicht konfiguriert' ?></button>
          </form>
        <?php endif; ?>
        <a class="button primary" href="#inquiry">Book your HotMess Weekend</a>
        <a class="button ghost" href="/tickets">Ticket einzeln kaufen</a>
        <a class="button ghost" href="/membership">Passport Vorteile</a>
      </div>
    </div>
  </section>

  <section class="package-story-section">
    <div>
      <p class="eyebrow">Weekend concept</p>
      <h2>Event, stay, movement and access.</h2>
      <p><?= e($package['longDescription']) ?></p>
    </div>
    <aside class="event-side-panel">
      <h3>Package facts</h3>
      <dl class="event-meta-list">
        <div><dt>Type</dt><dd><?= e(hotmess_package_type_label($package['packageType'])) ?></dd></div>
        <div><dt>Hotel</dt><dd><?= $package['hotelIds'] ? 'included or allocated' : 'separate' ?></dd></div>
        <div><dt>Shuttle</dt><dd><?= $package['shuttleIncluded'] ? 'included / prepared' : 'not included' ?></dd></div>
        <div><dt>Concierge</dt><dd><?= $package['conciergeIncluded'] ? 'included' : 'not included' ?></dd></div>
        <div><dt>Welcome Bag</dt><dd><?= $package['welcomeBagIncluded'] ? 'included' : 'not included' ?></dd></div>
      </dl>
    </aside>
  </section>

  <section class="platform-section">
    <div class="package-benefit-columns">
      <article class="premium-card">
        <span>Included</span>
        <h3>What is inside</h3>
        <ul class="luxury-list">
          <?php foreach ($package['includedItems'] as $item): ?>
            <li><strong><?= e($item['title']) ?></strong> - <?= e($item['description']) ?></li>
          <?php endforeach; ?>
        </ul>
      </article>
      <article class="premium-card">
        <span>Not included</span>
        <h3>Clear boundaries</h3>
        <ul class="luxury-list">
          <?php foreach ($package['excludedItems'] as $item): ?>
            <li><?= e($item) ?></li>
          <?php endforeach; ?>
        </ul>
      </article>
      <article class="premium-card">
        <span>Membership</span>
        <h3>Passport advantage</h3>
        <ul class="luxury-list">
          <?php foreach ($package['membershipBenefits'] as $item): ?>
            <li><?= e($item) ?></li>
          <?php endforeach; ?>
        </ul>
        <a class="button ghost" href="/membership">Passport Vorteile ansehen</a>
      </article>
    </div>
  </section>

  <section class="package-itinerary-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Itinerary</p>
      <h2>Your weekend rhythm.</h2>
    </div>
    <div class="package-itinerary">
      <?php foreach ($package['itinerary'] as $item): ?>
        <article>
          <span><?= e($item['day']) ?> / <?= e($item['time']) ?></span>
          <h3><?= e($item['title']) ?></h3>
          <p><?= e($item['description']) ?></p>
          <small><?= e($item['location']) ?></small>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="package-inclusions-section">
    <div class="premium-card">
      <span>Events</span>
      <h3>Included event IDs</h3>
      <p><?= e(implode(', ', $package['eventIds'])) ?></p>
      <a class="button ghost" href="/events">View events</a>
    </div>
    <div class="premium-card">
      <span>Hotels</span>
      <h3>Included hotel layer</h3>
      <p><?= $package['hotelIds'] ? e(implode(', ', $package['hotelIds'])) : 'Hotel can be booked separately.' ?></p>
      <a class="button ghost" href="/hotels">Hotel separat buchen</a>
    </div>
    <div class="premium-card">
      <span>Shuttle / VIP</span>
      <h3>Movement and access</h3>
      <p><?= $package['shuttleIncluded'] ? 'Shuttle or transfer option prepared.' : 'Shuttle is not included in this package.' ?> <?= $package['vipIncluded'] ? 'VIP benefits are included.' : 'VIP can be requested separately.' ?></p>
      <a class="button ghost" href="#inquiry">Anfrage senden</a>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Partner offers</p>
      <h2>Curated weekend partners.</h2>
    </div>
    <div class="event-admin-grid">
      <?php foreach ($package['partners'] as $partner): ?>
        <?php if (!in_array($package['packageType'], $partner['packageTypes'], true)) { continue; } ?>
        <article class="premium-card">
          <span><?= e($partner['partnerType']) ?></span>
          <h3><?= e($partner['name']) ?></h3>
          <p><?= e($partner['contribution']) ?></p>
          <p><?= e($partner['visibility']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="event-gallery-grid package-gallery-grid">
    <?php foreach ($package['galleryImages'] as $image): ?>
      <div style="background-image: url('<?= e($image) ?>')" aria-label="Package gallery image"></div>
    <?php endforeach; ?>
  </section>

  <section class="event-faq-safety">
    <div>
      <p class="eyebrow">FAQ</p>
      <h2>Before you request.</h2>
      <?php foreach ($package['faq'] as $faq): ?>
        <article>
          <h3><?= e($faq['question']) ?></h3>
          <p><?= e($faq['answer']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
    <div id="inquiry">
      <?php render_inquiry_form('package', [
          'headline' => 'Book your HotMess Weekend',
          'buttonLabel' => 'Package Anfrage senden',
          'subject' => $package['title'],
          'relatedPackageId' => $package['id'],
          'city' => $package['city'],
          'messagePlaceholder' => 'Tell us dates, group size and what kind of weekend you want.',
      ]); ?>
      <p class="field-hint">Inquiry target: <?= e($package['inquiryEmail']) ?></p>
    </div>
  </section>
</main>

<?php render_footer(); ?>
