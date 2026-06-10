<?php

declare(strict_types=1);

// ---------------------------------------------------------------------------
// HOTMESS Referral & Ambassador Rewards Engine
// ---------------------------------------------------------------------------

function hotmess_referral_ensure_schema(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS referral_codes (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL UNIQUE,
          code VARCHAR(60) NOT NULL UNIQUE,
          status ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
          uses_total INT UNSIGNED NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_used_at DATETIME NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT referral_codes_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX referral_codes_code_idx (code, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS referrals (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          referrer_user_id INT UNSIGNED NOT NULL,
          referred_user_id INT UNSIGNED NOT NULL UNIQUE,
          referral_code VARCHAR(60) NOT NULL,
          source VARCHAR(60) NOT NULL DEFAULT 'link',
          status ENUM('pending','registered','converted','rewarded','cancelled') NOT NULL DEFAULT 'registered',
          first_purchase_type ENUM('ticket','passport_plus','passport_black','package') NULL,
          first_purchase_id VARCHAR(120) NULL,
          first_purchase_amount DECIMAL(12,2) NULL,
          points_awarded INT UNSIGNED NOT NULL DEFAULT 0,
          admin_note TEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          converted_at DATETIME NULL,
          rewarded_at DATETIME NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT referrals_referrer_fk FOREIGN KEY (referrer_user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT referrals_referred_fk FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX referrals_referrer_idx (referrer_user_id, status, created_at),
          INDEX referrals_code_idx (referral_code, created_at),
          INDEX referrals_status_idx (status, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS ambassador_profiles (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL UNIQUE,
          role ENUM('city','travel','vip','brand') NOT NULL DEFAULT 'city',
          city VARCHAR(120) NULL,
          status ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
          commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          notes TEXT NULL,
          assigned_by INT UNSIGNED NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT ambassador_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT ambassador_profiles_admin_fk FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX ambassador_profiles_status_idx (status, role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    // Tabelle für manuelle Admin-Korrekturen an Referrals
    db()->exec(
        "CREATE TABLE IF NOT EXISTS referral_admin_log (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          referral_id INT UNSIGNED NULL,
          admin_id INT UNSIGNED NOT NULL,
          action VARCHAR(80) NOT NULL,
          note TEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT referral_admin_log_admin_fk FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX referral_admin_log_referral_idx (referral_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

// ---------------------------------------------------------------------------
// Reward-Konfiguration
// ---------------------------------------------------------------------------

function hotmess_referral_member_reward_config(): array
{
    return [
        'registered'     => ['points' => 100,  'label' => 'Neue Registrierung'],
        'ticket'         => ['points' => 250,  'label' => 'Erster Ticketkauf'],
        'passport_plus'  => ['points' => 500,  'label' => 'Passport Plus Kauf'],
        'passport_black' => ['points' => 1500, 'label' => 'Passport Black Kauf'],
        'package'        => ['points' => 1000, 'label' => 'Package Buchung'],
    ];
}

function hotmess_referral_ambassador_reward_config(): array
{
    return [
        'registered'     => ['points' => 250,  'label' => 'Neue Registrierung'],
        'ticket'         => ['points' => 500,  'label' => 'Erster Ticketkauf'],
        'passport_plus'  => ['points' => 1000, 'label' => 'Passport Plus Kauf'],
        'passport_black' => ['points' => 3000, 'label' => 'Passport Black Kauf'],
        'package'        => ['points' => 2500, 'label' => 'Package Buchung'],
    ];
}

function hotmess_referral_role_label(string $role): string
{
    return match ($role) {
        'city'   => 'City Ambassador',
        'travel' => 'Travel Ambassador',
        'vip'    => 'VIP Ambassador',
        'brand'  => 'Brand Ambassador',
        default  => 'Ambassador',
    };
}

// ---------------------------------------------------------------------------
// Code generieren
// ---------------------------------------------------------------------------

function hotmess_referral_generate_code(int $userId): string
{
    hotmess_referral_ensure_schema();

    $stmt = db()->prepare('SELECT name FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $name = (string) ($stmt->fetchColumn() ?: '');

    // Ersten Namensteil extrahieren, bereinigen
    $namePart = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', explode(' ', trim($name))[0]) ?? '');
    $namePart = $namePart !== '' ? substr($namePart, 0, 12) : 'MEMBER';

    // Einzigartigen Suffix generieren
    for ($i = 0; $i < 20; $i++) {
        $suffix = strtoupper(bin2hex(random_bytes(2))); // 4 Zeichen Hex
        $code = 'HOTMESS-' . $namePart . '-' . $suffix;

        $exists = db()->prepare('SELECT COUNT(*) FROM referral_codes WHERE code = ?');
        $exists->execute([$code]);
        if ((int) $exists->fetchColumn() === 0) {
            return $code;
        }
    }

    // Fallback mit User-ID
    return 'HOTMESS-MEMBER-' . strtoupper(bin2hex(random_bytes(3)));
}

function hotmess_referral_get_or_create_code(int $userId): array
{
    hotmess_referral_ensure_schema();

    $stmt = db()->prepare('SELECT * FROM referral_codes WHERE user_id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $existing = $stmt->fetch();

    if ($existing) {
        return $existing;
    }

    $code = hotmess_referral_generate_code($userId);

    db()->prepare(
        'INSERT INTO referral_codes (user_id, code, status) VALUES (?, ?, "active")'
    )->execute([$userId, $code]);

    $stmt = db()->prepare('SELECT * FROM referral_codes WHERE user_id = ? LIMIT 1');
    $stmt->execute([$userId]);
    return $stmt->fetch();
}

function hotmess_referral_find_by_code(string $code): ?array
{
    hotmess_referral_ensure_schema();

    $stmt = db()->prepare(
        'SELECT rc.*, u.name, u.email FROM referral_codes rc
         JOIN users u ON u.id = rc.user_id
         WHERE rc.code = ? LIMIT 1'
    );
    $stmt->execute([strtoupper(trim($code))]);
    $row = $stmt->fetch();

    return $row ?: null;
}

// ---------------------------------------------------------------------------
// Referral bei Registrierung anlegen
// ---------------------------------------------------------------------------

function hotmess_referral_record_registration(int $referrerId, int $newUserId, string $code, string $source = 'link'): bool
{
    hotmess_referral_ensure_schema();

    // Missbrauchsschutz: kein Self-Referral
    if ($referrerId === $newUserId) {
        return false;
    }

    // Missbrauchsschutz: bereits ein Referral für diesen User?
    $exists = db()->prepare('SELECT COUNT(*) FROM referrals WHERE referred_user_id = ? LIMIT 1');
    $exists->execute([$newUserId]);
    if ((int) $exists->fetchColumn() > 0) {
        return false;
    }

    // Code-Status prüfen
    $codeRow = hotmess_referral_find_by_code($code);
    if (!$codeRow || $codeRow['status'] !== 'active' || (int) $codeRow['user_id'] !== $referrerId) {
        return false;
    }

    // Referral anlegen
    db()->prepare(
        'INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, source, status)
         VALUES (?, ?, ?, ?, "registered")'
    )->execute([$referrerId, $newUserId, strtoupper(trim($code)), $source]);

    // Code-Nutzung aktualisieren
    db()->prepare(
        'UPDATE referral_codes SET uses_total = uses_total + 1, last_used_at = NOW() WHERE code = ?'
    )->execute([strtoupper(trim($code))]);

    // Registrierungs-Punkte vergeben
    try {
        hotmess_referral_award_points($referrerId, 'registered', null, 0.0, (int) db()->lastInsertId());
    } catch (Throwable) {}

    return true;
}

// ---------------------------------------------------------------------------
// Conversion bei Zahlung verarbeiten
// ---------------------------------------------------------------------------

function hotmess_referral_process_conversion(int $referredUserId, string $purchaseType, string $purchaseId, float $amount): void
{
    hotmess_referral_ensure_schema();

    $validTypes = ['ticket', 'passport_plus', 'passport_black', 'package'];
    if (!in_array($purchaseType, $validTypes, true)) {
        return;
    }

    // Referral für diesen User suchen
    $stmt = db()->prepare(
        'SELECT * FROM referrals WHERE referred_user_id = ? AND status IN ("registered","pending") LIMIT 1'
    );
    $stmt->execute([$referredUserId]);
    $referral = $stmt->fetch();

    if (!$referral) {
        return;
    }

    $referralId = (int) $referral['id'];
    $referrerId = (int) $referral['referrer_user_id'];

    // Missbrauchsschutz: gesperrten/gebannten Nutzer nicht belohnen
    $referrerStmt = db()->prepare('SELECT status, role FROM users WHERE id = ? LIMIT 1');
    $referrerStmt->execute([$referrerId]);
    $referrer = $referrerStmt->fetch();
    if (!$referrer || $referrer['status'] === 'rejected') {
        return;
    }

    // Conversion speichern
    db()->prepare(
        'UPDATE referrals SET
            status = "converted",
            first_purchase_type = ?,
            first_purchase_id = ?,
            first_purchase_amount = ?,
            converted_at = NOW(),
            updated_at = NOW()
         WHERE id = ? AND status IN ("registered","pending")'
    )->execute([$purchaseType, $purchaseId, $amount, $referralId]);

    if (db()->rowCount() === 0) {
        return; // Wurde bereits verarbeitet
    }

    // Punkte vergeben
    hotmess_referral_award_points($referrerId, $purchaseType, $referralId, $amount, $referralId);

    // Als belohnt markieren
    db()->prepare(
        'UPDATE referrals SET status = "rewarded", rewarded_at = NOW(), updated_at = NOW() WHERE id = ?'
    )->execute([$referralId]);
}

// ---------------------------------------------------------------------------
// Punkte vergeben (Member vs Ambassador)
// ---------------------------------------------------------------------------

function hotmess_referral_award_points(int $referrerId, string $eventType, ?int $referralId, float $amount, int $logReferralId): int
{
    $ambassadorProfile = hotmess_referral_get_ambassador(referrer: $referrerId);
    $isAmbassador = $ambassadorProfile && $ambassadorProfile['status'] === 'active';

    $config = $isAmbassador
        ? hotmess_referral_ambassador_reward_config()
        : hotmess_referral_member_reward_config();

    $points = (int) ($config[$eventType]['points'] ?? 0);
    $label  = (string) ($config[$eventType]['label'] ?? $eventType);

    if ($points <= 0) {
        return 0;
    }

    $sourceType = $isAmbassador ? 'ambassador' : 'referral';
    $description = $isAmbassador
        ? 'Ambassador Reward: ' . $label
        : 'Referral Reward: ' . $label;
    $sourceRef = $referralId ? 'referral_' . $referralId : '';

    $earned = hotmess_loyalty_earn(
        $referrerId,
        $points,
        'earn',
        $sourceType,
        $description,
        $sourceRef
    );

    // Punktestand am Referral vermerken
    if ($referralId) {
        db()->prepare(
            'UPDATE referrals SET points_awarded = points_awarded + ? WHERE id = ?'
        )->execute([$earned, $referralId]);
    }

    return $earned;
}

// ---------------------------------------------------------------------------
// Ambassador
// ---------------------------------------------------------------------------

function hotmess_referral_get_ambassador(int $referrer): ?array
{
    hotmess_referral_ensure_schema();

    $stmt = db()->prepare(
        'SELECT ap.*, u.name, u.email FROM ambassador_profiles ap
         JOIN users u ON u.id = ap.user_id
         WHERE ap.user_id = ? AND ap.status = "active" LIMIT 1'
    );
    $stmt->execute([$referrer]);
    $row = $stmt->fetch();

    return $row ?: null;
}

function hotmess_referral_is_ambassador(int $userId): bool
{
    return hotmess_referral_get_ambassador(referrer: $userId) !== null;
}

// ---------------------------------------------------------------------------
// Member-Statistiken
// ---------------------------------------------------------------------------

function hotmess_referral_stats_for_user(int $userId): array
{
    hotmess_referral_ensure_schema();

    $codeRow = hotmess_referral_get_or_create_code($userId);

    $stmt = db()->prepare(
        'SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status IN ("registered","converted","rewarded") THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN status IN ("converted","rewarded") THEN 1 ELSE 0 END) AS converted,
           SUM(CASE WHEN status = "rewarded" THEN 1 ELSE 0 END) AS rewarded,
           SUM(points_awarded) AS total_points
         FROM referrals WHERE referrer_user_id = ?'
    );
    $stmt->execute([$userId]);
    $stats = $stmt->fetch() ?: [];

    return [
        'code'         => (string) $codeRow['code'],
        'code_status'  => (string) $codeRow['status'],
        'total'        => (int) ($stats['total'] ?? 0),
        'active'       => (int) ($stats['active'] ?? 0),
        'converted'    => (int) ($stats['converted'] ?? 0),
        'rewarded'     => (int) ($stats['rewarded'] ?? 0),
        'total_points' => (int) ($stats['total_points'] ?? 0),
    ];
}

function hotmess_referral_list_for_user(int $userId, int $limit = 30): array
{
    hotmess_referral_ensure_schema();

    $stmt = db()->prepare(
        'SELECT r.*, u.name AS referred_name
         FROM referrals r
         JOIN users u ON u.id = r.referred_user_id
         WHERE r.referrer_user_id = ?
         ORDER BY r.created_at DESC LIMIT ' . max(1, min(100, $limit))
    );
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

// ---------------------------------------------------------------------------
// Admin-Funktionen
// ---------------------------------------------------------------------------

function hotmess_referral_admin_stats(): array
{
    hotmess_referral_ensure_schema();

    $stats = db()->query(
        'SELECT
           COUNT(*) AS total_referrals,
           SUM(CASE WHEN status = "registered" THEN 1 ELSE 0 END) AS pending,
           SUM(CASE WHEN status IN ("converted","rewarded") THEN 1 ELSE 0 END) AS converted,
           SUM(CASE WHEN status = "rewarded" THEN 1 ELSE 0 END) AS rewarded,
           SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) AS cancelled,
           SUM(points_awarded) AS total_points_awarded,
           SUM(first_purchase_amount) AS total_revenue
         FROM referrals'
    )->fetch() ?: [];

    $codes = (int) db()->query('SELECT COUNT(*) FROM referral_codes WHERE status = "active"')->fetchColumn();
    $ambassadors = (int) db()->query('SELECT COUNT(*) FROM ambassador_profiles WHERE status = "active"')->fetchColumn();

    return [
        'total_referrals'    => (int) ($stats['total_referrals'] ?? 0),
        'pending'            => (int) ($stats['pending'] ?? 0),
        'converted'          => (int) ($stats['converted'] ?? 0),
        'rewarded'           => (int) ($stats['rewarded'] ?? 0),
        'cancelled'          => (int) ($stats['cancelled'] ?? 0),
        'total_points'       => (int) ($stats['total_points_awarded'] ?? 0),
        'total_revenue'      => (float) ($stats['total_revenue'] ?? 0),
        'active_codes'       => $codes,
        'active_ambassadors' => $ambassadors,
    ];
}

function hotmess_referral_admin_list(array $filters = [], int $limit = 100): array
{
    hotmess_referral_ensure_schema();

    $where = [];
    $params = [];

    if (!empty($filters['status'])) {
        $where[] = 'r.status = ?';
        $params[] = $filters['status'];
    }
    if (!empty($filters['purchase_type'])) {
        $where[] = 'r.first_purchase_type = ?';
        $params[] = $filters['purchase_type'];
    }
    if (!empty($filters['search'])) {
        $where[] = '(referrer.name LIKE ? OR referrer.email LIKE ? OR referred.name LIKE ? OR r.referral_code LIKE ?)';
        $s = '%' . $filters['search'] . '%';
        $params = array_merge($params, [$s, $s, $s, $s]);
    }
    if (!empty($filters['date_from'])) {
        $where[] = 'r.created_at >= ?';
        $params[] = $filters['date_from'] . ' 00:00:00';
    }
    if (!empty($filters['date_to'])) {
        $where[] = 'r.created_at <= ?';
        $params[] = $filters['date_to'] . ' 23:59:59';
    }
    if (!empty($filters['ambassador_only'])) {
        $where[] = 'ap.id IS NOT NULL';
    }

    $sql = 'SELECT r.*,
              referrer.name AS referrer_name, referrer.email AS referrer_email,
              referred.name AS referred_name, referred.email AS referred_email,
              ap.role AS ambassador_role
            FROM referrals r
            JOIN users referrer ON referrer.id = r.referrer_user_id
            JOIN users referred ON referred.id = r.referred_user_id
            LEFT JOIN ambassador_profiles ap ON ap.user_id = r.referrer_user_id AND ap.status = "active"';

    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $sql .= ' ORDER BY r.created_at DESC LIMIT ' . max(1, min(500, $limit));

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function hotmess_referral_admin_codes(array $filters = [], int $limit = 100): array
{
    hotmess_referral_ensure_schema();

    $where = [];
    $params = [];

    if (!empty($filters['status'])) {
        $where[] = 'rc.status = ?';
        $params[] = $filters['status'];
    }
    if (!empty($filters['search'])) {
        $where[] = '(u.name LIKE ? OR u.email LIKE ? OR rc.code LIKE ?)';
        $s = '%' . $filters['search'] . '%';
        $params = array_merge($params, [$s, $s, $s]);
    }

    $sql = 'SELECT rc.*, u.name, u.email,
              (SELECT COUNT(*) FROM referrals r WHERE r.referral_code = rc.code) AS referral_count,
              (SELECT COUNT(*) FROM referrals r WHERE r.referral_code = rc.code AND r.status IN ("converted","rewarded")) AS conversion_count
            FROM referral_codes rc
            JOIN users u ON u.id = rc.user_id';

    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $sql .= ' ORDER BY rc.created_at DESC LIMIT ' . max(1, min(500, $limit));

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function hotmess_referral_ambassador_list(int $limit = 50): array
{
    hotmess_referral_ensure_schema();

    $stmt = db()->prepare(
        'SELECT ap.*, u.name, u.email,
           (SELECT COUNT(*) FROM referrals r WHERE r.referrer_user_id = ap.user_id) AS total_referrals,
           (SELECT COUNT(*) FROM referrals r WHERE r.referrer_user_id = ap.user_id AND r.status IN ("converted","rewarded")) AS conversions,
           (SELECT SUM(r.first_purchase_amount) FROM referrals r WHERE r.referrer_user_id = ap.user_id AND r.status IN ("converted","rewarded")) AS revenue_generated,
           (SELECT SUM(r.points_awarded) FROM referrals r WHERE r.referrer_user_id = ap.user_id) AS points_awarded,
           (SELECT COUNT(*) FROM referrals r WHERE r.referrer_user_id = ap.user_id AND r.first_purchase_type = "passport_black") AS black_conversions,
           (SELECT COUNT(*) FROM referrals r WHERE r.referrer_user_id = ap.user_id AND r.first_purchase_type = "package") AS package_conversions
         FROM ambassador_profiles ap
         JOIN users u ON u.id = ap.user_id
         WHERE ap.status = "active"
         ORDER BY conversions DESC, total_referrals DESC
         LIMIT ?'
    );
    $stmt->execute([$limit]);
    return $stmt->fetchAll();
}

function hotmess_referral_admin_update_code_status(int $codeId, string $status, int $adminId): void
{
    hotmess_referral_ensure_schema();

    $validStatuses = ['active', 'paused', 'archived'];
    if (!in_array($status, $validStatuses, true)) {
        return;
    }

    db()->prepare('UPDATE referral_codes SET status = ?, updated_at = NOW() WHERE id = ?')
        ->execute([$status, $codeId]);

    db()->prepare(
        'INSERT INTO referral_admin_log (referral_id, admin_id, action, note) VALUES (NULL, ?, ?, ?)'
    )->execute([$adminId, 'code_status_changed', 'Code #' . $codeId . ' → ' . $status]);
}

function hotmess_referral_admin_cancel_referral(int $referralId, int $adminId, string $note = ''): void
{
    hotmess_referral_ensure_schema();

    db()->prepare(
        'UPDATE referrals SET status = "cancelled", admin_note = ?, updated_at = NOW() WHERE id = ?'
    )->execute([trim($note) ?: null, $referralId]);

    db()->prepare(
        'INSERT INTO referral_admin_log (referral_id, admin_id, action, note) VALUES (?, ?, "cancelled", ?)'
    )->execute([$referralId, $adminId, $note]);
}

function hotmess_referral_admin_add_ambassador(int $userId, string $role, string $city, int $adminId): void
{
    hotmess_referral_ensure_schema();

    $validRoles = ['city', 'travel', 'vip', 'brand'];
    if (!in_array($role, $validRoles, true)) {
        $role = 'city';
    }

    db()->prepare(
        'INSERT INTO ambassador_profiles (user_id, role, city, status, assigned_by)
         VALUES (?, ?, ?, "active", ?)
         ON DUPLICATE KEY UPDATE role = VALUES(role), city = VALUES(city), status = "active", assigned_by = VALUES(assigned_by), updated_at = NOW()'
    )->execute([$userId, $role, trim($city) ?: null, $adminId]);

    db()->prepare(
        'INSERT INTO referral_admin_log (referral_id, admin_id, action, note) VALUES (NULL, ?, "ambassador_assigned", ?)'
    )->execute([$adminId, 'User #' . $userId . ' als ' . $role . ' Ambassador']);
}

function hotmess_referral_admin_update_referral_status(int $referralId, string $status, int $adminId, string $note = ''): void
{
    hotmess_referral_ensure_schema();

    $validStatuses = ['pending', 'registered', 'converted', 'rewarded', 'cancelled'];
    if (!in_array($status, $validStatuses, true)) {
        return;
    }

    db()->prepare(
        'UPDATE referrals SET status = ?, admin_note = COALESCE(NULLIF(?, ""), admin_note), updated_at = NOW() WHERE id = ?'
    )->execute([$status, $note, $referralId]);

    db()->prepare(
        'INSERT INTO referral_admin_log (referral_id, admin_id, action, note) VALUES (?, ?, ?, ?)'
    )->execute([$referralId, $adminId, 'status_changed_to_' . $status, $note]);
}

// ---------------------------------------------------------------------------
// Session-Helfer: Referral-Code beim Registrieren merken
// ---------------------------------------------------------------------------

function hotmess_referral_remember_code(string $code): void
{
    if (preg_match('/^HOTMESS-[A-Z0-9]+-[A-Z0-9]{4}$/', strtoupper(trim($code)))) {
        $_SESSION['referral_code'] = strtoupper(trim($code));
    }
}

function hotmess_referral_get_session_code(): ?string
{
    return isset($_SESSION['referral_code']) ? (string) $_SESSION['referral_code'] : null;
}

function hotmess_referral_clear_session_code(): void
{
    unset($_SESSION['referral_code']);
}

// ---------------------------------------------------------------------------
// Status-Labels
// ---------------------------------------------------------------------------

function hotmess_referral_status_label(string $status): string
{
    return match ($status) {
        'pending'    => 'Ausstehend',
        'registered' => 'Registriert',
        'converted'  => 'Konvertiert',
        'rewarded'   => 'Belohnt',
        'cancelled'  => 'Storniert',
        default      => $status,
    };
}

function hotmess_referral_purchase_type_label(string $type): string
{
    return match ($type) {
        'ticket'         => 'Ticket',
        'passport_plus'  => 'Passport Plus',
        'passport_black' => 'Passport Black',
        'package'        => 'Package',
        default          => $type,
    };
}
