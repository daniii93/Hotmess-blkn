<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_approved_member_or_admin();
hotmess_ensure_phase1_schema();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    db()->prepare('UPDATE hotmess_phase1_notifications SET read_at = COALESCE(read_at, NOW()) WHERE user_id = ?')->execute([(int) $user['id']]);
    flash('Benachrichtigungen wurden als gelesen markiert.');
    redirect('/notifications');
}

$notifications = [];
try {
    $stmt = db()->prepare(
        'SELECT * FROM hotmess_phase1_notifications
         WHERE user_id = ?
         ORDER BY read_at IS NULL DESC, created_at DESC
         LIMIT 60'
    );
    $stmt->execute([(int) $user['id']]);
    $notifications = $stmt->fetchAll();
} catch (Throwable) {
    $notifications = [];
}

render_header('Benachrichtigungen | HOTMESS');
?>

<main class="hm-app-page">
  <section class="hm-app-hero compact">
    <p class="eyebrow">HOTMESS Updates</p>
    <h1>Benachrichtigungen</h1>
    <p>Tickets, Chat, Event-Updates, Waitlist und Passport Hinweise laufen hier zentral zusammen.</p>
    <form method="post" class="hm-inline-form">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
      <button class="button ghost" type="submit">Alle als gelesen markieren</button>
    </form>
  </section>

  <?php render_flash(); ?>

  <section class="hm-panel">
    <?php if (!$notifications): ?>
      <div class="hm-empty-state">
        <h2>Noch keine Benachrichtigungen</h2>
        <p>Wenn sich etwas in deinem HOTMESS Konto bewegt, siehst du es hier zuerst.</p>
      </div>
    <?php else: ?>
      <div class="hm-list">
        <?php foreach ($notifications as $notification): ?>
          <a class="hm-list-item <?= empty($notification['read_at']) ? 'is-unread' : '' ?>" href="<?= e((string) ($notification['action_url'] ?: '/account')) ?>">
            <span class="hm-list-dot"></span>
            <span>
              <strong><?= e((string) $notification['title']) ?></strong>
              <small><?= e((string) ($notification['body'] ?? '')) ?></small>
            </span>
            <time><?= e(date('d.m.Y H:i', strtotime((string) $notification['created_at']))) ?></time>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </section>
</main>

<?php render_footer(); ?>

