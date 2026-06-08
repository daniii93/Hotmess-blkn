<?php

declare(strict_types=1);

function hotmess_safety_statuses(): array
{
    return [
        'clear' => 'Aktiv',
        'warned' => 'Verwarnt',
        'restricted' => 'Eingeschraenkt',
        'suspended' => 'Temporaer gesperrt',
        'banned' => 'Dauerhaft gesperrt',
    ];
}

function hotmess_chat_statuses(): array
{
    return [
        'active' => 'Aktiv',
        'read_only' => 'Nur lesen',
        'blocked' => 'Blockiert',
        'suspended' => 'Gesperrt',
    ];
}

function hotmess_ensure_member_safety_schema(): void
{
    $columns = [
        'safety_status' => 'ALTER TABLE users ADD COLUMN safety_status ENUM("clear","warned","restricted","suspended","banned") NOT NULL DEFAULT "clear" AFTER status',
        'chat_status' => 'ALTER TABLE users ADD COLUMN chat_status ENUM("active","read_only","blocked","suspended") NOT NULL DEFAULT "active" AFTER safety_status',
        'suspended_until' => 'ALTER TABLE users ADD COLUMN suspended_until DATETIME NULL AFTER chat_status',
        'warning_count' => 'ALTER TABLE users ADD COLUMN warning_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER suspended_until',
        'last_warning_at' => 'ALTER TABLE users ADD COLUMN last_warning_at DATETIME NULL AFTER warning_count',
        'banned_at' => 'ALTER TABLE users ADD COLUMN banned_at DATETIME NULL AFTER last_warning_at',
        'ban_reason' => 'ALTER TABLE users ADD COLUMN ban_reason TEXT NULL AFTER banned_at',
        'moderation_notes' => 'ALTER TABLE users ADD COLUMN moderation_notes TEXT NULL AFTER ban_reason',
    ];

    foreach ($columns as $column => $sql) {
        try {
            db()->exec($sql);
        } catch (Throwable) {
        }
    }

    db()->exec(
        'CREATE TABLE IF NOT EXISTS user_moderation_actions (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL,
          admin_id INT UNSIGNED NULL,
          report_id INT UNSIGNED NULL,
          action VARCHAR(80) NOT NULL,
          reason TEXT NULL,
          previous_status JSON NULL,
          new_status JSON NULL,
          expires_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT user_moderation_actions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT user_moderation_actions_admin_fk FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX user_moderation_actions_user_idx (user_id, created_at),
          INDEX user_moderation_actions_action_idx (action, created_at)
        )'
    );

    db()->exec(
        'CREATE TABLE IF NOT EXISTS user_safety_notifications (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL,
          type VARCHAR(80) NOT NULL,
          title VARCHAR(190) NOT NULL,
          body TEXT NOT NULL,
          read_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT user_safety_notifications_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX user_safety_notifications_user_idx (user_id, read_at, created_at)
        )'
    );
}

function hotmess_member_safety_snapshot(array $user): array
{
    return [
        'safety_status' => (string) ($user['safety_status'] ?? 'clear'),
        'chat_status' => (string) ($user['chat_status'] ?? 'active'),
        'suspended_until' => $user['suspended_until'] ?? null,
        'warning_count' => (int) ($user['warning_count'] ?? 0),
        'banned_at' => $user['banned_at'] ?? null,
        'ban_reason' => $user['ban_reason'] ?? null,
    ];
}

function hotmess_refresh_expired_suspension(array $user): array
{
    if (($user['safety_status'] ?? 'clear') === 'suspended' && !empty($user['suspended_until']) && strtotime((string) $user['suspended_until']) <= time()) {
        try {
            db()->prepare('UPDATE users SET safety_status = "clear", chat_status = "active", suspended_until = NULL WHERE id = ?')->execute([(int) $user['id']]);
            $user['safety_status'] = 'clear';
            $user['chat_status'] = 'active';
            $user['suspended_until'] = null;
        } catch (Throwable) {
        }
    }

    return $user;
}

function hotmess_user_is_banned(array $user): bool
{
    return (string) ($user['safety_status'] ?? 'clear') === 'banned' || (string) ($user['chat_status'] ?? 'active') === 'blocked';
}

function hotmess_user_is_suspended(array $user): bool
{
    return (string) ($user['safety_status'] ?? 'clear') === 'suspended'
        && (empty($user['suspended_until']) || strtotime((string) $user['suspended_until']) > time());
}

function hotmess_user_chat_restriction(array $user): array
{
    $user = hotmess_refresh_expired_suspension($user);
    if (hotmess_user_is_banned($user)) {
        return ['allowed' => false, 'code' => 'banned', 'message' => 'Dein Konto wurde gesperrt. Bitte kontaktiere das HOTMESS Team, wenn du glaubst, dass dies ein Fehler ist.'];
    }
    if (hotmess_user_is_suspended($user)) {
        return ['allowed' => false, 'code' => 'suspended', 'message' => 'Dein Konto ist voruebergehend gesperrt. Ablauf: ' . date('d.m.Y H:i', strtotime((string) $user['suspended_until'])) . '.'];
    }
    if ((string) ($user['chat_status'] ?? 'active') === 'read_only') {
        return ['allowed' => false, 'code' => 'read_only', 'message' => 'Deine Chat-Funktion ist aktuell eingeschraenkt. Du kannst bestehende Unterhaltungen lesen, aber keine neuen Nachrichten senden.'];
    }
    if ((string) ($user['chat_status'] ?? 'active') === 'suspended') {
        return ['allowed' => false, 'code' => 'chat_suspended', 'message' => 'Deine Chat-Funktion ist voruebergehend eingeschraenkt.'];
    }

    return ['allowed' => true, 'code' => 'active', 'message' => ''];
}

function hotmess_user_safety_notice(array $user): string
{
    $restriction = hotmess_user_chat_restriction($user);
    if (!$restriction['allowed']) {
        return $restriction['message'];
    }
    if ((string) ($user['safety_status'] ?? 'clear') === 'warned') {
        return 'Dein Konto wurde verwarnt. Bitte beachte die HOTMESS Community-Regeln.';
    }
    if ((string) ($user['safety_status'] ?? 'clear') === 'restricted') {
        return 'Dein Konto ist aktuell eingeschraenkt. Bitte beachte die HOTMESS Regeln.';
    }

    return '';
}

function hotmess_user_protected_action_restriction(array $user): array
{
    $user = hotmess_refresh_expired_suspension($user);
    if (hotmess_user_is_banned($user)) {
        return [
            'allowed' => false,
            'code' => 'banned',
            'message' => 'Dein Konto wurde gesperrt. Geschuetzte HOTMESS Aktionen sind aktuell nicht moeglich.',
        ];
    }
    if (hotmess_user_is_suspended($user)) {
        return [
            'allowed' => false,
            'code' => 'suspended',
            'message' => 'Dein Konto ist voruebergehend gesperrt. Geschuetzte HOTMESS Aktionen sind bis zum Ablauf der Sperre nicht moeglich.',
        ];
    }

    return ['allowed' => true, 'code' => 'clear', 'message' => ''];
}

function hotmess_require_protected_action_allowed(array $user, string $fallback = '/account/settings'): void
{
    $restriction = hotmess_user_protected_action_restriction($user);
    if ($restriction['allowed']) {
        return;
    }

    flash($restriction['message']);
    redirect($fallback);
}

function hotmess_record_safety_notification(int $userId, string $type, string $title, string $body): void
{
    hotmess_ensure_member_safety_schema();
    db()->prepare('INSERT INTO user_safety_notifications (user_id, type, title, body) VALUES (?, ?, ?, ?)')
        ->execute([$userId, $type, $title, $body]);
}

function hotmess_apply_moderation_action(int $targetUserId, int $adminId, string $action, string $reason = '', ?int $reportId = null, ?DateTimeInterface $expiresAt = null): void
{
    hotmess_ensure_member_safety_schema();
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$targetUserId]);
    $user = $stmt->fetch();
    if (!$user) {
        throw new RuntimeException('Nutzer nicht gefunden.');
    }

    $before = hotmess_member_safety_snapshot($user);
    $expiresSql = $expiresAt ? $expiresAt->format('Y-m-d H:i:s') : null;
    $note = trim($reason);
    $title = 'HOTMESS Moderation';
    $body = '';

    if ($action === 'warn_user') {
        db()->prepare('UPDATE users SET warning_count = warning_count + 1, safety_status = "warned", last_warning_at = NOW(), moderation_notes = ? WHERE id = ?')
            ->execute([$note ?: null, $targetUserId]);
        $title = 'Konto verwarnt';
        $body = 'Dein Konto wurde verwarnt. Bitte beachte die HOTMESS Community-Regeln.';
    } elseif ($action === 'restrict_chat') {
        db()->prepare('UPDATE users SET safety_status = "restricted", chat_status = "read_only", moderation_notes = ? WHERE id = ?')
            ->execute([$note ?: null, $targetUserId]);
        $title = 'Chat eingeschraenkt';
        $body = 'Deine Chat-Funktion ist aktuell eingeschraenkt. Du kannst bestehende Unterhaltungen lesen, aber keine neuen Nachrichten senden.';
    } elseif ($action === 'temp_suspend_user') {
        $expiresSql = $expiresSql ?: (new DateTimeImmutable('+7 days'))->format('Y-m-d H:i:s');
        db()->prepare('UPDATE users SET safety_status = "suspended", chat_status = "suspended", suspended_until = ?, moderation_notes = ? WHERE id = ?')
            ->execute([$expiresSql, $note ?: null, $targetUserId]);
        $title = 'Konto voruebergehend gesperrt';
        $body = 'Dein Konto ist voruebergehend gesperrt bis ' . date('d.m.Y H:i', strtotime($expiresSql)) . '.';
    } elseif ($action === 'permanent_suspend_user') {
        db()->prepare('UPDATE users SET safety_status = "banned", chat_status = "blocked", banned_at = NOW(), ban_reason = ?, moderation_notes = ? WHERE id = ?')
            ->execute([$note ?: 'Dauerhafte Sperre', $note ?: null, $targetUserId]);
        $title = 'Konto gesperrt';
        $body = 'Dein Konto wurde gesperrt. Bitte kontaktiere das HOTMESS Team, wenn du glaubst, dass dies ein Fehler ist.';
    } elseif ($action === 'lift_safety') {
        db()->prepare('UPDATE users SET safety_status = "clear", chat_status = "active", suspended_until = NULL, banned_at = NULL, ban_reason = NULL, moderation_notes = ? WHERE id = ?')
            ->execute([$note ?: null, $targetUserId]);
        $title = 'Sperre aufgehoben';
        $body = 'Dein HOTMESS Konto ist wieder aktiv.';
    } else {
        throw new RuntimeException('Moderationsaktion ist nicht erlaubt.');
    }

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$targetUserId]);
    $after = hotmess_member_safety_snapshot($stmt->fetch() ?: []);
    db()->prepare(
        'INSERT INTO user_moderation_actions (user_id, admin_id, report_id, action, reason, previous_status, new_status, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $targetUserId,
        $adminId,
        $reportId,
        $action,
        $note ?: null,
        json_encode($before, JSON_UNESCAPED_SLASHES),
        json_encode($after, JSON_UNESCAPED_SLASHES),
        $expiresSql,
    ]);
    hotmess_record_safety_notification($targetUserId, $action, $title, $body);
}

function hotmess_member_safety_rows(string $filter = ''): array
{
    hotmess_ensure_member_safety_schema();
    $where = 'role <> "admin"';
    $params = [];
    if (in_array($filter, ['warned', 'restricted', 'suspended', 'banned', 'clear'], true)) {
        $where .= ' AND safety_status = ?';
        $params[] = $filter;
    }

    $stmt = db()->prepare("SELECT id, name, email, role, status, safety_status, chat_status, suspended_until, warning_count, last_warning_at, banned_at, ban_reason, moderation_notes, last_seen_at FROM users WHERE {$where} ORDER BY FIELD(safety_status, 'banned', 'suspended', 'restricted', 'warned', 'clear'), last_seen_at DESC LIMIT 160");
    $stmt->execute($params);

    return $stmt->fetchAll();
}
