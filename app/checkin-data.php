<?php

declare(strict_types=1);

// ---------------------------------------------------------------------------
// HOTMESS Check-In & Ticket Scanner Engine
// ---------------------------------------------------------------------------

function hotmess_checkin_ensure_schema(): void
{
    // Spalten in hotmess_ticket_wallet ergänzen
    foreach ([
        'checked_in_by'      => 'INT UNSIGNED NULL',
        'checkin_location'   => 'VARCHAR(120) NULL',
    ] as $col => $def) {
        try {
            $exists = db()->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "hotmess_ticket_wallet" AND COLUMN_NAME = ?');
            $exists->execute([$col]);
            if (!(int) $exists->fetchColumn()) {
                db()->exec("ALTER TABLE hotmess_ticket_wallet ADD COLUMN {$col} {$def}");
            }
        } catch (Throwable) {}
    }

    db()->exec(
        "CREATE TABLE IF NOT EXISTS event_checkins (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          event_id VARCHAR(190) NOT NULL,
          ticket_id INT UNSIGNED NOT NULL,
          user_id INT UNSIGNED NOT NULL,
          scanner_user_id INT UNSIGNED NOT NULL,
          scanner_role ENUM('checkin_staff','event_manager','admin') NOT NULL DEFAULT 'checkin_staff',
          checkin_location VARCHAR(120) NOT NULL DEFAULT '',
          checkin_device VARCHAR(190) NOT NULL DEFAULT '',
          checked_in_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          status ENUM('success','duplicate','invalid','cancelled') NOT NULL DEFAULT 'success',
          notes TEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT event_checkins_ticket_fk FOREIGN KEY (ticket_id) REFERENCES hotmess_ticket_wallet(id) ON DELETE CASCADE,
          CONSTRAINT event_checkins_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT event_checkins_scanner_fk FOREIGN KEY (scanner_user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX event_checkins_event_idx (event_id, checked_in_at),
          INDEX event_checkins_ticket_idx (ticket_id, status),
          INDEX event_checkins_scanner_idx (scanner_user_id, checked_in_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS checkin_staff (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL UNIQUE,
          role ENUM('checkin_staff','event_manager') NOT NULL DEFAULT 'checkin_staff',
          assigned_events JSON NULL,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          assigned_by INT UNSIGNED NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT checkin_staff_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT checkin_staff_admin_fk FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS checkin_settings (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(80) NOT NULL UNIQUE,
          setting_value VARCHAR(255) NOT NULL DEFAULT '',
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    // Default-Einstellungen eintragen falls nicht vorhanden
    $defaults = [
        'allow_double_scan'      => '0',
        'require_profile_photo'  => '0',
        'show_loyalty'           => '1',
        'show_ambassador'        => '1',
        'show_security_notes'    => '1',
        'checkin_points'         => '50',
        'default_location'       => 'Haupteingang',
    ];
    foreach ($defaults as $key => $val) {
        db()->prepare(
            'INSERT IGNORE INTO checkin_settings (setting_key, setting_value) VALUES (?, ?)'
        )->execute([$key, $val]);
    }
}

// ---------------------------------------------------------------------------
// Einstellungen
// ---------------------------------------------------------------------------

function hotmess_checkin_settings(): array
{
    hotmess_checkin_ensure_schema();
    $rows = db()->query('SELECT setting_key, setting_value FROM checkin_settings')->fetchAll();
    $out = [];
    foreach ($rows as $row) {
        $out[$row['setting_key']] = $row['setting_value'];
    }
    return $out;
}

function hotmess_checkin_setting(string $key, string $default = ''): string
{
    $stmt = db()->prepare('SELECT setting_value FROM checkin_settings WHERE setting_key = ? LIMIT 1');
    $stmt->execute([$key]);
    $val = $stmt->fetchColumn();
    return $val !== false ? (string) $val : $default;
}

function hotmess_checkin_settings_save(array $data, int $adminId): void
{
    hotmess_checkin_ensure_schema();
    $allowed = ['allow_double_scan','require_profile_photo','show_loyalty','show_ambassador','show_security_notes','checkin_points','default_location'];
    foreach ($allowed as $key) {
        if (array_key_exists($key, $data)) {
            db()->prepare('INSERT INTO checkin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)')
                ->execute([$key, (string) $data[$key]]);
        }
    }
}

// ---------------------------------------------------------------------------
// Rollen-Check
// ---------------------------------------------------------------------------

function hotmess_checkin_role(array $user): ?string
{
    if (($user['role'] ?? '') === 'admin') {
        return 'admin';
    }

    hotmess_checkin_ensure_schema();
    $stmt = db()->prepare('SELECT role FROM checkin_staff WHERE user_id = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([(int) $user['id']]);
    $row = $stmt->fetchColumn();
    return $row !== false ? (string) $row : null;
}

function hotmess_checkin_require_access(array $user): string
{
    $role = hotmess_checkin_role($user);
    if ($role === null) {
        http_response_code(403);
        exit('Kein Check-In Zugriff.');
    }
    return $role;
}

function hotmess_checkin_can_manage(string $role): bool
{
    return in_array($role, ['event_manager', 'admin'], true);
}

// ---------------------------------------------------------------------------
// Ticket per QR Code suchen
// ---------------------------------------------------------------------------

function hotmess_checkin_find_ticket(string $qrCode): ?array
{
    hotmess_checkin_ensure_schema();

    $qrCode = trim($qrCode);
    if ($qrCode === '') {
        return null;
    }

    // Direkter Treffer (vollständiger QR-Code)
    $stmt = db()->prepare(
        'SELECT tw.*, u.name, u.email, u.profile_photo, u.birth_date, u.city, u.country,
                u.safety_status, u.chat_status, u.moderation_notes, u.ban_reason,
                u.role AS user_role, u.status AS user_status
         FROM hotmess_ticket_wallet tw
         JOIN users u ON u.id = tw.user_id
         WHERE tw.qr_code = ? LIMIT 1'
    );
    $stmt->execute([$qrCode]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        // Fallback: Ticketnummer
        $stmt = db()->prepare(
            'SELECT tw.*, u.name, u.email, u.profile_photo, u.birth_date, u.city, u.country,
                    u.safety_status, u.chat_status, u.moderation_notes, u.ban_reason,
                    u.role AS user_role, u.status AS user_status
             FROM hotmess_ticket_wallet tw
             JOIN users u ON u.id = tw.user_id
             WHERE tw.ticket_number = ? LIMIT 1'
        );
        $stmt->execute([$qrCode]);
        $ticket = $stmt->fetch();
    }

    return $ticket ?: null;
}

// ---------------------------------------------------------------------------
// Vollständige Ticket-Info laden
// ---------------------------------------------------------------------------

function hotmess_checkin_ticket_info(int $ticketId): ?array
{
    hotmess_checkin_ensure_schema();

    $stmt = db()->prepare(
        'SELECT tw.*, u.name, u.email, u.profile_photo, u.birth_date, u.city, u.country,
                u.safety_status, u.chat_status, u.moderation_notes, u.ban_reason,
                u.role AS user_role, u.status AS user_status
         FROM hotmess_ticket_wallet tw
         JOIN users u ON u.id = tw.user_id
         WHERE tw.id = ? LIMIT 1'
    );
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        return null;
    }

    $userId = (int) $ticket['user_id'];

    // Membership
    $membershipStmt = db()->prepare('SELECT * FROM hotmess_user_memberships WHERE user_id = ? LIMIT 1');
    $membershipStmt->execute([$userId]);
    $ticket['membership'] = $membershipStmt->fetch() ?: null;

    // Loyalty
    try {
        $ticket['loyalty'] = hotmess_loyalty_account($userId);
    } catch (Throwable) {
        $ticket['loyalty'] = null;
    }

    // Ambassador
    try {
        $ticket['ambassador'] = hotmess_referral_get_ambassador(referrer: $userId);
    } catch (Throwable) {
        $ticket['ambassador'] = null;
    }

    // Letzter Check-In (falls bereits eingecheckt)
    $lastCheckin = null;
    if ($ticket['status'] === 'checked_in') {
        $ciStmt = db()->prepare(
            'SELECT ec.*, u.name AS scanner_name FROM event_checkins ec
             JOIN users u ON u.id = ec.scanner_user_id
             WHERE ec.ticket_id = ? AND ec.status = "success"
             ORDER BY ec.checked_in_at DESC LIMIT 1'
        );
        $ciStmt->execute([$ticketId]);
        $lastCheckin = $ciStmt->fetch() ?: null;
    }
    $ticket['last_checkin'] = $lastCheckin;

    return $ticket;
}

// ---------------------------------------------------------------------------
// Alter berechnen
// ---------------------------------------------------------------------------

function hotmess_checkin_age(?string $birthDate): ?int
{
    if (!$birthDate) {
        return null;
    }
    try {
        $dob = new DateTimeImmutable($birthDate);
        $now = new DateTimeImmutable();
        return (int) $dob->diff($now)->y;
    } catch (Throwable) {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Check-In durchführen
// ---------------------------------------------------------------------------

function hotmess_checkin_perform(
    int $ticketId,
    int $scannerId,
    string $scannerRole,
    string $location = '',
    string $device = ''
): array {
    hotmess_checkin_ensure_schema();

    $stmt = db()->prepare('SELECT * FROM hotmess_ticket_wallet WHERE id = ? LIMIT 1');
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        return ['success' => false, 'status' => 'invalid', 'message' => 'Ticket nicht gefunden.'];
    }

    $ticketStatus = (string) $ticket['status'];

    // Storniert / bereits abgelehnt
    if ($ticketStatus === 'cancelled') {
        hotmess_checkin_log($ticketId, (int)$ticket['user_id'], (string)$ticket['event_id'], $scannerId, $scannerRole, $location, $device, 'cancelled', 'Ticket storniert');
        return ['success' => false, 'status' => 'cancelled', 'message' => 'Ticket wurde storniert.'];
    }

    // Bereits eingecheckt
    if ($ticketStatus === 'checked_in') {
        $allowDouble = hotmess_checkin_setting('allow_double_scan', '0') === '1';
        hotmess_checkin_log($ticketId, (int)$ticket['user_id'], (string)$ticket['event_id'], $scannerId, $scannerRole, $location, $device, 'duplicate', 'Doppelter Scan');

        $lastCiStmt = db()->prepare(
            'SELECT ec.*, u.name AS scanner_name FROM event_checkins ec
             JOIN users u ON u.id = ec.scanner_user_id
             WHERE ec.ticket_id = ? AND ec.status = "success"
             ORDER BY ec.checked_in_at DESC LIMIT 1'
        );
        $lastCiStmt->execute([$ticketId]);
        $lastCi = $lastCiStmt->fetch() ?: [];

        return [
            'success'       => false,
            'status'        => 'duplicate',
            'message'       => 'Ticket bereits eingecheckt.',
            'checked_in_at' => $lastCi['checked_in_at'] ?? $ticket['checked_in_at'],
            'scanner_name'  => $lastCi['scanner_name'] ?? '',
            'location'      => $lastCi['checkin_location'] ?? '',
        ];
    }

    // Erfolgreicher Check-In
    $locationFinal = $location !== '' ? $location : hotmess_checkin_setting('default_location', 'Haupteingang');

    db()->prepare(
        'UPDATE hotmess_ticket_wallet
         SET status = "checked_in", checked_in_at = NOW(), checked_in_by = ?, checkin_location = ?
         WHERE id = ?'
    )->execute([$scannerId, $locationFinal, $ticketId]);

    hotmess_checkin_log($ticketId, (int)$ticket['user_id'], (string)$ticket['event_id'], $scannerId, $scannerRole, $locationFinal, $device, 'success');

    // Loyalty Punkte vergeben (einmalig pro Event)
    $checkinPoints = (int) hotmess_checkin_setting('checkin_points', '50');
    if ($checkinPoints > 0) {
        try {
            $alreadyEarned = db()->prepare(
                'SELECT COUNT(*) FROM loyalty_transactions
                 WHERE user_id = ? AND source = "checkin" AND source_ref = ?'
            );
            $alreadyEarned->execute([(int)$ticket['user_id'], 'checkin_' . $ticket['event_id']]);
            if (!(int) $alreadyEarned->fetchColumn()) {
                hotmess_loyalty_earn(
                    (int) $ticket['user_id'],
                    $checkinPoints,
                    'earn',
                    'checkin',
                    'Event Check-in: ' . $ticket['event_name'],
                    'checkin_' . $ticket['event_id']
                );
            }
        } catch (Throwable) {}
    }

    return [
        'success'       => true,
        'status'        => 'success',
        'message'       => 'Einlass bestätigt.',
        'checked_in_at' => date('Y-m-d H:i:s'),
        'location'      => $locationFinal,
    ];
}

// ---------------------------------------------------------------------------
// Check-In protokollieren
// ---------------------------------------------------------------------------

function hotmess_checkin_log(
    int $ticketId,
    int $userId,
    string $eventId,
    int $scannerId,
    string $scannerRole,
    string $location,
    string $device,
    string $status,
    string $notes = ''
): void {
    db()->prepare(
        'INSERT INTO event_checkins (event_id, ticket_id, user_id, scanner_user_id, scanner_role, checkin_location, checkin_device, checked_in_at, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)'
    )->execute([$eventId, $ticketId, $userId, $scannerId, $scannerRole, $location, $device, $status, $notes ?: null]);
}

// ---------------------------------------------------------------------------
// Suche
// ---------------------------------------------------------------------------

function hotmess_checkin_search(string $term, int $limit = 30): array
{
    hotmess_checkin_ensure_schema();

    $term = trim($term);
    if ($term === '') {
        return [];
    }

    $like = '%' . $term . '%';
    $stmt = db()->prepare(
        'SELECT tw.*, u.name, u.email, u.profile_photo, u.birth_date, u.city, u.country, u.safety_status
         FROM hotmess_ticket_wallet tw
         JOIN users u ON u.id = tw.user_id
         WHERE u.name LIKE ? OR u.email LIKE ? OR tw.ticket_number LIKE ? OR tw.event_name LIKE ?
         ORDER BY tw.purchased_at DESC
         LIMIT ' . max(1, min(100, $limit))
    );
    $stmt->execute([$like, $like, $like, $like]);
    return $stmt->fetchAll();
}

// ---------------------------------------------------------------------------
// Check-In Historie
// ---------------------------------------------------------------------------

function hotmess_checkin_history(array $filters = [], int $limit = 100): array
{
    hotmess_checkin_ensure_schema();

    $where = [];
    $params = [];

    if (!empty($filters['event_id'])) {
        $where[] = 'ec.event_id = ?';
        $params[] = $filters['event_id'];
    }
    if (!empty($filters['scanner_id'])) {
        $where[] = 'ec.scanner_user_id = ?';
        $params[] = (int) $filters['scanner_id'];
    }
    if (!empty($filters['status'])) {
        $where[] = 'ec.status = ?';
        $params[] = $filters['status'];
    }
    if (!empty($filters['date_from'])) {
        $where[] = 'ec.checked_in_at >= ?';
        $params[] = $filters['date_from'] . ' 00:00:00';
    }
    if (!empty($filters['date_to'])) {
        $where[] = 'ec.checked_in_at <= ?';
        $params[] = $filters['date_to'] . ' 23:59:59';
    }

    $sql = 'SELECT ec.*,
              member.name AS member_name, member.email AS member_email, member.profile_photo,
              scanner.name AS scanner_name,
              tw.ticket_type, tw.event_name, tw.ticket_number
            FROM event_checkins ec
            JOIN users member ON member.id = ec.user_id
            JOIN users scanner ON scanner.id = ec.scanner_user_id
            JOIN hotmess_ticket_wallet tw ON tw.id = ec.ticket_id';

    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY ec.checked_in_at DESC LIMIT ' . max(1, min(500, $limit));

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

// ---------------------------------------------------------------------------
// Admin KPI-Stats
// ---------------------------------------------------------------------------

function hotmess_checkin_admin_stats(): array
{
    hotmess_checkin_ensure_schema();

    $today = date('Y-m-d');

    $todayCount = (int) db()->query(
        "SELECT COUNT(*) FROM event_checkins WHERE DATE(checked_in_at) = '{$today}' AND status = 'success'"
    )->fetchColumn();

    $totalActive = (int) db()->query(
        "SELECT COUNT(*) FROM hotmess_ticket_wallet WHERE status = 'checked_in'"
    )->fetchColumn();

    $duplicates = (int) db()->query(
        "SELECT COUNT(*) FROM event_checkins WHERE status = 'duplicate' AND DATE(checked_in_at) = '{$today}'"
    )->fetchColumn();

    $invalid = (int) db()->query(
        "SELECT COUNT(*) FROM event_checkins WHERE status IN ('invalid','cancelled') AND DATE(checked_in_at) = '{$today}'"
    )->fetchColumn();

    $vipToday = (int) db()->query(
        "SELECT COUNT(*) FROM event_checkins ec
         JOIN hotmess_ticket_wallet tw ON tw.id = ec.ticket_id
         WHERE ec.status = 'success' AND DATE(ec.checked_in_at) = '{$today}'
         AND LOWER(tw.ticket_type) LIKE '%vip%'"
    )->fetchColumn();

    $blackToday = (int) db()->query(
        "SELECT COUNT(*) FROM event_checkins ec
         JOIN hotmess_user_memberships um ON um.user_id = ec.user_id
         WHERE ec.status = 'success' AND DATE(ec.checked_in_at) = '{$today}'
         AND um.tier_slug = 'black'"
    )->fetchColumn();

    // Events mit Check-Ins heute
    $eventsToday = db()->query(
        "SELECT ec.event_id, tw.event_name, COUNT(*) AS checkins
         FROM event_checkins ec
         JOIN hotmess_ticket_wallet tw ON tw.id = ec.ticket_id
         WHERE ec.status = 'success' AND DATE(ec.checked_in_at) = '{$today}'
         GROUP BY ec.event_id, tw.event_name
         ORDER BY checkins DESC LIMIT 10"
    )->fetchAll();

    return [
        'today'         => $todayCount,
        'total_active'  => $totalActive,
        'vip_today'     => $vipToday,
        'black_today'   => $blackToday,
        'duplicates'    => $duplicates,
        'invalid'       => $invalid,
        'events_today'  => $eventsToday,
    ];
}

function hotmess_checkin_event_stats(string $eventId): array
{
    hotmess_checkin_ensure_schema();

    $total = (int) db()->prepare(
        'SELECT COUNT(*) FROM hotmess_ticket_wallet WHERE event_id = ? AND status != "cancelled"'
    )->execute([$eventId]) ? db()->query("SELECT COUNT(*) FROM hotmess_ticket_wallet WHERE event_id = " . db()->quote($eventId) . " AND status != 'cancelled'")->fetchColumn() : 0;

    $stmt = db()->prepare('SELECT COUNT(*) FROM hotmess_ticket_wallet WHERE event_id = ? AND status != "cancelled"');
    $stmt->execute([$eventId]);
    $total = (int) $stmt->fetchColumn();

    $stmt = db()->prepare('SELECT COUNT(*) FROM hotmess_ticket_wallet WHERE event_id = ? AND status = "checked_in"');
    $stmt->execute([$eventId]);
    $checkedIn = (int) $stmt->fetchColumn();

    $stmt = db()->prepare("SELECT COUNT(*) FROM hotmess_ticket_wallet WHERE event_id = ? AND LOWER(ticket_type) LIKE '%vip%'");
    $stmt->execute([$eventId]);
    $vip = (int) $stmt->fetchColumn();

    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM hotmess_ticket_wallet tw
         JOIN hotmess_user_memberships um ON um.user_id = tw.user_id
         WHERE tw.event_id = ? AND um.tier_slug = "black"'
    );
    $stmt->execute([$eventId]);
    $blackCount = (int) $stmt->fetchColumn();

    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM hotmess_ticket_wallet tw
         JOIN ambassador_profiles ap ON ap.user_id = tw.user_id
         WHERE tw.event_id = ? AND ap.status = "active"'
    );
    $stmt->execute([$eventId]);
    $ambassadors = (int) $stmt->fetchColumn();

    return [
        'total'       => $total,
        'checked_in'  => $checkedIn,
        'remaining'   => max(0, $total - $checkedIn),
        'vip'         => $vip,
        'black'       => $blackCount,
        'ambassadors' => $ambassadors,
        'percent'     => $total > 0 ? round($checkedIn / $total * 100) : 0,
    ];
}

// ---------------------------------------------------------------------------
// Staff-Verwaltung
// ---------------------------------------------------------------------------

function hotmess_checkin_staff_list(): array
{
    hotmess_checkin_ensure_schema();
    return db()->query(
        'SELECT cs.*, u.name, u.email FROM checkin_staff cs
         JOIN users u ON u.id = cs.user_id
         ORDER BY cs.role ASC, u.name ASC'
    )->fetchAll();
}

function hotmess_checkin_staff_save(int $userId, string $role, int $adminId): void
{
    hotmess_checkin_ensure_schema();
    $validRoles = ['checkin_staff', 'event_manager'];
    if (!in_array($role, $validRoles, true)) {
        return;
    }
    db()->prepare(
        'INSERT INTO checkin_staff (user_id, role, is_active, assigned_by)
         VALUES (?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE role = VALUES(role), is_active = 1, assigned_by = VALUES(assigned_by), updated_at = NOW()'
    )->execute([$userId, $role, $adminId]);
}

function hotmess_checkin_staff_deactivate(int $userId): void
{
    db()->prepare('UPDATE checkin_staff SET is_active = 0 WHERE user_id = ?')->execute([$userId]);
}

// ---------------------------------------------------------------------------
// Check-In zurücksetzen (nur Event Manager / Admin)
// ---------------------------------------------------------------------------

function hotmess_checkin_reset(int $ticketId, int $adminId, string $note = ''): bool
{
    hotmess_checkin_ensure_schema();

    db()->prepare(
        'UPDATE hotmess_ticket_wallet SET status = "valid", checked_in_at = NULL, checked_in_by = NULL, checkin_location = NULL WHERE id = ?'
    )->execute([$ticketId]);

    db()->prepare(
        'UPDATE event_checkins SET status = "invalid", notes = CONCAT(COALESCE(notes,""), ?) WHERE ticket_id = ? AND status = "success"'
    )->execute([' | Zurückgesetzt von Admin #' . $adminId . ($note ? ': ' . $note : ''), $ticketId]);

    return true;
}
