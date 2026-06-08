<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/account-data.php';
require_once __DIR__ . '/app/inquiry-data.php';

$user = require_login();
$section = (string) ($_GET['section'] ?? 'overview');
$allowedSections = array_column(hotmess_account_nav(), 'slug');

if (!in_array($section, $allowedSections, true)) {
    http_response_code(404);
    exit('Account-Bereich nicht gefunden.');
}

$account = hotmess_account_data($user);
$safetyNotice = hotmess_user_safety_notice($user);
$profile = $account['profile'];
$membership = $account['membership'];
$tier = $membership['tier'];
$sectionTitles = [
    'overview' => ['Private Concierge', 'Membership, Tickets, Events, Hotels, Packages und Benefits in einem privaten HotMess Account.'],
    'profile' => ['Profile', 'Persoenliche Daten, Interessen, bevorzugte Staedte und Profilbild-Platzhalter.'],
    'membership' => ['Passport', 'Aktueller Passport Status, digitale Member Card, Benefits und Upgrade Optionen.'],
    'tickets' => ['Ticket Wallet', 'Aktive Tickets, QR-Code Platzhalter und Wallet-Integrationen.'],
    'events' => ['Saved Events', 'Gespeicherte, besuchte und empfohlene Events mit Reminder-Platzhalter.'],
    'hotels' => ['Hotel Concierge', 'Gespeicherte Hotels, Host-Hotel Vorteile und Buchungslinks.'],
    'packages' => ['Weekend Desk', 'Gespeicherte Packages, Anfragen, VIP Interessen und Concierge-Platzhalter.'],
    'benefits' => ['Benefit Wallet', 'Aktive Rabattcodes, Partnerangebote und Einloesestatus.'],
    'rewards' => ['HotMess Rewards', 'HotMess Points, Status-Level, naechste Belohnung und vergangene Aktivitaeten.'],
    'referrals' => ['Referrals', 'Persoenlicher Einladungscode, geworbene Freunde und Referral Rewards.'],
    'concierge' => ['Concierge', 'Persoenliche Empfehlungen, Reisevorschlaege, Favoriten, Benefits und Concierge Historie.'],
    'settings' => ['Settings', 'Sprache, Benachrichtigungen, Newsletter, Datenschutz und Account-Optionen.'],
];
$title = $sectionTitles[$section];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $section === 'packages') {
    verify_csrf();
    hotmess_handle_inquiry_submit(array_merge($_POST, [
        'type' => 'package',
        'subject' => 'Account Concierge Package Anfrage',
        'city' => $profile['city'],
    ]));
    redirect('/account/packages#concierge-inquiry');
}

function render_account_nav(string $active): void
{
    ?>
    <nav class="account-nav" aria-label="Account navigation">
      <?php foreach (hotmess_account_nav() as $item): ?>
        <a class="<?= $active === $item['slug'] ? 'is-active' : '' ?>" href="<?= e($item['href']) ?>"><?= e($item['label']) ?></a>
      <?php endforeach; ?>
    </nav>
    <?php
}

function render_account_member_card(array $profile, array $tier, array $membership): void
{
    ?>
    <aside class="account-member-card account-member-card--<?= e($tier['slug']) ?>">
      <span>HOTMESS PASSPORT</span>
      <strong><?= e(strtoupper($tier['badgeLabel'])) ?></strong>
      <p><?= e($profile['name']) ?></p>
      <small>ID <?= e((string) $profile['userId']) ?> / <?= e($membership['status']) ?> / renews <?= e($membership['renewsAt']) ?></small>
    </aside>
    <?php
}

function render_account_status_badge(string $status): void
{
    ?><span class="account-status-badge"><?= e($status) ?></span><?php
}

render_header('Account ' . $title[0]);
?>

<main class="account-concierge-page account-concierge-page--<?= e($section) ?>">
  <?php if ($safetyNotice !== ''): ?>
    <section class="admin-section premium-card">
      <p class="eyebrow">Member Safety</p>
      <h2>Konto-Hinweis</h2>
      <p><?= e($safetyNotice) ?></p>
      <a class="button ghost" href="/contact">HOTMESS Team kontaktieren</a>
    </section>
  <?php endif; ?>
  <section class="account-hero">
    <div class="account-hero__content">
      <p class="eyebrow">Account / <?= e($title[0]) ?></p>
      <h1><?= e($section === 'overview' ? 'Welcome back, ' . $profile['name'] : $title[0]) ?></h1>
      <p><?= e($title[1]) ?></p>
      <div class="hero-actions">
        <a class="button primary" href="/account/membership">Upgrade Passport</a>
        <a class="button ghost" href="/app">Open HotMess Guide</a>
      </div>
    </div>
    <?php render_account_member_card($profile, $tier, $membership); ?>
  </section>

  <?php render_account_nav($section); ?>

  <?php if ($section === 'overview'): ?>
    <section class="account-dashboard">
      <div class="account-kpi-grid">
        <article><span>Membership</span><strong><?= e($tier['badgeLabel']) ?></strong><p><?= e($membership['status']) ?></p></article>
        <article><span>Active Tickets</span><strong><?= e((string) count($account['tickets'])) ?></strong><p>Ticket Wallet prepared</p></article>
        <article><span>Saved Events</span><strong><?= e((string) count($account['savedEvents'])) ?></strong><p>Reminder ready</p></article>
        <article><span>Hotels</span><strong><?= e((string) count($account['hotels'])) ?></strong><p>Saved and recommended</p></article>
        <article><span>Packages</span><strong><?= e((string) count($account['packages'])) ?></strong><p>Weekend desk</p></article>
        <article><span>Benefits</span><strong><?= e((string) count($account['benefits'])) ?></strong><p>Codes and offers</p></article>
      </div>

      <div class="account-overview-grid">
        <article class="account-lux-card">
          <span>Next events</span>
          <h2>Your upcoming nights</h2>
          <div class="account-mini-list">
            <?php foreach ($account['savedEvents'] as $saved): ?>
              <a href="/events/<?= e($saved['event']['slug']) ?>"><strong><?= e($saved['event']['title']) ?></strong><span><?= e($saved['event']['city']) ?> / <?= e($saved['event']['startDate']) ?></span></a>
            <?php endforeach; ?>
          </div>
        </article>
        <article class="account-lux-card">
          <span>Ticket Wallet</span>
          <h2>Active tickets</h2>
          <div class="account-mini-list">
            <?php foreach ($account['tickets'] as $ticket): ?>
              <a href="/account/tickets"><strong><?= e($ticket['eventName']) ?></strong><span><?= e($ticket['ticketType']) ?> / <?= e($ticket['status']) ?></span></a>
            <?php endforeach; ?>
          </div>
        </article>
        <article class="account-lux-card">
          <span>Travel</span>
          <h2>Hotels and packages</h2>
          <div class="account-mini-list">
            <?php foreach (array_slice(array_merge($account['hotels'], $account['packages']), 0, 4) as $item): ?>
              <a href="<?= e($item['bookingUrl'] ?? '/account/packages') ?>"><strong><?= e($item['name'] ?? $item['package']['title']) ?></strong><span><?= e($item['city'] ?? $item['package']['city']) ?> / <?= e($item['status']) ?></span></a>
            <?php endforeach; ?>
          </div>
        </article>
        <article class="account-lux-card">
          <span>Benefits</span>
          <h2>Ready to use</h2>
          <div class="account-mini-list">
            <?php foreach ($account['benefits'] as $benefit): ?>
              <a href="/account/benefits"><strong><?= e($benefit['title']) ?></strong><span><?= e($benefit['code'] ?? 'No code') ?> / <?= e($benefit['status']) ?></span></a>
            <?php endforeach; ?>
          </div>
        </article>
      </div>
    </section>
  <?php elseif ($section === 'profile'): ?>
    <section class="account-form-section">
      <form class="account-lux-form" method="post">
        <label>Name<input name="name" value="<?= e($profile['name']) ?>" /></label>
        <label>E-Mail<input type="email" name="email" value="<?= e($profile['email']) ?>" /></label>
        <label>Stadt<input name="city" value="<?= e($profile['city']) ?>" /></label>
        <label>Geburtstag<input type="date" name="birthday" value="<?= e($profile['birthday']) ?>" /></label>
        <label>Interessen<textarea name="interests"><?= e(implode(', ', $profile['interests'])) ?></textarea></label>
        <label>Bevorzugte Staedte<textarea name="preferredCities"><?= e(implode(', ', $profile['preferredCities'])) ?></textarea></label>
        <label>Profilbild Platzhalter<input name="avatarUrl" value="<?= e($profile['avatarUrl']) ?>" placeholder="/uploads/profile-photos/..." /></label>
        <label class="check-row"><input type="checkbox" name="newsletterConsent" value="1" <?= $profile['newsletterConsent'] ? 'checked' : '' ?> /> Newsletter Zustimmung</label>
        <button class="button primary" type="button">Profile update placeholder</button>
      </form>
    </section>
  <?php elseif ($section === 'membership'): ?>
    <section class="account-two-column">
      <?php render_account_member_card($profile, $tier, $membership); ?>
      <article class="account-lux-card">
        <span>Stripe Subscription</span>
        <h2><?= e($tier['name']) ?></h2>
        <p>Status: <?= e($membership['status']) ?> / Renewal: <?= e($membership['renewsAt']) ?> / Subscription: <?= e($membership['stripeSubscriptionId'] ?? 'not connected') ?></p>
        <ul class="luxury-list">
          <?php foreach ($tier['benefits'] as $benefit): ?>
            <li><?= e($benefit) ?></li>
          <?php endforeach; ?>
        </ul>
        <div class="hero-actions">
          <a class="button primary" href="/membership/plus">Plus kaufen</a>
          <a class="button ghost" href="/membership/black">Black kaufen</a>
        </div>
      </article>
    </section>
  <?php elseif ($section === 'tickets'): ?>
    <section class="account-card-grid">
      <?php foreach ($account['tickets'] as $ticket): ?>
        <article class="account-ticket-card">
          <div class="account-qr-placeholder"><?= e($ticket['qrCode']) ?></div>
          <span><?= e($ticket['ticketType']) ?></span>
          <h2><?= e($ticket['eventName']) ?></h2>
          <p><?= e($ticket['date']) ?></p>
          <?php render_account_status_badge($ticket['status']); ?>
          <div class="hero-actions"><button class="button ghost" type="button" disabled>Apple Wallet vorbereitet</button><button class="button ghost" type="button" disabled>Google Wallet vorbereitet</button></div>
        </article>
      <?php endforeach; ?>
    </section>
  <?php elseif ($section === 'events'): ?>
    <section class="account-card-grid">
      <?php foreach ($account['savedEvents'] as $saved): ?>
        <article class="account-lux-card account-media-card">
          <div style="background-image:url('<?= e($saved['event']['heroImage']) ?>')"></div>
          <span><?= e($saved['status']) ?> / Reminder <?= $saved['reminderEnabled'] ? 'active' : 'inactive' ?></span>
          <h2><?= e($saved['event']['title']) ?></h2>
          <p><?= e($saved['event']['city']) ?> / <?= e($saved['event']['venue']) ?> / <?= e($saved['event']['startDate']) ?></p>
          <a class="button primary" href="/events/<?= e($saved['event']['slug']) ?>">Event ansehen</a>
        </article>
      <?php endforeach; ?>
    </section>
  <?php elseif ($section === 'hotels'): ?>
    <section class="account-card-grid">
      <?php foreach ($account['hotels'] as $hotel): ?>
        <article class="account-lux-card">
          <span><?= e($hotel['status']) ?> / <?= e($hotel['city']) ?></span>
          <h2><?= e($hotel['name']) ?></h2>
          <p><?= e($hotel['benefit']) ?></p>
          <a class="button primary" href="<?= e($hotel['bookingUrl']) ?>">Hotel ansehen</a>
        </article>
      <?php endforeach; ?>
    </section>
  <?php elseif ($section === 'packages'): ?>
    <section class="account-card-grid">
      <?php foreach ($account['packages'] as $savedPackage): ?>
        <article class="account-lux-card account-media-card">
          <div style="background-image:url('<?= e($savedPackage['package']['heroImage']) ?>')"></div>
          <span><?= e($savedPackage['status']) ?> / VIP <?= $savedPackage['vipInterest'] ? 'interest' : 'no' ?></span>
          <h2><?= e($savedPackage['package']['title']) ?></h2>
          <p><?= e($savedPackage['package']['city']) ?> / ab <?= e((string) $savedPackage['package']['priceFrom']) ?> EUR</p>
          <div class="hero-actions"><a class="button primary" href="/packages/<?= e($savedPackage['package']['slug']) ?>">Package ansehen</a><a class="button ghost" href="#concierge-inquiry">Concierge Anfrage</a></div>
        </article>
      <?php endforeach; ?>
    </section>
    <section id="concierge-inquiry" class="inquiry-form-section">
      <?php render_inquiry_form('package', [
          'headline' => 'Concierge Anfrage',
          'buttonLabel' => 'Concierge Anfrage senden',
          'city' => $profile['city'],
          'messagePlaceholder' => 'Tell us which package, date, hotel and VIP layer you want us to prepare.',
      ]); ?>
    </section>
  <?php elseif ($section === 'benefits'): ?>
    <section class="account-card-grid">
      <?php foreach ($account['benefits'] as $benefit): ?>
        <article class="account-benefit-card">
          <span><?= e($benefit['category']) ?></span>
          <h2><?= e($benefit['title']) ?></h2>
          <strong><?= e($benefit['code'] ?? 'MEMBER') ?></strong>
          <?php render_account_status_badge($benefit['status']); ?>
        </article>
      <?php endforeach; ?>
    </section>
  <?php elseif ($section === 'rewards'): ?>
    <?php
      $customer = $account['customerProfile'];
      $levels = $account['loyaltyLevels'];
      $currentLevel = array_values(array_filter($levels, fn (array $level): bool => $level['slug'] === $customer['loyaltyLevel']))[0] ?? $levels[0];
      $nextLevel = null;
      foreach ($levels as $level) {
          if ((int) $level['threshold'] > (int) $customer['loyaltyScore']) {
              $nextLevel = $level;
              break;
          }
      }
      $nextThreshold = (int) ($nextLevel['threshold'] ?? $currentLevel['threshold']);
      $progress = $nextThreshold > 0 ? min(100, (int) round(((int) $customer['loyaltyScore'] / $nextThreshold) * 100)) : 100;
    ?>
    <section class="crm-rewards-hero">
      <article class="crm-status-card">
        <span>HotMess Points</span>
        <strong><?= e((string) $customer['loyaltyScore']) ?></strong>
        <p><?= e($currentLevel['title']) ?> status / <?= e($customer['lifecycleStage']) ?></p>
        <div class="crm-progress" aria-label="Loyalty progress"><i style="width: <?= e((string) $progress) ?>%"></i></div>
        <small><?= $nextLevel ? e((string) ($nextThreshold - (int) $customer['loyaltyScore'])) . ' points to ' . e($nextLevel['title']) : 'Top level reached' ?></small>
      </article>
      <article class="crm-score-grid">
        <div><span>Event</span><strong><?= e((string) $customer['eventScore']) ?></strong></div>
        <div><span>Travel</span><strong><?= e((string) $customer['travelScore']) ?></strong></div>
        <div><span>Community</span><strong><?= e((string) $customer['communityScore']) ?></strong></div>
        <div><span>Membership</span><strong><?= e((string) $customer['membershipScore']) ?></strong></div>
      </article>
    </section>
    <section class="account-two-column">
      <article class="account-lux-card">
        <span>Available Rewards</span>
        <h2>Benefits that feel earned, not discounted.</h2>
        <div class="account-mini-list">
          <?php foreach ($account['rewards'] as $reward): ?>
            <a href="/account/rewards"><strong><?= e($reward['title']) ?></strong><span><?= e((string) $reward['pointsRequired']) ?> points / <?= e($reward['status']) ?></span></a>
          <?php endforeach; ?>
        </div>
      </article>
      <article class="account-lux-card">
        <span>Activity</span>
        <h2>Recent point movements</h2>
        <div class="account-mini-list">
          <?php foreach ($account['loyaltyTransactions'] as $transaction): ?>
            <a href="/account/rewards"><strong>+<?= e((string) $transaction['points']) ?> / <?= e($transaction['type']) ?></strong><span><?= e($transaction['description']) ?> / <?= e($transaction['createdAt']) ?></span></a>
          <?php endforeach; ?>
        </div>
      </article>
    </section>
    <section class="account-card-grid">
      <?php foreach ($levels as $level): ?>
        <article class="loyalty-level-card <?= $level['slug'] === $customer['loyaltyLevel'] ? 'is-current' : '' ?>">
          <span><?= e($level['badge']) ?></span>
          <h2><?= e($level['title']) ?></h2>
          <p><?= e((string) $level['threshold']) ?> points threshold</p>
          <ul class="luxury-list">
            <?php foreach ($level['benefits'] as $benefit): ?>
              <li><?= e($benefit) ?></li>
            <?php endforeach; ?>
          </ul>
        </article>
      <?php endforeach; ?>
    </section>
  <?php elseif ($section === 'referrals'): ?>
    <?php $referrals = $account['referrals']; ?>
    <section class="crm-rewards-hero">
      <article class="crm-status-card">
        <span>Personal Referral Code</span>
        <strong><?= e($referrals['code']) ?></strong>
        <p>Invite guests who match the HotMess circle. Rewards unlock after meaningful conversion.</p>
        <div class="hero-actions">
          <a class="button primary" href="<?= e($referrals['inviteUrl']) ?>">Einladungslink oeffnen</a>
          <a class="button ghost" href="/account/rewards">Rewards ansehen</a>
        </div>
      </article>
      <article class="account-lux-card">
        <span>Next referral stage</span>
        <h2>Three converted friends unlock a Fast Lane request.</h2>
        <p>Referral rewards are designed for quality introductions, not mass invites.</p>
      </article>
    </section>
    <section class="account-two-column">
      <article class="account-lux-card">
        <span>Friends</span>
        <h2>Referral activity</h2>
        <div class="account-mini-list">
          <?php foreach ($referrals['friends'] as $friend): ?>
            <a href="/account/referrals"><strong><?= e($friend['name']) ?></strong><span><?= e($friend['status']) ?> / <?= e($friend['reward']) ?></span></a>
          <?php endforeach; ?>
        </div>
      </article>
      <article class="account-lux-card">
        <span>Rewards</span>
        <h2>Granted and next</h2>
        <div class="account-mini-list">
          <?php foreach ($referrals['rewards'] as $reward): ?>
            <a href="/account/referrals"><strong><?= e($reward['title']) ?></strong><span><?= e($reward['description']) ?> / <?= e($reward['status']) ?></span></a>
          <?php endforeach; ?>
        </div>
      </article>
    </section>
  <?php elseif ($section === 'concierge'): ?>
    <?php $concierge = $account['conciergeRecommendations']; ?>
    <section class="crm-rewards-hero">
      <article class="crm-status-card">
        <span>Personal Concierge</span>
        <strong><?= e($account['conciergeProfile']['loyaltyLevel']) ?></strong>
        <p><?= e($account['conciergeProfile']['travelStyle']) ?> / <?= e(implode(', ', $account['conciergeProfile']['preferredCities'])) ?></p>
        <div class="hero-actions"><a class="button primary" href="/app/concierge">Open in Guide</a><a class="button ghost" href="/contact">Concierge Anfrage</a></div>
      </article>
      <article class="account-lux-card">
        <span>Concierge answer</span>
        <h2>Your weekend should start before the door opens.</h2>
        <p>Based on your profile, combine <?= e($concierge['events'][0]['title']) ?> with <?= e($concierge['hotels'][0]['title']) ?> and save <?= e($concierge['benefits'][0]['title']) ?> before arrival.</p>
      </article>
    </section>
    <section class="account-two-column">
      <article class="account-lux-card"><span>Recommendations</span><h2>Curated next steps</h2><div class="account-mini-list"><?php foreach (array_merge($concierge['events'], $concierge['packages']) as $item): ?><a href="<?= e($item['href']) ?>"><strong><?= e($item['title']) ?></strong><span><?= e($item['description']) ?></span></a><?php endforeach; ?></div></article>
      <article class="account-lux-card"><span>History</span><h2>Concierge requests</h2><div class="account-mini-list"><?php foreach ($account['conciergeRequests'] as $request): ?><a href="/account/concierge"><strong><?= e($request['category']) ?> / <?= e($request['status']) ?></strong><span><?= e($request['message']) ?></span></a><?php endforeach; ?></div></article>
    </section>
  <?php elseif ($section === 'settings'): ?>
    <section class="account-form-section">
      <form class="account-lux-form" method="post">
        <label>Sprache<input name="language" value="<?= e($account['preferences']['language']) ?>" /></label>
        <label class="check-row"><input type="checkbox" name="notifications" value="1" <?= $account['preferences']['notifications'] ? 'checked' : '' ?> /> Benachrichtigungen</label>
        <label class="check-row"><input type="checkbox" name="eventReminders" value="1" <?= $account['preferences']['eventReminders'] ? 'checked' : '' ?> /> Event Reminder</label>
        <label class="check-row"><input type="checkbox" name="hotelUpdates" value="1" <?= $account['preferences']['hotelUpdates'] ? 'checked' : '' ?> /> Hotel Updates</label>
        <label class="check-row"><input type="checkbox" name="partnerOffers" value="1" <?= $account['preferences']['partnerOffers'] ? 'checked' : '' ?> /> Partner Offers</label>
        <label class="check-row"><input type="checkbox" name="newsletter" value="1" <?= $account['preferences']['newsletter'] ? 'checked' : '' ?> /> Newsletter</label>
        <label>Datenschutz<textarea name="privacyMode"><?= e($account['preferences']['privacyMode']) ?></textarea></label>
        <label>Account loeschen<textarea name="deleteAccountPlaceholder"><?= e($account['preferences']['deleteAccountPlaceholder']) ?></textarea></label>
        <button class="button primary" type="button">Settings update placeholder</button>
      </form>
    </section>
  <?php endif; ?>
</main>

<?php render_footer(); ?>
