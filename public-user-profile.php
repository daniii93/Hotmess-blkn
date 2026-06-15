<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$viewer = require_approved_member_or_admin();
hotmess_ensure_phase1_schema();

$username = trim((string) ($_GET['username'] ?? ''));
$username = ltrim($username, '@');

if ($username === '') {
    http_response_code(404);
    exit('Profil nicht gefunden.');
}

$stmt = db()->prepare(
    'SELECT id, name, first_name, last_name, username, instagram_handle, city, country, avatar_url, profile_photo, bio, role, status,
            verification_status, is_private, show_followers, show_following, show_event_count, followers_count, following_count,
            events_visited, last_seen_at, created_at
     FROM users
     WHERE (LOWER(username) = LOWER(?) OR LOWER(REPLACE(instagram_handle, "@", "")) = LOWER(?))
       AND role = "member"
       AND status <> "rejected"
       AND is_active = 1
     LIMIT 1'
);
$stmt->execute([$username, $username]);
$profile = $stmt->fetch();

if (!$profile) {
    http_response_code(404);
    exit('Profil nicht gefunden.');
}

if ((int) $profile['id'] !== (int) $viewer['id'] && ($viewer['role'] ?? '') !== 'admin') {
    record_profile_view((int) $profile['id'], (int) $viewer['id']);
}

$avatar = $profile['avatar_url'] ?: ($profile['profile_photo'] ?? null);
$handle = $profile['username'] ?: ltrim((string) ($profile['instagram_handle'] ?? ''), '@');

render_header('@' . $handle . ' | HOTMESS');
?>

<main class="profile-page">
  <section class="profile-hero">
    <div class="profile-cover">
      <span class="avatar profile-avatar"><?= chat_avatar($avatar ? (string) $avatar : null, (string) $profile['name']) ?></span>
      <div>
        <p class="eyebrow"><?= is_user_online($profile['last_seen_at'] ?? null) ? 'Online' : 'Offline' ?></p>
        <h1><?= e((string) $profile['name']) ?></h1>
        <p>@<?= e((string) $handle) ?> · <?= e((string) $profile['city']) ?><?= $profile['country'] ? ', ' . e((string) $profile['country']) : '' ?></p>
      </div>
    </div>

    <div class="profile-actions">
      <?php if ((int) $profile['id'] === (int) $viewer['id']): ?>
        <a class="button primary" href="/account/profile">Profil bearbeiten</a>
      <?php else: ?>
        <form method="post" action="/message-member.php">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="recipient_id" value="<?= e((string) $profile['id']) ?>" />
          <button class="button primary" type="submit">Chat starten</button>
        </form>
      <?php endif; ?>
      <a class="button ghost" href="/friends">Freunde</a>
    </div>
  </section>

  <section class="hm-app-grid">
    <article class="hm-app-card">
      <span class="hm-app-kicker">Profil</span>
      <h2><?= e($profile['verification_status'] === 'verified' ? 'Verifiziertes Mitglied' : 'HOTMESS Mitglied') ?></h2>
      <p><?= e((string) ($profile['bio'] ?: 'Dieses Profil ist Teil des HOTMESS Mitgliederbereichs.')) ?></p>
    </article>
    <article class="hm-app-card">
      <span class="hm-app-kicker">Aktivität</span>
      <?php if ((int) ($profile['show_event_count'] ?? 1) === 1): ?>
        <h2><?= e((string) (int) ($profile['events_visited'] ?? 0)) ?> Events besucht</h2>
      <?php else: ?>
        <h2>Aktivität privat</h2>
      <?php endif; ?>
      <p>Mitglied seit <?= e(date('d.m.Y', strtotime((string) $profile['created_at']))) ?></p>
    </article>
    <article class="hm-app-card">
      <span class="hm-app-kicker">Verbindungen</span>
      <h2>
        <?= (int) ($profile['show_followers'] ?? 1) === 1 ? e((string) (int) ($profile['followers_count'] ?? 0)) . ' Follower' : 'Follower privat' ?>
      </h2>
      <p>
        <?= (int) ($profile['show_following'] ?? 1) === 1 ? e((string) (int) ($profile['following_count'] ?? 0)) . ' folgt' : 'Folgt privat' ?>
      </p>
    </article>
  </section>
</main>

<?php render_footer(); ?>

