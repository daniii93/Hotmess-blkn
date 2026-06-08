<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

require_admin();

$id = (int) ($_GET['id'] ?? 0);

$stmt = db()->prepare(
    'SELECT users.*, waitlist_requests.friends_count, waitlist_requests.motivation
     FROM users
     LEFT JOIN waitlist_requests ON waitlist_requests.user_id = users.id
     WHERE users.id = ? AND users.role = "member"
     LIMIT 1'
);
$stmt->execute([$id]);
$member = $stmt->fetch();

if (!$member) {
    http_response_code(404);
    exit('Bewerber nicht gefunden.');
}

$stmt = db()->prepare(
    'SELECT status_logs.*, admin.name AS admin_name
     FROM status_logs
     LEFT JOIN users admin ON admin.id = status_logs.admin_id
     WHERE status_logs.user_id = ?
     ORDER BY status_logs.created_at DESC'
);
$stmt->execute([$id]);
$logs = $stmt->fetchAll();

render_header('Bewerberdetails');
?>

<main class="admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Bewerberdetails</p>
    <h1><?= e($member['name']) ?></h1>
    <p><?= e($member['email']) ?> · <?= e($member['phone'] ?? '-') ?> · <?= e(member_status_label($member['status'])) ?></p>
  </section>

  <section class="applicant-detail">
    <article class="account-card">
      <h2>Profil</h2>
      <?php if (!empty($member['profile_photo'])): ?>
        <img class="profile-photo-large" src="<?= e($member['profile_photo']) ?>" alt="Profilbild von <?= e($member['name']) ?>" />
      <?php endif; ?>
      <p>Vorname: <?= e($member['first_name'] ?: '-') ?></p>
      <p>Nachname: <?= e($member['last_name'] ?: '-') ?></p>
      <p>Geburtsdatum: <?= e($member['birthdate'] ?? '-') ?></p>
      <p>Adresse: <?= e($member['street'] ?? '-') ?>, <?= e($member['postal_code'] ?? '-') ?> <?= e($member['city']) ?>, <?= e($member['country'] ?? '-') ?></p>
      <p>Instagram: <a href="https://www.instagram.com/<?= e(ltrim($member['instagram_handle'], '@')) ?>/" target="_blank" rel="noreferrer"><?= e($member['instagram_handle']) ?></a></p>
    </article>

    <article class="account-card">
      <h2>Verifizierung</h2>
      <p>E-Mail: <?= !empty($member['email_verified_at']) ? 'bestätigt am ' . e($member['email_verified_at']) : 'offen' ?></p>
      <p>Telefon: <?= !empty($member['phone_verified_at']) ? 'bestätigt am ' . e($member['phone_verified_at']) : 'offen' ?></p>
      <h2>Waitlist</h2>
      <p>Freunde: <?= e($member['friends_count'] ?? '-') ?></p>
      <p><?= e($member['motivation'] ?? '-') ?></p>
    </article>
  </section>

  <section class="status-log">
    <h2>Änderungsverlauf</h2>
    <?php foreach ($logs as $log): ?>
      <p>
        <?= e(member_status_label($log['old_status'])) ?> → <?= e(member_status_label($log['new_status'])) ?>
        <span><?= e(date('d.m.Y H:i', strtotime((string) $log['created_at']))) ?> · <?= e($log['admin_name'] ?? 'Admin') ?> · <?= e($log['action_type'] === 'bulk' ? 'Massenaktion' : 'Einzelaktion') ?></span>
      </p>
    <?php endforeach; ?>
  </section>
</main>

<?php render_footer(); ?>

