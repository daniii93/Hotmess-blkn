<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$admin = require_admin();
hotmess_ensure_member_safety_schema();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $targetUserId = (int) ($_POST['user_id'] ?? 0);
    $action = (string) ($_POST['action'] ?? '');
    $reason = trim((string) ($_POST['reason'] ?? ''));

    try {
        if ($targetUserId > 0 && in_array($action, ['warn_user', 'restrict_chat', 'temp_suspend_user', 'permanent_suspend_user', 'lift_safety'], true)) {
            $expiresAt = $action === 'temp_suspend_user' ? new DateTimeImmutable('+7 days') : null;
            hotmess_apply_moderation_action($targetUserId, (int) $admin['id'], $action, $reason, null, $expiresAt);
            flash('Safety-Aktion wurde gespeichert.');
        }
    } catch (Throwable $exception) {
        flash('Safety-Aktion konnte nicht gespeichert werden: ' . $exception->getMessage());
    }

    redirect('/admin/users');
}

$filter = (string) ($_GET['filter'] ?? '');
$users = hotmess_member_safety_rows($filter);

render_header('Admin Users | HOTMESS BLKN');
?>

<main class="admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Member Safety</p>
    <h1>Admin Users</h1>
    <p>Nutzerstatus, Chat-Rechte, Verwarnungen und Sperren systemweit verwalten.</p>
    <?php render_flash(); ?>
    <div class="hero-actions">
      <a class="button <?= $filter === '' ? 'primary' : 'ghost' ?>" href="/admin/users">Alle</a>
      <?php foreach (hotmess_safety_statuses() as $status => $label): ?>
        <a class="button <?= $filter === $status ? 'primary' : 'ghost' ?>" href="/admin/users?filter=<?= e($status) ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="admin-module-section">
    <div class="table-wrap">
      <table class="admin-lux-table">
        <thead><tr><th>Nutzer</th><th>Status</th><th>Chat</th><th>Warnungen</th><th>Aktivitaet</th><th>Notiz / Aktion</th></tr></thead>
        <tbody>
          <?php foreach ($users as $row): ?>
            <tr>
              <td><strong><?= e((string) $row['name']) ?></strong><span><?= e((string) $row['email']) ?> / <?= e((string) $row['role']) ?></span></td>
              <td><span class="status-pill"><?= e(hotmess_safety_statuses()[(string) $row['safety_status']] ?? (string) $row['safety_status']) ?></span><span><?= e((string) ($row['suspended_until'] ?? '')) ?></span></td>
              <td><?= e(hotmess_chat_statuses()[(string) $row['chat_status']] ?? (string) $row['chat_status']) ?></td>
              <td><?= e((string) $row['warning_count']) ?><span><?= e((string) ($row['last_warning_at'] ?? '')) ?></span></td>
              <td><?= e((string) ($row['last_seen_at'] ?? '')) ?></td>
              <td>
                <form method="post">
                  <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                  <input type="hidden" name="user_id" value="<?= e((string) $row['id']) ?>" />
                  <input name="reason" placeholder="Interne Notiz / Grund" value="<?= e((string) ($row['moderation_notes'] ?? '')) ?>" />
                  <div class="form-actions">
                    <button class="button ghost" name="action" value="warn_user" type="submit">Verwarnen</button>
                    <button class="button ghost" name="action" value="restrict_chat" type="submit">Chat read-only</button>
                    <button class="button ghost" name="action" value="temp_suspend_user" type="submit">7 Tage sperren</button>
                    <button class="button ghost" name="action" value="permanent_suspend_user" type="submit">Bannen</button>
                    <button class="button primary" name="action" value="lift_safety" type="submit">Sperre aufheben</button>
                  </div>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$users): ?>
            <tr><td colspan="6">Keine Nutzer fuer diesen Filter.</td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </section>
</main>

<?php render_footer(); ?>
