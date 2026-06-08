<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_login();

if (($user['role'] ?? '') !== 'admin' && (!is_verified($user, 'email') || !is_verified($user, 'phone'))) {
    flash('Bitte bestätige zuerst deine E-Mail-Adresse und Telefonnummer.');
    redirect('verify.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    if (($_POST['action'] ?? '') === 'profile_photo') {
        try {
            $profilePhoto = handle_profile_photo_upload($_FILES['profile_photo'] ?? null);

            if (!$profilePhoto) {
                flash('Bitte wähle zuerst ein Profilbild aus.');
            } else {
                $stmt = db()->prepare('UPDATE users SET profile_photo = ? WHERE id = ?');
                $stmt->execute([$profilePhoto, $user['id']]);
                flash('Profilbild aktualisiert.');
                redirect('dashboard.php');
            }
        } catch (RuntimeException $exception) {
            flash($exception->getMessage());
        }
    }

    $friends = trim($_POST['friends_count'] ?? '');
    $motivation = trim($_POST['motivation'] ?? '');

    if ($friends === '') {
        flash('Bitte gib an, mit wie vielen Freunden du kommen möchtest.');
    } else {
        $stmt = db()->prepare('SELECT id FROM waitlist_requests WHERE user_id = ? LIMIT 1');
        $stmt->execute([$user['id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            $stmt = db()->prepare('UPDATE waitlist_requests SET friends_count = ?, motivation = ?, status = "pending" WHERE user_id = ?');
            $stmt->execute([$friends, $motivation, $user['id']]);
        } else {
            $stmt = db()->prepare('INSERT INTO waitlist_requests (user_id, friends_count, motivation) VALUES (?, ?, ?)');
            $stmt->execute([$user['id'], $friends, $motivation]);
        }

        flash('Deine Waitlist-Anfrage ist gespeichert und wartet auf Prüfung.');
        redirect('dashboard.php');
    }
}

$stmt = db()->prepare('SELECT * FROM waitlist_requests WHERE user_id = ? LIMIT 1');
$stmt->execute([$user['id']]);
$request = $stmt->fetch();

render_header('Account');
?>

<main class="dashboard-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Dein Status</p>
    <h1><?= e(member_status_label($user['status'])) ?></h1>
    <p>
      Stadt: <?= e($user['city']) ?> · Instagram:
      <a href="https://www.instagram.com/<?= e(ltrim($user['instagram_handle'], '@')) ?>/" target="_blank" rel="noreferrer">
        <?= e($user['instagram_handle']) ?>
      </a>
    </p>
    <p>
      <?= e($user['street'] ?? '') ?>, <?= e($user['postal_code'] ?? '') ?> <?= e($user['city']) ?>,
      <?= e($user['country'] ?? '') ?> · Telefon: <?= e($user['phone'] ?? '') ?>
    </p>
    <?php if (!empty($user['profile_photo'])): ?>
      <img class="profile-photo-large" src="<?= e($user['profile_photo']) ?>" alt="Profilbild von <?= e($user['name']) ?>" />
    <?php endif; ?>
    <?php render_flash(); ?>
  </section>

  <section class="account-grid">
    <article class="account-card">
      <h2>Waitlist</h2>
      <?php if ($request): ?>
        <p>Status: <strong><?= e(member_status_label($request['status'])) ?></strong></p>
      <?php else: ?>
        <p>Noch keine Anfrage gesendet.</p>
      <?php endif; ?>
      <form class="stack-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <label>
          Mit wie vielen Freunden?
          <select name="friends_count" required>
            <?php
            $options = ['Alleine', '2 Personen', '3-4 Personen', '5+ Personen'];
            foreach ($options as $option):
                $selected = (($request['friends_count'] ?? '') === $option) ? 'selected' : '';
            ?>
              <option value="<?= e($option) ?>" <?= $selected ?>><?= e($option) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>
          Warum passt HOTMESS zu dir?
          <textarea name="motivation" rows="5"><?= e($request['motivation'] ?? '') ?></textarea>
        </label>
        <button class="button primary" type="submit">Waitlist senden</button>
      </form>
    </article>

    <article class="account-card">
      <h2>Profilbild</h2>
      <p>Aktualisiere dein Bild für die manuelle Community-Prüfung.</p>
      <form class="stack-form" method="post" enctype="multipart/form-data">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="profile_photo" />
        <label>
          Foto hochladen
          <input type="file" name="profile_photo" accept="image/*" required />
          <span class="field-hint">Galerie oder Kamera, je nach Gerät.</span>
        </label>
        <button class="button primary" type="submit">Profilbild speichern</button>
      </form>
    </article>

    <article class="account-card">
      <h2>Tickets</h2>
      <?php if ($user['status'] === 'approved' && ($request['status'] ?? '') === 'approved'): ?>
        <p>Du bist freigegeben. Der Ticketverkauf kann jetzt für dich geöffnet werden.</p>
        <a class="button primary" href="tickets.php">Tickets anzeigen</a>
      <?php elseif ($user['status'] === 'rejected' || ($request['status'] ?? '') === 'rejected'): ?>
        <p>Deine Anfrage wurde aktuell nicht freigegeben.</p>
      <?php else: ?>
        <p>Tickets werden erst sichtbar, wenn dein Mitgliedsprofil und deine Waitlist-Anfrage freigegeben sind.</p>
      <?php endif; ?>
    </article>
  </section>
</main>

<?php render_footer(); ?>
