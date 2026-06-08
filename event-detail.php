<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/components.php';
require_once __DIR__ . '/app/events-data.php';
require_once __DIR__ . '/app/inquiry-data.php';

$slug = (string) ($_GET['slug'] ?? '');
$event = hotmess_event_by_slug($slug);

if (!$event) {
    http_response_code(404);
    render_header('Event not found');
    ?>
    <main class="platform-page">
      <section class="tickets-panel">
        <p class="eyebrow">Events</p>
        <h1>Event not found</h1>
        <p>This HOTMESS event is not available.</p>
        <a class="button primary" href="/events">Back to events</a>
      </section>
    </main>
    <?php
    render_footer();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    hotmess_handle_inquiry_submit(array_merge($_POST, [
        'type' => 'vip_table',
        'subject' => $event['title'],
        'relatedEventId' => $event['id'],
        'city' => $event['city'],
    ]));
    redirect('/events/' . $event['slug'] . '#vip-inquiry');
}

render_header($event['title'], build_event_metadata($event));
?>

<main class="event-detail-page">
  <section class="event-detail-hero">
    <div class="event-detail-hero__image" style="background-image: url('<?= e($event['heroImage']) ?>')" aria-hidden="true"></div>
    <div class="event-detail-hero__overlay"></div>
    <div class="event-detail-hero__content">
      <p class="eyebrow"><?= e($event['city']) ?> / <?= e(hotmess_ticket_status_label($event['ticketStatus'])) ?></p>
      <h1><?= e($event['title']) ?></h1>
      <p class="hero-lead"><?= e($event['shortDescription']) ?></p>
      <div class="event-detail-facts">
        <span><?= e(date('d.m.Y', strtotime($event['startDate']))) ?></span>
        <span><?= e($event['venue']) ?></span>
        <span>Doors <?= e($event['doorsOpen']) ?></span>
      </div>
      <div class="hero-actions">
        <a class="button primary" href="<?= e($event['ticketUrl']) ?>">Ticket CTA</a>
        <a class="button ghost" href="#vip">VIP CTA</a>
        <a class="button ghost" href="/hotels">Hotel CTA</a>
        <a class="button ghost" href="/packages">Package CTA</a>
      </div>
    </div>
  </section>

  <section class="event-story-section">
    <div>
      <p class="eyebrow">Event story</p>
      <h2>More campaign than club night.</h2>
      <p><?= e($event['longDescription']) ?></p>
    </div>
    <aside class="event-side-panel">
      <h3>Access notes</h3>
      <dl class="event-meta-list">
        <div><dt>Dresscode</dt><dd><?= e($event['dressCode']) ?></dd></div>
        <div><dt>Membership</dt><dd><?= e($event['membershipAccess']) ?></dd></div>
        <div><dt>Ticket status</dt><dd><?= e(hotmess_ticket_status_label($event['ticketStatus'])) ?></dd></div>
        <div><dt>Address</dt><dd><?= e($event['address']) ?></dd></div>
      </dl>
    </aside>
  </section>

  <section class="platform-section">
    <div class="event-detail-grid">
      <article class="premium-card">
        <span>Line-up</span>
        <h3>Selectors and hosts</h3>
        <ul class="luxury-list">
          <?php foreach (array_merge($event['lineup'], $event['hosts']) as $item): ?>
            <li><?= e($item) ?></li>
          <?php endforeach; ?>
        </ul>
      </article>
      <article class="premium-card" id="vip">
        <span>VIP / Table</span>
        <h3><?= $event['vipAvailable'] ? 'VIP available' : 'VIP closed' ?></h3>
        <p><?= e($event['vipDescription']) ?></p>
        <a class="button primary" href="#vip-inquiry"><?= $event['tableServiceAvailable'] ? 'Request table' : 'Join waitlist' ?></a>
      </article>
      <article class="premium-card">
        <span>App</span>
        <h3>Save this event in the HotMess App</h3>
        <p><?= $event['appEnabled'] ? 'Prepared for app saves, reminders, partner offers and travel notes.' : 'App visibility is currently disabled for this event.' ?></p>
        <a class="button ghost" href="/app">Preview app</a>
      </article>
    </div>
  </section>

  <section class="event-timetable-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Program</p>
      <h2>Timetable.</h2>
    </div>
    <div class="event-timetable">
      <?php foreach ($event['timetable'] as $item): ?>
        <article>
          <span><?= e($item['time']) ?></span>
          <h3><?= e($item['title']) ?></h3>
          <p><?= e($item['description']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="event-location-section">
    <div class="event-location-copy">
      <p class="eyebrow">Location</p>
      <h2><?= e($event['venue']) ?></h2>
      <p><?= e($event['address']) ?></p>
      <p>Location content is prepared for map embeds, hotel routing and member-only arrival instructions.</p>
    </div>
    <div class="event-location-media" style="background-image: url('<?= e($event['galleryImages'][1] ?? $event['heroImage']) ?>')" aria-hidden="true"></div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Gallery</p>
      <h2>Visual atmosphere.</h2>
    </div>
    <div class="event-gallery-grid">
      <?php foreach ($event['galleryImages'] as $image): ?>
        <div style="background-image: url('<?= e($image) ?>')" aria-label="Event gallery image"></div>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="event-faq-safety">
    <div>
      <p class="eyebrow">FAQ</p>
      <h2>Guest questions.</h2>
      <?php foreach ($event['faq'] as $faq): ?>
        <article>
          <h3><?= e($faq['question']) ?></h3>
          <p><?= e($faq['answer']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
    <div>
      <p class="eyebrow">Awareness / Safety</p>
      <h2>Respect the room.</h2>
      <ul class="luxury-list">
        <?php foreach ($event['safetyNotes'] as $note): ?>
          <li><?= e($note) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  </section>

  <section class="membership-upsell">
    <div>
      <p class="eyebrow">Membership</p>
      <h2>Access starts before the ticket.</h2>
      <p>Membership prepares early access, event saves, travel preferences and future Passport benefits.</p>
    </div>
    <div class="hero-actions">
      <a class="button primary" href="/membership">Mitglied werden</a>
      <a class="button ghost" href="/tickets?event=<?= e($event['slug']) ?>">Tickets ansehen</a>
    </div>
  </section>

  <section id="vip-inquiry" class="inquiry-form-section">
    <?php render_inquiry_form('vip_table', [
        'headline' => 'VIP / Table Anfrage',
        'buttonLabel' => $event['tableServiceAvailable'] ? 'VIP Anfrage senden' : 'Waitlist Anfrage senden',
        'subject' => $event['title'],
        'relatedEventId' => $event['id'],
        'city' => $event['city'],
        'messagePlaceholder' => 'Tell us guest count, budget range, preferred area and arrival context.',
    ]); ?>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Partners / Sponsors</p>
      <h2>Subtle visibility, premium context.</h2>
    </div>
    <div class="event-admin-grid">
      <?php foreach ($event['partners'] as $partner): ?>
        <article class="premium-card">
          <span><?= e($partner['visibility']) ?></span>
          <h3><?= e($partner['name']) ?></h3>
          <p><?= e($partner['benefits']) ?></p>
          <a class="button ghost" href="/partners/events">Partner placement</a>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
