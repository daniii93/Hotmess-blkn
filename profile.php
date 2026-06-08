<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_approved_member_or_admin();
$profileId = (int) ($_GET['id'] ?? $user['id']);

$stmt = db()->prepare(
    'SELECT id, name, first_name, last_name, city, country, instagram_handle, profile_photo, status, role, last_seen_at, created_at
     FROM users
     WHERE id = ? AND role = "member" AND status <> "rejected"
     LIMIT 1'
);
$stmt->execute([$profileId]);
$profile = $stmt->fetch();

if (!$profile) {
    http_response_code(404);
    exit('Profil nicht gefunden.');
}

if ((int) $profile['id'] !== (int) $user['id'] && ($user['role'] ?? '') !== 'admin') {
    record_profile_view((int) $profile['id'], (int) $user['id']);
}

render_header('Profil');
?>

<main class="profile-page">
  <section class="profile-hero">
    <div class="profile-cover">
      <span class="avatar profile-avatar"><?= chat_avatar($profile['profile_photo'] ?? null, (string) $profile['name']) ?></span>
      <div>
        <p class="eyebrow"><?= is_user_online($profile['last_seen_at'] ?? null) ? 'Online' : 'Offline' ?></p>
        <h1><?= e($profile['name']) ?></h1>
        <p>@<?= e(ltrim((string) $profile['instagram_handle'], '@')) ?> · <?= e($profile['city']) ?><?= $profile['country'] ? ', ' . e((string) $profile['country']) : '' ?></p>
      </div>
    </div>

    <div class="profile-actions">
      <?php if ((int) $profile['id'] === (int) $user['id']): ?>
        <a class="button primary" href="profile-visitors.php">Profilbesucher ansehen</a>
      <?php else: ?>
        <form method="post" action="message-member.php">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="recipient_id" value="<?= e((string) $profile['id']) ?>" />
          <button class="button primary" type="submit">Chat starten</button>
        </form>
      <?php endif; ?>
      <a class="button ghost" href="/chat">Chat</a>
    </div>
  </section>

  <section class="profile-details">
    <article class="account-card">
      <h2>Profil</h2>
      <p>Name: <?= e($profile['name']) ?></p>
      <p>Benutzername: @<?= e(ltrim((string) $profile['instagram_handle'], '@')) ?></p>
      <p>Stadt: <?= e($profile['city']) ?></p>
      <p>Mitglied seit: <?= e(date('d.m.Y', strtotime((string) $profile['created_at']))) ?></p>
    </article>
  </section>
</main>

<?php render_footer(); ?>
