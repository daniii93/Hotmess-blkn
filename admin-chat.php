<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$admin = require_admin();
prepare_chat_moderation_schema();
hotmess_ensure_member_safety_schema();

$page = (string) ($_GET['page'] ?? 'overview');
$reportId = (int) ($_GET['reportId'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $action = (string) ($_POST['action'] ?? '');
    $postedReportId = (int) ($_POST['report_id'] ?? 0);
    $note = trim((string) ($_POST['resolution_note'] ?? $_POST['reason'] ?? ''));

    if ($postedReportId > 0) {
        $stmt = db()->prepare('SELECT * FROM chat_reports WHERE id = ? LIMIT 1');
        $stmt->execute([$postedReportId]);
        $report = $stmt->fetch();

        if ($report) {
            $targetUserId = $report['reported_user_id'] ? (int) $report['reported_user_id'] : 0;
            if (in_array($action, ['in_review', 'resolved', 'dismissed'], true)) {
                db()->prepare(
                    'UPDATE chat_reports
                     SET status = ?, reviewed_by = ?, reviewed_at = NOW(), resolution_note = ?
                     WHERE id = ?'
                )->execute([$action, (int) $admin['id'], $note, $postedReportId]);
                log_chat_admin_access((int) $admin['id'], 'report_' . $action, $postedReportId, (int) $report['chat_id'], $targetUserId ?: null, $note);
                flash('Chat-Meldung aktualisiert.');
            } elseif ($action === 'block_chat') {
                db()->prepare('UPDATE conversation_participants SET blocked = 1 WHERE conversation_id = ?')->execute([(int) $report['chat_id']]);
                log_chat_admin_access((int) $admin['id'], 'chat_blocked', $postedReportId, (int) $report['chat_id'], $targetUserId ?: null, $note);
                flash('Chat wurde fuer weitere Beitraege gesperrt.');
            } elseif ($targetUserId > 0 && in_array($action, ['warn_user', 'restrict_chat', 'temp_suspend_user', 'permanent_suspend_user', 'lift_safety'], true)) {
                $expiresAt = $action === 'temp_suspend_user' ? new DateTimeImmutable('+7 days') : null;
                hotmess_apply_moderation_action($targetUserId, (int) $admin['id'], $action, $note, $postedReportId, $expiresAt);
                if ($action === 'restrict_chat') {
                    db()->prepare('UPDATE conversation_participants SET muted = 1 WHERE conversation_id = ?')->execute([(int) $report['chat_id']]);
                }
                $auditAction = match ($action) {
                    'warn_user' => 'user_warned',
                    'restrict_chat' => 'chat_read_only',
                    'temp_suspend_user' => 'user_temp_suspended',
                    'permanent_suspend_user' => 'user_banned',
                    'lift_safety' => 'user_safety_lifted',
                    default => $action,
                };
                log_chat_admin_access((int) $admin['id'], $auditAction, $postedReportId, (int) $report['chat_id'], $targetUserId, $note);
                flash(match ($action) {
                    'warn_user' => 'Nutzer wurde verwarnt.',
                    'restrict_chat' => 'Chat wurde eingeschraenkt und Nutzer ist read-only.',
                    'temp_suspend_user' => 'Nutzer wurde temporaer gesperrt.',
                    'permanent_suspend_user' => 'Nutzer wurde dauerhaft gesperrt.',
                    'lift_safety' => 'Moderationssperre wurde aufgehoben.',
                    default => 'Moderationsaktion gespeichert.',
                });
            }
        }
    }

    redirect('/admin/chat/reports' . ($postedReportId ? '/' . $postedReportId : ''));
}

function admin_chat_reports(): array
{
    $stmt = db()->query(
        'SELECT chat_reports.*,
                reporter.name AS reporter_name,
                reporter.email AS reporter_email,
                reported.name AS reported_name,
                reported.email AS reported_email,
                reported.safety_status AS reported_safety_status,
                reported.chat_status AS reported_chat_status,
                reported.warning_count AS reported_warning_count,
                reviewer.name AS reviewer_name
         FROM chat_reports
         JOIN users reporter ON reporter.id = chat_reports.reporter_id
         LEFT JOIN users reported ON reported.id = chat_reports.reported_user_id
         LEFT JOIN users reviewer ON reviewer.id = chat_reports.reviewed_by
         ORDER BY FIELD(chat_reports.status, "new", "in_review", "resolved", "dismissed"), chat_reports.created_at DESC
         LIMIT 80'
    );

    return $stmt->fetchAll();
}

function admin_chat_report_detail(int $reportId): ?array
{
    $stmt = db()->prepare(
        'SELECT chat_reports.*,
                reporter.name AS reporter_name,
                reporter.email AS reporter_email,
                reported.name AS reported_name,
                reported.email AS reported_email,
                reported.safety_status AS reported_safety_status,
                reported.chat_status AS reported_chat_status,
                reported.warning_count AS reported_warning_count,
                reported.suspended_until AS reported_suspended_until,
                reviewer.name AS reviewer_name
         FROM chat_reports
         JOIN users reporter ON reporter.id = chat_reports.reporter_id
         LEFT JOIN users reported ON reported.id = chat_reports.reported_user_id
         LEFT JOIN users reviewer ON reviewer.id = chat_reports.reviewed_by
         WHERE chat_reports.id = ?
         LIMIT 1'
    );
    $stmt->execute([$reportId]);
    $report = $stmt->fetch();

    return $report ?: null;
}

function admin_chat_report_messages(int $reportId): array
{
    $stmt = db()->prepare(
        'SELECT chat_report_messages.*, users.name AS sender_name
         FROM chat_report_messages
         LEFT JOIN users ON users.id = chat_report_messages.sender_id
         WHERE chat_report_messages.report_id = ?
         ORDER BY chat_report_messages.sent_at ASC, chat_report_messages.id ASC'
    );
    $stmt->execute([$reportId]);

    return $stmt->fetchAll();
}

function admin_chat_audit_log(): array
{
    $stmt = db()->query(
        'SELECT chat_admin_audit_log.*, users.name AS admin_name
         FROM chat_admin_audit_log
         JOIN users ON users.id = chat_admin_audit_log.admin_id
         ORDER BY chat_admin_audit_log.created_at DESC
         LIMIT 120'
    );

    return $stmt->fetchAll();
}

$reports = admin_chat_reports();
$report = $reportId > 0 ? admin_chat_report_detail($reportId) : null;
$reportMessages = $report ? admin_chat_report_messages((int) $report['id']) : [];
$auditRows = $page === 'audit-log' ? admin_chat_audit_log() : [];

if ($report) {
    log_chat_admin_access((int) $admin['id'], 'report_viewed', (int) $report['id'], (int) $report['chat_id'], $report['reported_user_id'] ? (int) $report['reported_user_id'] : null, 'Admin viewed reported snapshot');
}

render_header('Admin Chat Moderation | HOTMESS BLKN');
?>

<main class="admin-page">
  <section class="admin-hero compact">
    <p class="eyebrow">Moderierbarer Mitglieder-Chat</p>
    <h1>Chat Safety Control</h1>
    <p>Admins sehen keine freien privaten Chats. Zugriff ist auf gemeldete Inhalte, Sicherheitsfaelle und dokumentierte Supportfaelle beschraenkt.</p>
    <div class="hero-actions">
      <a class="button <?= $page === 'overview' ? 'primary' : 'ghost' ?>" href="/admin/chat">Uebersicht</a>
      <a class="button <?= $page === 'reports' ? 'primary' : 'ghost' ?>" href="/admin/chat/reports">Meldungen</a>
      <a class="button <?= $page === 'audit-log' ? 'primary' : 'ghost' ?>" href="/admin/chat/audit-log">Audit Log</a>
      <a class="button ghost" href="/admin/users">Admin Users</a>
    </div>
  </section>

  <?php if ($page === 'audit-log'): ?>
    <section class="admin-section">
      <div class="section-heading"><p class="eyebrow">Audit Pflicht</p><h2>Admin-Zugriffe</h2></div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Zeit</th><th>Admin</th><th>Aktion</th><th>Report</th><th>Chat</th><th>Grund</th></tr></thead>
          <tbody>
            <?php foreach ($auditRows as $row): ?>
              <tr>
                <td><?= e(date('d.m.Y H:i', strtotime((string) $row['created_at']))) ?></td>
                <td><?= e((string) $row['admin_name']) ?></td>
                <td><?= e((string) $row['action']) ?></td>
                <td><?= e((string) ($row['report_id'] ?? '-')) ?></td>
                <td><?= e((string) ($row['chat_id'] ?? '-')) ?></td>
                <td><?= e((string) ($row['reason'] ?? '')) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  <?php elseif ($report): ?>
    <section class="admin-section">
      <div class="section-heading">
        <p class="eyebrow"><?= e(chat_report_status_label((string) $report['status'])) ?></p>
        <h2>Meldung #<?= e((string) $report['id']) ?></h2>
        <p>Grund: <?= e(chat_report_reason_label((string) $report['reason'])) ?> · Chat <?= e((string) $report['chat_id']) ?></p>
      </div>
      <div class="admin-detail-grid">
        <article class="premium-card">
          <h3>Parteien</h3>
          <p><strong>Meldender Nutzer:</strong> <?= e((string) $report['reporter_name']) ?> · <?= e((string) $report['reporter_email']) ?></p>
          <p><strong>Gemeldeter Nutzer:</strong> <?= e((string) ($report['reported_name'] ?? 'Unbekannt')) ?> · <?= e((string) ($report['reported_email'] ?? '')) ?></p>
          <p><strong>Safety:</strong> <?= e((string) ($report['reported_safety_status'] ?? 'clear')) ?> / Chat <?= e((string) ($report['reported_chat_status'] ?? 'active')) ?> / Warnungen <?= e((string) ($report['reported_warning_count'] ?? 0)) ?></p>
          <p><?= e((string) ($report['description'] ?? '')) ?></p>
        </article>
        <form class="premium-card stack-form" method="post">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="report_id" value="<?= e((string) $report['id']) ?>" />
          <label>Interne Notiz / Grund
            <textarea name="resolution_note" rows="4"><?= e((string) ($report['resolution_note'] ?? '')) ?></textarea>
          </label>
          <div class="form-actions">
            <button class="button ghost" name="action" value="in_review" type="submit">In Pruefung</button>
            <button class="button primary" name="action" value="resolved" type="submit">Schliessen</button>
            <button class="button ghost" name="action" value="dismissed" type="submit">Abweisen</button>
            <button class="button ghost" name="action" value="warn_user" type="submit">Nutzer verwarnen</button>
            <button class="button ghost" name="action" value="restrict_chat" type="submit">Chat einschraenken</button>
            <button class="button ghost" name="action" value="temp_suspend_user" type="submit">Temporär sperren</button>
            <button class="button ghost" name="action" value="permanent_suspend_user" type="submit">Dauerhaft sperren</button>
            <button class="button ghost" name="action" value="lift_safety" type="submit">Sperre aufheben</button>
            <button class="button danger" name="action" value="block_chat" type="submit">Chat sperren</button>
          </div>
        </form>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Zeit</th><th>Absender</th><th>Snapshot</th><th>Medium</th></tr></thead>
          <tbody>
            <?php foreach ($reportMessages as $message): ?>
              <tr>
                <td><?= e($message['sent_at'] ? date('d.m.Y H:i', strtotime((string) $message['sent_at'])) : '-') ?></td>
                <td><?= e((string) ($message['sender_name'] ?? 'System')) ?></td>
                <td><?= e((string) ($message['message_snapshot'] ?? '')) ?></td>
                <td><?= e((string) ($message['media_snapshot_url'] ?? '-')) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  <?php else: ?>
    <section class="admin-section">
      <div class="section-heading">
        <p class="eyebrow">Gemeldete Chats</p>
        <h2>Reports</h2>
        <p>Nur gemeldete Inhalte werden als Snapshot angezeigt. Freie Chatdurchsicht ist nicht vorgesehen.</p>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>ID</th><th>Status</th><th>Grund</th><th>Meldender Nutzer</th><th>Gemeldeter Nutzer</th><th>Safety</th><th>Erstellt</th><th></th></tr></thead>
          <tbody>
            <?php foreach ($reports as $row): ?>
              <tr>
                <td>#<?= e((string) $row['id']) ?></td>
                <td><span class="status-pill"><?= e(chat_report_status_label((string) $row['status'])) ?></span></td>
                <td><?= e(chat_report_reason_label((string) $row['reason'])) ?></td>
                <td><?= e((string) $row['reporter_name']) ?></td>
                <td><?= e((string) ($row['reported_name'] ?? 'Unbekannt')) ?></td>
                <td><?= e((string) ($row['reported_safety_status'] ?? 'clear')) ?> / <?= e((string) ($row['reported_chat_status'] ?? 'active')) ?></td>
                <td><?= e(date('d.m.Y H:i', strtotime((string) $row['created_at']))) ?></td>
                <td><a class="button ghost small" href="/admin/chat/reports/<?= e((string) $row['id']) ?>">Pruefen</a></td>
              </tr>
            <?php endforeach; ?>
            <?php if (!$reports): ?>
              <tr><td colspan="8">Keine Chat-Meldungen vorhanden.</td></tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </section>
  <?php endif; ?>
</main>

<?php render_footer(); ?>
