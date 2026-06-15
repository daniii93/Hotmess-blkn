<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/account-data.php';

$admin = require_admin();

function hotmess_waitlist_ensure_table(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS waitlist_requests (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL UNIQUE,
            friends_count INT UNSIGNED NOT NULL DEFAULT 0,
            motivation TEXT NULL,
            desired_passport VARCHAR(30) NOT NULL DEFAULT 'free',
            status ENUM('pending', 'approved', 'rejected', 'contacted') NOT NULL DEFAULT 'pending',
            admin_note TEXT NULL,
            reviewed_by INT UNSIGNED NULL,
            reviewed_at DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX waitlist_status_idx (status, created_at),
            CONSTRAINT waitlist_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )"
    );
    hotmess_payments_add_column('waitlist_requests', 'admin_note', 'TEXT NULL');
    hotmess_payments_add_column('waitlist_requests', 'reviewed_by', 'INT UNSIGNED NULL');
    hotmess_payments_add_column('waitlist_requests', 'reviewed_at', 'DATETIME NULL');
}

hotmess_waitlist_ensure_table();
hotmess_user_ensure_columns();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');
    $userId = (int) ($_POST['user_id'] ?? 0);
    $note = trim((string) ($_POST['note'] ?? ''));

    if ($userId > 0 && in_array($action, ['approve', 'reject', 'contact'], true)) {
        if ($action === 'approve') {
            db()->prepare('UPDATE users SET status = "approved" WHERE id = ?')->execute([$userId]);
            db()->prepare(
                'UPDATE waitlist_requests SET status = "approved", admin_note = ?, reviewed_by = ?, reviewed_at = NOW() WHERE user_id = ?'
            )->execute([$note, $admin['id'], $userId]);

            try {
                hotmess_loyalty_ensure_account($userId);
            } catch (Throwable) {
            }
            try {
                hotmess_referral_activate_for_user($userId);
            } catch (Throwable) {
            }
            try {
                $stmt = db()->prepare('SELECT email, name FROM users WHERE id = ? LIMIT 1');
                $stmt->execute([$userId]);
                $member = $stmt->fetch();
                if ($member) {
                    sendTemplateEmail('welcome_member', (string) $member['email'], [
                        'subject' => 'Willkommen bei HOTMESS — Du wurdest aufgenommen',
                        'name' => $member['name'],
                    ], ['trigger' => 'waitlist_approval']);
                }
            } catch (Throwable) {
            }
        } elseif ($action === 'reject') {
            db()->prepare('UPDATE users SET status = "rejected" WHERE id = ?')->execute([$userId]);
            db()->prepare(
                'UPDATE waitlist_requests SET status = "rejected", admin_note = ?, reviewed_by = ?, reviewed_at = NOW() WHERE user_id = ?'
            )->execute([$note, $admin['id'], $userId]);
            try {
                $stmt = db()->prepare('SELECT email, name FROM users WHERE id = ? LIMIT 1');
                $stmt->execute([$userId]);
                $member = $stmt->fetch();
                if ($member) {
                    sendTemplateEmail('waitlist_rejected', (string) $member['email'], [
                        'subject' => 'Deine HOTMESS Bewerbung',
                        'name' => $member['name'],
                        'note' => $note,
                    ], ['trigger' => 'waitlist_rejection']);
                }
            } catch (Throwable) {
            }
        } elseif ($action === 'contact') {
            db()->prepare(
                'UPDATE waitlist_requests SET status = "contacted", admin_note = ?, reviewed_by = ?, reviewed_at = NOW() WHERE user_id = ?'
            )->execute([$note, $admin['id'], $userId]);
        }
    }

    redirect('/admin/waitlist?done=1');
}

$filterStatus = (string) ($_GET['status'] ?? 'pending');
$allowedStatuses = ['pending', 'approved', 'rejected', 'contacted', 'all'];
if (!in_array($filterStatus, $allowedStatuses, true)) {
    $filterStatus = 'pending';
}

$whereClause = $filterStatus !== 'all' ? 'AND wr.status = ?' : '';
$params = $filterStatus !== 'all' ? [$filterStatus] : [];

$stmt = db()->prepare(
    "SELECT u.id, u.name, u.email, u.city, u.profile_photo, u.created_at AS registered_at, u.status AS user_status,
            wr.id AS waitlist_id, wr.friends_count, wr.motivation, wr.desired_passport,
            wr.status AS waitlist_status, wr.admin_note, wr.reviewed_at, wr.created_at AS applied_at
     FROM users u
     LEFT JOIN waitlist_requests wr ON wr.user_id = u.id
     WHERE u.status IN ('pending', 'waitlist', 'rejected', 'approved')
     {$whereClause}
     ORDER BY wr.created_at ASC, u.created_at ASC
     LIMIT 200"
);
$stmt->execute($params);
$applicants = $stmt->fetchAll();

$countStmt = db()->query(
    "SELECT wr.status, COUNT(*) AS cnt FROM waitlist_requests wr GROUP BY wr.status"
);
$counts = [];
foreach ($countStmt->fetchAll() as $row) {
    $counts[(string) $row['status']] = (int) $row['cnt'];
}

render_header('Admin — Waitlist');
?>

<main class="admin-page">
  <section class="admin-section">
    <p class="eyebrow">Admin</p>
    <h1>Waitlist Approval</h1>
    <p><?= array_sum($counts) ?> Gesamtanträge / <?= ($counts['pending'] ?? 0) ?> ausstehend</p>
  </section>

  <section class="admin-section">
    <nav class="tab-nav" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem">
      <?php foreach (['pending' => 'Ausstehend', 'approved' => 'Genehmigt', 'rejected' => 'Abgelehnt', 'contacted' => 'Kontaktiert', 'all' => 'Alle'] as $slug => $label): ?>
        <a class="button <?= $filterStatus === $slug ? 'primary' : 'ghost' ?>"
           href="/admin/waitlist?status=<?= e($slug) ?>">
          <?= e($label) ?>
          <?php if (isset($counts[$slug])): ?><span style="margin-left:.3rem;opacity:.7">(<?= $counts[$slug] ?>)</span><?php endif; ?>
        </a>
      <?php endforeach; ?>
    </nav>

    <?php if (isset($_GET['done'])): ?>
      <p style="color:var(--color-success,#2e7d32);margin-bottom:1rem">Aktion erfolgreich ausgeführt.</p>
    <?php endif; ?>

    <?php if (!$applicants): ?>
      <p style="opacity:.6">Keine Anträge in dieser Kategorie.</p>
    <?php endif; ?>

    <div style="display:grid;gap:1rem">
      <?php foreach ($applicants as $a): ?>
        <?php
          $statusColor = match ((string) ($a['waitlist_status'] ?? $a['user_status'])) {
              'approved' => '#2e7d32',
              'rejected' => '#c62828',
              'contacted' => '#e65100',
              default => '#1565c0',
          };
        ?>
        <article class="premium-card" style="border-left:3px solid <?= e($statusColor) ?>">
          <div style="display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap">
            <?php if ($a['profile_photo']): ?>
              <img src="<?= e($a['profile_photo']) ?>" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:cover;flex-shrink:0">
            <?php else: ?>
              <div style="width:56px;height:56px;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0"><?= e(mb_strtoupper(mb_substr((string) $a['name'], 0, 1))) ?></div>
            <?php endif; ?>
            <div style="flex:1;min-width:200px">
              <strong><?= e((string) $a['name']) ?></strong>
              <span style="margin-left:.5rem;font-size:.8rem;padding:.15rem .5rem;border-radius:4px;background:<?= e($statusColor) ?>22;color:<?= e($statusColor) ?>"><?= e((string) ($a['waitlist_status'] ?? $a['user_status'] ?? 'unbekannt')) ?></span>
              <p style="font-size:.85rem;opacity:.7;margin:.2rem 0"><?= e((string) $a['email']) ?> · <?= e((string) ($a['city'] ?? '—')) ?></p>
              <?php if ($a['motivation']): ?>
                <p style="font-size:.9rem;margin:.5rem 0;font-style:italic">"<?= e((string) $a['motivation']) ?>"</p>
              <?php endif; ?>
              <div style="font-size:.8rem;opacity:.6;margin-top:.25rem">
                <?php if ($a['friends_count']): ?>Freunde: <?= (int) $a['friends_count'] ?> · <?php endif; ?>
                <?php if ($a['desired_passport']): ?>Passport: <?= e((string) $a['desired_passport']) ?> · <?php endif; ?>
                Angemeldet: <?= e((string) ($a['registered_at'] ?? '')) ?>
              </div>
              <?php if ($a['admin_note']): ?>
                <p style="font-size:.8rem;margin-top:.5rem;padding:.4rem .7rem;background:rgba(0,0,0,.05);border-radius:4px"><strong>Notiz:</strong> <?= e((string) $a['admin_note']) ?></p>
              <?php endif; ?>
            </div>
            <form method="post" style="display:flex;flex-direction:column;gap:.5rem;min-width:200px">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
              <input type="hidden" name="user_id" value="<?= (int) $a['id'] ?>">
              <textarea name="note" placeholder="Notiz / Grund (optional)" rows="2" style="font-size:.85rem;resize:vertical"></textarea>
              <?php if (($a['waitlist_status'] ?? '') !== 'approved'): ?>
                <button type="submit" name="action" value="approve" class="button primary" style="background:#2e7d32;border-color:#2e7d32">Annehmen</button>
              <?php endif; ?>
              <?php if (($a['waitlist_status'] ?? '') !== 'rejected'): ?>
                <button type="submit" name="action" value="reject" class="button ghost" style="border-color:#c62828;color:#c62828">Ablehnen</button>
              <?php endif; ?>
              <button type="submit" name="action" value="contact" class="button ghost">Rückfrage</button>
            </form>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
