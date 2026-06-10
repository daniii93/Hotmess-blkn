<?php

declare(strict_types=1);

session_start();

$configFile = __DIR__ . '/config.php';

if (!file_exists($configFile)) {
    http_response_code(500);
    exit('Missing app/config.php. Copy app/config.example.php and add your Hostinger database credentials.');
}

require_once $configFile;

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

require_once __DIR__ . '/member-safety.php';
require_once __DIR__ . '/email-service.php';
require_once __DIR__ . '/storage-service.php';
require_once __DIR__ . '/loyalty-data.php';

function authenticated_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function admin_is_viewing_as_customer(): bool
{
    return ($_SESSION['admin_view_mode'] ?? '') === 'customer' || !empty($_SESSION['admin_view_as_customer']);
}

function admin_is_viewing_as_sales(): bool
{
    return ($_SESSION['admin_view_mode'] ?? '') === 'sales';
}

function current_user(): ?array
{
    $user = authenticated_user();

    if (!$user) {
        return null;
    }

    $user = hotmess_refresh_expired_suspension($user);

    if (($user['role'] ?? '') === 'admin' && admin_is_viewing_as_customer()) {
        $user['actual_role'] = 'admin';
        $user['role'] = 'member';
        $user['status'] = 'approved';
        $user['is_admin_customer_view'] = true;
    }

    if (($user['role'] ?? '') === 'admin' && admin_is_viewing_as_sales()) {
        $user['actual_role'] = 'admin';
        $user['role'] = 'partner';
        $user['status'] = 'approved';
        $user['is_admin_sales_view'] = true;
    }

    return $user;
}

function user_has_sales_access(?array $user = null): bool
{
    $user = $user ?? authenticated_user();

    if (!$user) {
        return false;
    }

    if (($user['role'] ?? '') === 'admin') {
        return true;
    }

    return current_partner_for_user((int) $user['id']) !== null;
}

function require_login(): array
{
    $user = current_user();

    if (!$user) {
        redirect('/login.php');
    }

    mark_user_seen((int) $user['id']);

    if (($user['role'] ?? '') !== 'admin' && hotmess_user_is_banned($user)) {
        http_response_code(403);
        render_safety_restricted_page($user);
        exit;
    }

    return $user;
}

function require_admin(): array
{
    $user = authenticated_user();

    if (!$user) {
        redirect('/login.php');
    }

    if (($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        exit('Kein Zugriff.');
    }

    mark_user_seen((int) $user['id']);

    return $user;
}

function redirect(string $path): never
{
    header('Location: ' . $path);
    exit;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    $token = $_POST['csrf_token'] ?? '';

    if ($token === '' || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(419);
        exit('Sicherheitscheck fehlgeschlagen.');
    }
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function search_variants(string $term): array
{
    $term = trim($term);

    if ($term === '') {
        return [];
    }

    $variants = [$term];
    $pairs = [
        'ä' => 'ae',
        'ö' => 'oe',
        'ü' => 'ue',
        'Ä' => 'Ae',
        'Ö' => 'Oe',
        'Ü' => 'Ue',
        'ß' => 'ss',
    ];

    $variants[] = strtr($term, $pairs);
    $variants[] = strtr($term, array_flip($pairs));
    $variants[] = strtr($term, [
        'ä' => 'a',
        'ö' => 'o',
        'ü' => 'u',
        'Ä' => 'A',
        'Ö' => 'O',
        'Ü' => 'U',
        'ß' => 'ss',
    ]);

    return array_values(array_unique(array_filter($variants, fn (string $value): bool => trim($value) !== '')));
}

function flash(?string $message = null): ?string
{
    if ($message !== null) {
        $_SESSION['flash'] = $message;
        return null;
    }

    $message = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);

    return $message;
}

function member_status_label(string $status): string
{
    return match ($status) {
        'waitlist' => 'Warteliste',
        'approved' => 'Zugelassen',
        'rejected' => 'Abgelehnt',
        default => 'In Prüfung',
    };
}

function allowed_member_statuses(): array
{
    return ['waitlist', 'pending', 'approved', 'rejected'];
}

function update_member_status(int $userId, string $newStatus, int $adminId, ?string $note = null, string $actionType = 'single'): void
{
    if (!in_array($newStatus, allowed_member_statuses(), true)) {
        $newStatus = 'pending';
    }

    $stmt = db()->prepare('SELECT status FROM users WHERE id = ? AND role = "member" LIMIT 1');
    $stmt->execute([$userId]);
    $oldStatus = $stmt->fetchColumn();

    if (!$oldStatus) {
        return;
    }

    $stmt = db()->prepare('UPDATE users SET status = ?, admin_note = COALESCE(?, admin_note) WHERE id = ? AND role = "member"');
    $stmt->execute([$newStatus, $note, $userId]);

    $stmt = db()->prepare('UPDATE waitlist_requests SET status = ? WHERE user_id = ?');
    $stmt->execute([$newStatus, $userId]);

    if ($oldStatus !== $newStatus) {
        $actionType = $actionType === 'bulk' ? 'bulk' : 'single';
        $stmt = db()->prepare('INSERT INTO status_logs (user_id, admin_id, old_status, new_status, action_type) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$userId, $adminId, $oldStatus, $newStatus, $actionType]);
    }
}

function is_verified(array $user, string $type): bool
{
    $field = $type === 'phone' ? 'phone_verified_at' : 'email_verified_at';

    return !empty($user[$field]);
}

function require_approved_member_or_admin(): array
{
    $user = require_login();

    if (($user['role'] ?? '') === 'admin') {
        return $user;
    }

    if (($user['status'] ?? '') !== 'approved') {
        http_response_code(403);
        exit('Chat ist nur für zugelassene Mitglieder verfügbar.');
    }

    if (hotmess_user_is_banned($user)) {
        http_response_code(403);
        render_safety_restricted_page($user);
        exit;
    }

    return $user;
}

function render_safety_restricted_page(array $user): void
{
    $message = hotmess_user_safety_notice($user) ?: 'Dein Konto ist aktuell eingeschraenkt.';
    ?>
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Konto eingeschraenkt | HOTMESS BLKN</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <main class="account-concierge-page">
          <section class="dashboard-hero">
            <p class="eyebrow">Member Safety</p>
            <h1>Konto eingeschraenkt</h1>
            <p><?= e($message) ?></p>
            <div class="hero-actions">
              <a class="button primary" href="/contact">HOTMESS Team kontaktieren</a>
              <a class="button ghost" href="/">Zur Startseite</a>
            </div>
          </section>
        </main>
      </body>
    </html>
    <?php
}

function cleanup_expired_messages(): void
{
    db()->exec('UPDATE messages SET deleted_at = NOW() WHERE deleted_at IS NULL AND saved_at IS NULL AND expires_at IS NOT NULL AND expires_at < NOW()');
    db()->exec(
        'UPDATE messages
         JOIN conversations ON conversations.id = messages.conversation_id
         SET messages.deleted_at = NOW()
         WHERE messages.deleted_at IS NULL
           AND messages.saved_at IS NULL
           AND conversations.type = "organizer"
           AND messages.created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)'
    );
}

function conversation_belongs_to_user(int $conversationId, int $userId): bool
{
    $stmt = db()->prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([$conversationId, $userId]);

    return (bool) $stmt->fetchColumn();
}

function conversation_participant_exists(int $conversationId, int $userId): bool
{
    $stmt = db()->prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$conversationId, $userId]);

    return (bool) $stmt->fetchColumn();
}

function archive_conversation_for_user(int $conversationId, int $userId): bool
{
    if (!conversation_belongs_to_user($conversationId, $userId)) {
        return false;
    }

    $stmt = db()->prepare('UPDATE conversation_participants SET archived_at = NOW(), deleted_at = NULL WHERE conversation_id = ? AND user_id = ?');
    $stmt->execute([$conversationId, $userId]);

    return true;
}

function restore_conversation_for_user(int $conversationId, int $userId): bool
{
    $stmt = db()->prepare('SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND deleted_at IS NULL AND archived_at IS NOT NULL LIMIT 1');
    $stmt->execute([$conversationId, $userId]);

    if (!$stmt->fetchColumn()) {
        return false;
    }

    $stmt = db()->prepare('UPDATE conversation_participants SET archived_at = NULL, deleted_at = NULL WHERE conversation_id = ? AND user_id = ?');
    $stmt->execute([$conversationId, $userId]);

    return true;
}

function delete_conversation_for_user(int $conversationId, int $userId): bool
{
    if (!conversation_participant_exists($conversationId, $userId)) {
        return false;
    }

    $stmt = db()->prepare('UPDATE conversation_participants SET archived_at = NULL, deleted_at = NOW() WHERE conversation_id = ? AND user_id = ?');
    $stmt->execute([$conversationId, $userId]);

    return true;
}

function prepare_chat_moderation_schema(): void
{
    db()->exec('ALTER TABLE messages MODIFY COLUMN message_type ENUM("text", "image", "video", "audio", "file", "system") NOT NULL DEFAULT "text"');

    try {
        db()->exec('ALTER TABLE messages ADD COLUMN file_size INT UNSIGNED NULL AFTER media_path');
    } catch (Throwable) {
    }

    try {
        db()->exec('ALTER TABLE messages ADD COLUMN mime_type VARCHAR(120) NULL AFTER file_size');
    } catch (Throwable) {
    }

    try {
        db()->exec('ALTER TABLE conversation_participants ADD COLUMN blocked TINYINT(1) NOT NULL DEFAULT 0 AFTER muted');
    } catch (Throwable) {
    }

    db()->exec(
        'CREATE TABLE IF NOT EXISTS chat_blocks (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          blocker_user_id INT UNSIGNED NOT NULL,
          blocked_user_id INT UNSIGNED NOT NULL,
          reason TEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          removed_at DATETIME NULL,
          CONSTRAINT chat_blocks_blocker_fk FOREIGN KEY (blocker_user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT chat_blocks_blocked_fk FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY chat_blocks_pair_unique (blocker_user_id, blocked_user_id),
          INDEX chat_blocks_active_idx (blocked_user_id, removed_at)
        )'
    );

    db()->exec(
        'CREATE TABLE IF NOT EXISTS chat_reports (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          reporter_id INT UNSIGNED NOT NULL,
          reported_user_id INT UNSIGNED NULL,
          chat_id INT UNSIGNED NOT NULL,
          reason ENUM("harassment", "insult", "spam", "threat", "fake_profile", "inappropriate_content", "other") NOT NULL DEFAULT "other",
          description TEXT NULL,
          status ENUM("new", "in_review", "resolved", "dismissed") NOT NULL DEFAULT "new",
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          reviewed_by INT UNSIGNED NULL,
          reviewed_at DATETIME NULL,
          resolution_note TEXT NULL,
          CONSTRAINT chat_reports_reporter_fk FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT chat_reports_reported_user_fk FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
          CONSTRAINT chat_reports_chat_fk FOREIGN KEY (chat_id) REFERENCES conversations(id) ON DELETE CASCADE,
          CONSTRAINT chat_reports_reviewed_by_fk FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX chat_reports_status_idx (status, created_at)
        )'
    );

    db()->exec(
        'CREATE TABLE IF NOT EXISTS chat_report_messages (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          report_id INT UNSIGNED NOT NULL,
          message_id INT UNSIGNED NULL,
          message_snapshot TEXT NULL,
          media_snapshot_url VARCHAR(255) NULL,
          sender_id INT UNSIGNED NULL,
          sent_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT chat_report_messages_report_fk FOREIGN KEY (report_id) REFERENCES chat_reports(id) ON DELETE CASCADE,
          CONSTRAINT chat_report_messages_message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
          CONSTRAINT chat_report_messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX chat_report_messages_report_idx (report_id, sent_at)
        )'
    );

    db()->exec(
        'CREATE TABLE IF NOT EXISTS chat_admin_audit_log (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          admin_id INT UNSIGNED NOT NULL,
          action VARCHAR(120) NOT NULL,
          report_id INT UNSIGNED NULL,
          chat_id INT UNSIGNED NULL,
          target_user_id INT UNSIGNED NULL,
          reason TEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT chat_admin_audit_admin_fk FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT chat_admin_audit_report_fk FOREIGN KEY (report_id) REFERENCES chat_reports(id) ON DELETE SET NULL,
          CONSTRAINT chat_admin_audit_chat_fk FOREIGN KEY (chat_id) REFERENCES conversations(id) ON DELETE SET NULL,
          CONSTRAINT chat_admin_audit_target_fk FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX chat_admin_audit_report_idx (report_id, created_at)
        )'
    );
}

function chat_report_reason_label(string $reason): string
{
    return match ($reason) {
        'harassment' => 'Belästigung',
        'insult' => 'Beleidigung',
        'spam' => 'Spam',
        'threat' => 'Bedrohung',
        'fake_profile' => 'Fake-Profil',
        'inappropriate_content' => 'Unangemessener Inhalt',
        default => 'Sonstiges',
    };
}

function chat_report_status_label(string $status): string
{
    return match ($status) {
        'in_review' => 'In Prüfung',
        'resolved' => 'Gelöst',
        'dismissed' => 'Abgewiesen',
        default => 'Neu',
    };
}

function create_chat_report(int $conversationId, int $reporterId, string $reason, string $description = ''): ?int
{
    prepare_chat_moderation_schema();

    if (!conversation_belongs_to_user($conversationId, $reporterId)) {
        return null;
    }

    $allowedReasons = ['harassment', 'insult', 'spam', 'threat', 'fake_profile', 'inappropriate_content', 'other'];
    if (!in_array($reason, $allowedReasons, true)) {
        $reason = 'other';
    }

    $stmt = db()->prepare(
        'SELECT user_id FROM conversation_participants
         WHERE conversation_id = ? AND user_id <> ? AND deleted_at IS NULL
         ORDER BY created_at ASC
         LIMIT 1'
    );
    $stmt->execute([$conversationId, $reporterId]);
    $reportedUserId = (int) ($stmt->fetchColumn() ?: 0);

    db()->beginTransaction();
    try {
        $stmt = db()->prepare(
            'INSERT INTO chat_reports (reporter_id, reported_user_id, chat_id, reason, description)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$reporterId, $reportedUserId ?: null, $conversationId, $reason, trim($description)]);
        $reportId = (int) db()->lastInsertId();

        $messages = db()->prepare(
            'SELECT id, sender_id, body, media_path, created_at
             FROM messages
             WHERE conversation_id = ?
               AND deleted_at IS NULL
               AND deleted_for_all_at IS NULL
             ORDER BY created_at DESC
             LIMIT 10'
        );
        $messages->execute([$conversationId]);
        $snapshot = array_reverse($messages->fetchAll());

        $insertSnapshot = db()->prepare(
            'INSERT INTO chat_report_messages (report_id, message_id, message_snapshot, media_snapshot_url, sender_id, sent_at)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        foreach ($snapshot as $message) {
            $insertSnapshot->execute([
                $reportId,
                (int) $message['id'],
                (string) ($message['body'] ?? ''),
                $message['media_path'] ?: null,
                $message['sender_id'] ? (int) $message['sender_id'] : null,
                $message['created_at'] ?: null,
            ]);
        }

        db()->commit();
        return $reportId;
    } catch (Throwable $error) {
        if (db()->inTransaction()) {
            db()->rollBack();
        }
        throw $error;
    }
}

function log_chat_admin_access(int $adminId, string $action, ?int $reportId = null, ?int $chatId = null, ?int $targetUserId = null, string $reason = ''): void
{
    prepare_chat_moderation_schema();

    $stmt = db()->prepare(
        'INSERT INTO chat_admin_audit_log (admin_id, action, report_id, chat_id, target_user_id, reason)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$adminId, $action, $reportId, $chatId, $targetUserId, $reason]);
}

function chat_block_user(int $blockerUserId, int $blockedUserId, string $reason = ''): bool
{
    if ($blockerUserId <= 0 || $blockedUserId <= 0 || $blockerUserId === $blockedUserId) {
        return false;
    }

    prepare_chat_moderation_schema();
    $stmt = db()->prepare(
        'INSERT INTO chat_blocks (blocker_user_id, blocked_user_id, reason, removed_at)
         VALUES (?, ?, ?, NULL)
         ON DUPLICATE KEY UPDATE reason = VALUES(reason), removed_at = NULL, created_at = NOW()'
    );
    $stmt->execute([$blockerUserId, $blockedUserId, trim($reason) ?: null]);

    return true;
}

function chat_unblock_user(int $blockerUserId, int $blockedUserId): bool
{
    prepare_chat_moderation_schema();
    $stmt = db()->prepare('UPDATE chat_blocks SET removed_at = NOW() WHERE blocker_user_id = ? AND blocked_user_id = ? AND removed_at IS NULL');
    $stmt->execute([$blockerUserId, $blockedUserId]);

    return $stmt->rowCount() > 0;
}

function chat_block_state_between_users(int $userId, int $otherUserId): array
{
    prepare_chat_moderation_schema();
    $stmt = db()->prepare(
        'SELECT blocker_user_id, blocked_user_id
         FROM chat_blocks
         WHERE removed_at IS NULL
           AND ((blocker_user_id = ? AND blocked_user_id = ?) OR (blocker_user_id = ? AND blocked_user_id = ?))
         LIMIT 2'
    );
    $stmt->execute([$userId, $otherUserId, $otherUserId, $userId]);
    $rows = $stmt->fetchAll();

    return [
        'blockedByMe' => (bool) array_filter($rows, static fn (array $row): bool => (int) $row['blocker_user_id'] === $userId),
        'blockedMe' => (bool) array_filter($rows, static fn (array $row): bool => (int) $row['blocked_user_id'] === $userId),
    ];
}

function chat_conversation_block_state(int $conversationId, int $userId): array
{
    $stmt = db()->prepare(
        'SELECT user_id FROM conversation_participants
         WHERE conversation_id = ? AND user_id <> ? AND deleted_at IS NULL
         ORDER BY created_at ASC
         LIMIT 1'
    );
    $stmt->execute([$conversationId, $userId]);
    $otherUserId = (int) ($stmt->fetchColumn() ?: 0);
    if ($otherUserId <= 0) {
        return ['otherUserId' => 0, 'blockedByMe' => false, 'blockedMe' => false];
    }

    return ['otherUserId' => $otherUserId] + chat_block_state_between_users($userId, $otherUserId);
}

function delete_message_for_user(int $messageId, int $userId): bool
{
    $stmt = db()->prepare(
        'SELECT messages.id, messages.conversation_id
         FROM messages
         JOIN conversation_participants cp ON cp.conversation_id = messages.conversation_id AND cp.user_id = ? AND cp.deleted_at IS NULL
         LEFT JOIN message_user_deletions mud ON mud.message_id = messages.id AND mud.user_id = ?
         WHERE messages.id = ? AND messages.deleted_at IS NULL AND mud.id IS NULL
         LIMIT 1'
    );
    $stmt->execute([$userId, $userId, $messageId]);

    if (!$stmt->fetch()) {
        return false;
    }

    $stmt = db()->prepare('INSERT IGNORE INTO message_user_deletions (message_id, user_id, deleted_at) VALUES (?, ?, NOW())');
    $stmt->execute([$messageId, $userId]);

    return true;
}

function delete_message_for_all(int $messageId, int $userId): bool
{
    $stmt = db()->prepare(
        'SELECT messages.id, messages.sender_id, messages.media_path
         FROM messages
         JOIN conversation_participants cp ON cp.conversation_id = messages.conversation_id AND cp.user_id = ? AND cp.deleted_at IS NULL
         WHERE messages.id = ? AND messages.deleted_at IS NULL AND messages.deleted_for_all_at IS NULL
         LIMIT 1'
    );
    $stmt->execute([$userId, $messageId]);
    $message = $stmt->fetch();

    if (!$message || (int) $message['sender_id'] !== $userId) {
        return false;
    }

    if (!empty($message['media_path'])) {
        $file = realpath(__DIR__ . '/../' . $message['media_path']);
        $uploadRoot = realpath(__DIR__ . '/../uploads/chat-media');
        if ($file && $uploadRoot && strpos($file, $uploadRoot) === 0 && is_file($file)) {
            @unlink($file);
        }
    }

    $stmt = db()->prepare(
        'UPDATE messages
         SET body = NULL,
             media_path = NULL,
             deleted_for_all_at = NOW(),
             deleted_for_all_by = ?
         WHERE id = ? AND sender_id = ? AND deleted_for_all_at IS NULL'
    );
    $stmt->execute([$userId, $messageId, $userId]);

    return $stmt->rowCount() > 0;
}

function mark_user_seen(int $userId): void
{
    try {
        $stmt = db()->prepare('UPDATE users SET last_seen_at = NOW() WHERE id = ?');
        $stmt->execute([$userId]);
    } catch (PDOException) {
        // Older installs may not have the column until the migration has run.
    }
}

function is_user_online(?string $lastSeenAt): bool
{
    return $lastSeenAt !== null && strtotime($lastSeenAt) > time() - 300;
}

function partner_commission_rate(int $level): float
{
    return match ($level) {
        12 => 12.0,
        10 => 10.0,
        8 => 8.0,
        6 => 6.0,
        4 => 4.0,
        3 => 3.0,
        default => 2.0,
    };
}

function partner_level_label(int $level): string
{
    return match ($level) {
        12 => 'Executive Event Director',
        10 => 'Regional Event Director',
        8 => 'Senior Event Manager',
        6 => 'Team Leader Ticket Sales',
        4 => 'Event Consultant',
        3 => 'Ticket Consultant',
        default => 'Ticket Scout',
    };
}

function active_sales_event(): ?array
{
    $stmt = db()->query(
        'SELECT * FROM sales_events
         WHERE status = "active"
         ORDER BY start_date ASC, id ASC
         LIMIT 1'
    );
    $event = $stmt->fetch();

    return $event ?: null;
}

function current_partner_for_user(int $userId): ?array
{
    $stmt = db()->prepare('SELECT * FROM sales_partners WHERE user_id = ? AND status = "active" LIMIT 1');
    $stmt->execute([$userId]);
    $partner = $stmt->fetch();

    return $partner ?: null;
}

function event_partner_link(int $eventId, int $partnerId): ?array
{
    $stmt = db()->prepare(
        'SELECT event_partner_links.*, sales_partners.name, sales_partners.level, sales_partners.slug
         FROM event_partner_links
         JOIN sales_partners ON sales_partners.id = event_partner_links.partner_id
         WHERE event_partner_links.event_id = ? AND event_partner_links.partner_id = ? AND sales_partners.status = "active"
         LIMIT 1'
    );
    $stmt->execute([$eventId, $partnerId]);
    $link = $stmt->fetch();

    return $link ?: null;
}

function event_partner_link_by_code(string $code, int $eventId): ?array
{
    $stmt = db()->prepare(
        'SELECT event_partner_links.*, sales_partners.name, sales_partners.level, sales_partners.slug
         FROM event_partner_links
         JOIN sales_partners ON sales_partners.id = event_partner_links.partner_id
         WHERE event_partner_links.referral_code = ? AND event_partner_links.event_id = ? AND sales_partners.status = "active"
         LIMIT 1'
    );
    $stmt->execute([strtoupper(trim($code)), $eventId]);
    $link = $stmt->fetch();

    return $link ?: null;
}

function remember_event_referral(array $link, string $source, ?int $customerId = null): void
{
    $eventId = (int) $link['event_id'];
    $payload = [
        'event_id' => $eventId,
        'partner_id' => (int) $link['partner_id'],
        'referral_code' => (string) $link['referral_code'],
        'source' => $source,
        'timestamp' => time(),
    ];

    setcookie('hb_ref_' . $eventId, json_encode($payload), [
        'expires' => time() + 30 * 86400,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    $_COOKIE['hb_ref_' . $eventId] = json_encode($payload);

    $stmt = db()->prepare(
        'INSERT INTO sales_referrals (customer_id, partner_id, event_id, referral_code, referral_source)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $customerId,
        $payload['partner_id'],
        $eventId,
        $payload['referral_code'],
        $source,
    ]);
}

function current_event_referral(int $eventId): ?array
{
    $cookie = $_COOKIE['hb_ref_' . $eventId] ?? '';
    $payload = json_decode((string) $cookie, true);

    if (!is_array($payload) || (int) ($payload['event_id'] ?? 0) !== $eventId) {
        return null;
    }

    if ((int) ($payload['timestamp'] ?? 0) < time() - 30 * 86400) {
        return null;
    }

    $link = event_partner_link_by_code((string) ($payload['referral_code'] ?? ''), $eventId);
    if (!$link || (int) $link['partner_id'] !== (int) ($payload['partner_id'] ?? 0)) {
        return null;
    }

    return array_merge($link, ['referral_source' => (string) ($payload['source'] ?? 'link')]);
}

function record_profile_view(int $viewedUserId, int $viewerUserId): void
{
    if ($viewedUserId === $viewerUserId) {
        return;
    }

    $stmt = db()->prepare('SELECT id FROM users WHERE id = ? AND role = "member" AND status <> "rejected" LIMIT 1');
    $stmt->execute([$viewedUserId]);

    if (!$stmt->fetchColumn()) {
        return;
    }

    $stmt = db()->prepare(
        'INSERT INTO profile_views (viewed_user_id, viewer_user_id, viewed_at)
         VALUES (?, ?, NOW())'
    );
    $stmt->execute([$viewedUserId, $viewerUserId]);

    $stmt = db()->prepare(
        'INSERT INTO profile_view_summary (viewed_user_id, viewer_user_id, first_viewed_at, last_viewed_at, total_views)
         VALUES (?, ?, NOW(), NOW(), 1)
         ON DUPLICATE KEY UPDATE last_viewed_at = NOW(), total_views = total_views + 1, updated_at = NOW()'
    );
    $stmt->execute([$viewedUserId, $viewerUserId]);
}

function profile_visitor_stats(int $userId): array
{
    $stmt = db()->prepare(
        'SELECT
          SUM(CASE WHEN viewed_at >= CURDATE() THEN 1 ELSE 0 END) AS views_today,
          COUNT(DISTINCT CASE WHEN viewed_at >= CURDATE() THEN viewer_user_id END) AS unique_viewers_today,
          SUM(CASE WHEN viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS views_last_7_days,
          COUNT(DISTINCT CASE WHEN viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN viewer_user_id END) AS unique_viewers_last_7_days,
          SUM(CASE WHEN viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS views_last_30_days,
          COUNT(DISTINCT CASE WHEN viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN viewer_user_id END) AS unique_viewers_last_30_days,
          COUNT(*) AS total_views,
          COUNT(DISTINCT viewer_user_id) AS total_unique_viewers
         FROM profile_views
         WHERE viewed_user_id = ?'
    );
    $stmt->execute([$userId]);
    $stats = $stmt->fetch() ?: [];

    foreach ([
        'views_today',
        'unique_viewers_today',
        'views_last_7_days',
        'unique_viewers_last_7_days',
        'views_last_30_days',
        'unique_viewers_last_30_days',
        'total_views',
        'total_unique_viewers',
    ] as $key) {
        $stats[$key] = (int) ($stats[$key] ?? 0);
    }

    return $stats;
}

function profile_visitors(int $userId, int $limit = 20, int $offset = 0): array
{
    $stmt = db()->prepare(
        'SELECT profile_view_summary.*,
          users.name,
          users.instagram_handle,
          users.profile_photo,
          users.last_seen_at
         FROM profile_view_summary
         JOIN users ON users.id = profile_view_summary.viewer_user_id
         WHERE profile_view_summary.viewed_user_id = ?
           AND users.role = "member"
           AND users.status <> "rejected"
         ORDER BY profile_view_summary.last_viewed_at DESC
         LIMIT ? OFFSET ?'
    );
    $stmt->bindValue(1, $userId, PDO::PARAM_INT);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->bindValue(3, $offset, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll();
}

function profile_visit_bucket(string $lastViewedAt): string
{
    $timestamp = strtotime($lastViewedAt);
    $today = strtotime('today');
    $yesterday = strtotime('yesterday');

    if ($timestamp >= $today) {
        return 'Heute';
    }

    if ($timestamp >= $yesterday) {
        return 'Gestern';
    }

    if ($timestamp >= time() - 7 * 86400) {
        return 'Letzte 7 Tage';
    }

    return 'Älter';
}

function chat_retention_label(string $retention): string
{
    return match ($retention) {
        'close' => 'Bis Fenster zu',
        '1y' => '1 Jahr',
        default => '24h',
    };
}

function chat_message_type_label(string $type): string
{
    return match ($type) {
        'image' => 'Foto',
        'video' => 'Video',
        'audio' => 'Audio',
        'system' => 'System',
        default => 'Text',
    };
}

function chat_expiry_sql(string $retention): string
{
    return match ($retention) {
        '24h' => 'DATE_ADD(NOW(), INTERVAL 24 HOUR)',
        '1y' => 'DATE_ADD(NOW(), INTERVAL 1 YEAR)',
        default => 'NULL',
    };
}

function chat_avatar(?string $path, string $name): string
{
    if ($path) {
        return '<img src="' . e($path) . '" alt="' . e($name) . '" />';
    }

    $initials = '';
    foreach (preg_split('/\s+/', trim($name)) ?: [] as $part) {
        $initials .= strtoupper(substr($part, 0, 1));
        if (strlen($initials) >= 2) {
            break;
        }
    }

    return '<span>' . e($initials !== '' ? $initials : 'HB') . '</span>';
}

function handle_chat_media_upload(?array $file): array
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return ['text', null];
    }

    $mime = hotmess_detect_mime_type((string) ($file['tmp_name'] ?? ''));
    $categoryKey = str_starts_with($mime, 'video/')
        ? 'chat_video'
        : (str_starts_with($mime, 'audio/') ? 'chat_audio' : 'chat_image');
    $category = hotmess_media_category($categoryKey);

    if (!$category) {
        throw new RuntimeException('Diese Chat-Datei ist nicht erlaubt.');
    }

    $user = authenticated_user();
    $asset = uploadMedia($file, (string) $category['folder'], $category, (int) $category['maxSize'], [
        'uploaded_by' => $user ? (int) $user['id'] : null,
        'related_module' => 'chat',
        'prefix' => $categoryKey,
    ]);

    return [
        (string) $asset['media_type'],
        ltrim((string) ($asset['public_url'] ?? $asset['path']), '/'),
        (int) $asset['file_size'],
        (string) $asset['mime_type'],
    ];
}

function generate_verification_code(array $user, string $type): string
{
    $destination = $type === 'phone' ? (string) ($user['phone'] ?? '') : (string) ($user['email'] ?? '');
    $code = (string) random_int(100000, 999999);

    $stmt = db()->prepare(
        'SELECT created_at FROM verification_codes
         WHERE user_id = ? AND type = ? AND used_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1'
    );
    $stmt->execute([$user['id'], $type]);
    $latestCreatedAt = $stmt->fetchColumn();

    if ($latestCreatedAt && strtotime((string) $latestCreatedAt) > time() - 60) {
        throw new RuntimeException('Bitte warte 60 Sekunden, bevor du einen neuen Code anforderst.');
    }

    $stmt = db()->prepare('UPDATE verification_codes SET used_at = NOW() WHERE user_id = ? AND type = ? AND used_at IS NULL');
    $stmt->execute([$user['id'], $type]);

    $stmt = db()->prepare(
        'INSERT INTO verification_codes (user_id, type, destination, code_hash, expires_at)
         VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))'
    );
    $stmt->execute([$user['id'], $type, $destination, password_hash($code, PASSWORD_DEFAULT)]);

    if ($type === 'phone') {
        send_sms_code($destination, $code);
    } else {
        send_email_code($destination, $code);
    }

    return $code;
}

function send_email_code(string $email, string $code): void
{
    sendTemplateEmail('verify_email', $email, [
        'code' => $code,
        'detail' => 'Der Code ist 10 Minuten gültig.',
    ], ['trigger' => 'verify_email']);
    return;

    $subject = 'Dein HOTMESS BLKN Verifizierungscode';
    $message = "Dein HOTMESS BLKN Code lautet: {$code}\n\nDer Code ist 10 Minuten gültig.";
    $headers = [
        'From: HOTMESS BLKN <no-reply@hotmess-blkn.com>',
        'Reply-To: no-reply@hotmess-blkn.com',
        'Content-Type: text/plain; charset=UTF-8',
    ];

    @mail($email, $subject, $message, implode("\r\n", $headers));
}

function send_sms_code(string $phone, string $code): void
{
    if (!defined('SMS_WEBHOOK_URL') || SMS_WEBHOOK_URL === '') {
        $_SESSION['sms_notice'] = 'SMS-Versand ist vorbereitet, aber noch kein SMS-Anbieter konfiguriert.';
        return;
    }

    $payload = json_encode([
        'to' => $phone,
        'message' => "Dein HOTMESS BLKN Code lautet: {$code}",
    ]);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 8,
        ],
    ]);

    @file_get_contents(SMS_WEBHOOK_URL, false, $context);
}

function verify_code(array $user, string $type, string $code): array
{
    $stmt = db()->prepare(
        'SELECT * FROM verification_codes
         WHERE user_id = ? AND type = ? AND used_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1'
    );
    $stmt->execute([$user['id'], $type]);
    $record = $stmt->fetch();

    if (!$record) {
        return [false, 'Bitte fordere einen neuen Code an.'];
    }

    if (!empty($record['locked_until']) && strtotime((string) $record['locked_until']) > time()) {
        return [false, 'Zu viele Fehlversuche. Bitte warte kurz und fordere dann einen neuen Code an.'];
    }

    if (strtotime((string) $record['expires_at']) < time()) {
        return [false, 'Dieser Code ist abgelaufen. Bitte fordere einen neuen Code an.'];
    }

    if (!preg_match('/^\d{6}$/', $code)) {
        return [false, 'Bitte gib einen 6-stelligen Code ein.'];
    }

    if (!password_verify($code, $record['code_hash'])) {
        $attempts = (int) $record['attempts'] + 1;
        $lockedUntil = $attempts >= 5 ? ', locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE)' : '';
        $stmt = db()->prepare("UPDATE verification_codes SET attempts = ?{$lockedUntil} WHERE id = ?");
        $stmt->execute([$attempts, $record['id']]);

        return [false, $attempts >= 5 ? 'Zu viele Fehlversuche. Die Eingabe ist 15 Minuten gesperrt.' : 'Der Code ist nicht korrekt.'];
    }

    $stmt = db()->prepare('UPDATE verification_codes SET used_at = NOW() WHERE id = ?');
    $stmt->execute([$record['id']]);

    $field = $type === 'phone' ? 'phone_verified_at' : 'email_verified_at';
    $stmt = db()->prepare("UPDATE users SET {$field} = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);

    return [true, $type === 'phone' ? 'Telefonnummer bestätigt.' : 'E-Mail-Adresse bestätigt.'];
}

function handle_profile_photo_upload(?array $file): ?string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Das Profilbild konnte nicht hochgeladen werden.');
    }

    if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
        throw new RuntimeException('Das Profilbild darf maximal 5 MB groß sein.');
    }

    $tmpName = (string) ($file['tmp_name'] ?? '');
    $imageInfo = @getimagesize($tmpName);

    if (!$imageInfo || empty($imageInfo['mime'])) {
        throw new RuntimeException('Bitte lade ein gültiges Bild hoch.');
    }

    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    $mime = (string) $imageInfo['mime'];

    if (!isset($extensions[$mime])) {
        throw new RuntimeException('Erlaubt sind JPG, PNG und WebP.');
    }

    $uploadDir = __DIR__ . '/../uploads/profile-photos';

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        throw new RuntimeException('Upload-Ordner konnte nicht erstellt werden.');
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    $target = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($tmpName, $target)) {
        throw new RuntimeException('Profilbild konnte nicht gespeichert werden.');
    }

    return 'uploads/profile-photos/' . $filename;
}
