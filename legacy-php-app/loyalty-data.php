<?php

declare(strict_types=1);

// ---------------------------------------------------------------------------
// HOTMESS Passport Loyalty Engine — Daten & Businesslogik
// ---------------------------------------------------------------------------

function hotmess_loyalty_ensure_schema(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS loyalty_accounts (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL UNIQUE,
          points_balance INT UNSIGNED NOT NULL DEFAULT 0,
          points_lifetime INT UNSIGNED NOT NULL DEFAULT 0,
          loyalty_tier ENUM('bronze','silver','gold','black') NOT NULL DEFAULT 'bronze',
          tier_updated_at DATETIME NULL,
          last_activity_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expiry_notified_90 TINYINT(1) NOT NULL DEFAULT 0,
          expiry_notified_30 TINYINT(1) NOT NULL DEFAULT 0,
          expiry_notified_7 TINYINT(1) NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT loyalty_accounts_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX loyalty_accounts_tier_idx (loyalty_tier, points_balance),
          INDEX loyalty_accounts_activity_idx (last_activity_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS loyalty_transactions (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL,
          points INT NOT NULL,
          balance_after INT UNSIGNED NOT NULL DEFAULT 0,
          type ENUM('earn','redeem','expire','admin_add','admin_remove','bonus') NOT NULL,
          source ENUM('ticket','package','hotel','checkin','referral','ambassador','membership','event_first','manual','system') NOT NULL,
          source_ref VARCHAR(120) NULL,
          description VARCHAR(255) NOT NULL,
          admin_id INT UNSIGNED NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT loyalty_tx_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT loyalty_tx_admin_fk FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX loyalty_tx_user_idx (user_id, created_at),
          INDEX loyalty_tx_type_idx (type, source, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS loyalty_rewards (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(160) NOT NULL,
          description TEXT NULL,
          required_tier ENUM('bronze','silver','gold','black') NOT NULL DEFAULT 'gold',
          reward_type ENUM('access','discount','upgrade','benefit','partner') NOT NULL DEFAULT 'benefit',
          partner_name VARCHAR(120) NULL,
          points_cost INT UNSIGNED NOT NULL DEFAULT 0,
          stock INT NULL,
          active TINYINT(1) NOT NULL DEFAULT 1,
          sort_order INT UNSIGNED NOT NULL DEFAULT 0,
          created_by INT UNSIGNED NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT loyalty_rewards_admin_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX loyalty_rewards_tier_idx (required_tier, active, sort_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS loyalty_redemptions (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL,
          reward_id INT UNSIGNED NOT NULL,
          points_spent INT UNSIGNED NOT NULL DEFAULT 0,
          status ENUM('pending','confirmed','used','cancelled') NOT NULL DEFAULT 'pending',
          code VARCHAR(40) NULL,
          notes TEXT NULL,
          confirmed_by INT UNSIGNED NULL,
          confirmed_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT loyalty_redeem_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT loyalty_redeem_reward_fk FOREIGN KEY (reward_id) REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
          CONSTRAINT loyalty_redeem_admin_fk FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX loyalty_redeem_user_idx (user_id, created_at),
          INDEX loyalty_redeem_status_idx (status, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

// ---------------------------------------------------------------------------
// Tier-Konfiguration
// ---------------------------------------------------------------------------

function hotmess_loyalty_tiers(): array
{
    return [
        'bronze' => [
            'label'       => 'Bronze',
            'min_points'  => 0,
            'max_points'  => 999,
            'multiplier'  => 1.0,
            'color'       => '#cd7f32',
            'benefits'    => ['Community-Zugang', 'Punkte sammeln', 'Rewards einsehen'],
        ],
        'silver' => [
            'label'       => 'Silver',
            'min_points'  => 1000,
            'max_points'  => 4999,
            'multiplier'  => 1.0,
            'color'       => '#c0c0c0',
            'benefits'    => ['Alle Bronze-Vorteile', 'Silver Rewards freigeschalten'],
        ],
        'gold' => [
            'label'       => 'Gold',
            'min_points'  => 5000,
            'max_points'  => 14999,
            'multiplier'  => 1.1,
            'color'       => '#d4af37',
            'benefits'    => ['Fast Lane', 'Early Access', 'Partner Benefits', '+10% Punkte-Multiplikator'],
        ],
        'black' => [
            'label'       => 'Black',
            'min_points'  => 15000,
            'max_points'  => PHP_INT_MAX,
            'multiplier'  => 1.2,
            'color'       => '#1a1a1a',
            'benefits'    => ['Concierge Priorität', 'Signature Packages früher buchbar', 'Exklusive Community Events', 'VIP Hotel Upgrades', '+20% Punkte-Multiplikator'],
        ],
    ];
}

function hotmess_loyalty_tier_for_points(int $points): string
{
    foreach (array_reverse(hotmess_loyalty_tiers(), true) as $key => $tier) {
        if ($points >= $tier['min_points']) {
            return $key;
        }
    }
    return 'bronze';
}

function hotmess_loyalty_tier_multiplier(string $tier): float
{
    return (float) (hotmess_loyalty_tiers()[$tier]['multiplier'] ?? 1.0);
}

// ---------------------------------------------------------------------------
// Punkte-Quellen-Konfiguration
// ---------------------------------------------------------------------------

function hotmess_loyalty_earn_rules(): array
{
    return [
        'ticket'      => ['label' => 'Ticket kaufen',          'base' => 1,   'unit' => 'eur',      'description' => '1 € = 1 Punkt'],
        'package'     => ['label' => 'Package buchen',         'base' => 2,   'unit' => 'eur',      'description' => '1 € = 2 Punkte'],
        'hotel'       => ['label' => 'Hotel buchen',           'base' => 1,   'unit' => 'eur',      'description' => '1 € = 1 Punkt'],
        'checkin'     => ['label' => 'Event Check-in',         'base' => 100, 'unit' => 'fixed',    'description' => '+100 Punkte pro Check-in'],
        'referral'    => ['label' => 'Mitglied empfehlen',     'base' => 500, 'unit' => 'fixed',    'description' => '+500 Punkte bei bestätigter Empfehlung'],
        'ambassador'  => ['label' => 'Ambassador Monatsbonus', 'base' => 250, 'unit' => 'fixed',    'description' => '+250 Punkte monatlich als Ambassador'],
        'membership'  => ['label' => 'Passport Plus/Black',    'base' => 1,   'unit' => 'eur',      'description' => '1 € = 1 Punkt (Membership-Gebühr)'],
        'event_first' => ['label' => 'Erstes Event',           'base' => 250, 'unit' => 'fixed',    'description' => '+250 Punkte für erstes Event (einmalig)'],
    ];
}

// ---------------------------------------------------------------------------
// Account holen oder anlegen
// ---------------------------------------------------------------------------

function hotmess_loyalty_account(int $userId): array
{
    hotmess_loyalty_ensure_schema();

    $stmt = db()->prepare(
        'SELECT la.*, u.name, u.email FROM loyalty_accounts la
         JOIN users u ON u.id = la.user_id
         WHERE la.user_id = ? LIMIT 1'
    );
    $stmt->execute([$userId]);
    $account = $stmt->fetch();

    if (!$account) {
        db()->prepare(
            'INSERT INTO loyalty_accounts (user_id, points_balance, points_lifetime, loyalty_tier, last_activity_at)
             VALUES (?, 0, 0, "bronze", NOW())'
        )->execute([$userId]);

        return hotmess_loyalty_account($userId);
    }

    return $account;
}

// ---------------------------------------------------------------------------
// Punkte vergeben
// ---------------------------------------------------------------------------

function hotmess_loyalty_earn(
    int $userId,
    int $basePoints,
    string $type,
    string $source,
    string $description,
    string $sourceRef = '',
    ?int $adminId = null
): int {
    hotmess_loyalty_ensure_schema();

    $account = hotmess_loyalty_account($userId);
    $tier = (string) $account['loyalty_tier'];
    $multiplier = hotmess_loyalty_tier_multiplier($tier);
    $points = (int) round($basePoints * $multiplier);

    if ($points <= 0) {
        return 0;
    }

    $newBalance = (int) $account['points_balance'] + $points;
    $newLifetime = (int) $account['points_lifetime'] + $points;
    $newTier = hotmess_loyalty_tier_for_points($newBalance);

    db()->prepare(
        'UPDATE loyalty_accounts
         SET points_balance = ?, points_lifetime = ?, loyalty_tier = ?,
             tier_updated_at = IF(loyalty_tier != ?, NOW(), tier_updated_at),
             last_activity_at = NOW(),
             expiry_notified_90 = 0, expiry_notified_30 = 0, expiry_notified_7 = 0,
             updated_at = NOW()
         WHERE user_id = ?'
    )->execute([$newBalance, $newLifetime, $newTier, $newTier, $userId]);

    db()->prepare(
        'INSERT INTO loyalty_transactions (user_id, points, balance_after, type, source, source_ref, description, admin_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$userId, $points, $newBalance, $type, $source, $sourceRef ?: null, $description, $adminId]);

    return $points;
}

// ---------------------------------------------------------------------------
// Punkte abziehen (Einlösen)
// ---------------------------------------------------------------------------

function hotmess_loyalty_spend(int $userId, int $points, string $description, string $sourceRef = ''): void
{
    hotmess_loyalty_ensure_schema();

    $account = hotmess_loyalty_account($userId);
    if ((int) $account['points_balance'] < $points) {
        throw new RuntimeException('Nicht genug Punkte zum Einlösen.');
    }

    $newBalance = (int) $account['points_balance'] - $points;
    $newTier = hotmess_loyalty_tier_for_points($newBalance);

    db()->prepare(
        'UPDATE loyalty_accounts
         SET points_balance = ?, loyalty_tier = ?,
             tier_updated_at = IF(loyalty_tier != ?, NOW(), tier_updated_at),
             last_activity_at = NOW(), updated_at = NOW()
         WHERE user_id = ?'
    )->execute([$newBalance, $newTier, $newTier, $userId]);

    db()->prepare(
        'INSERT INTO loyalty_transactions (user_id, points, balance_after, type, source, source_ref, description)
         VALUES (?, ?, ?, "redeem", "manual", ?, ?)'
    )->execute([$userId, -$points, $newBalance, $sourceRef ?: null, $description]);
}

// ---------------------------------------------------------------------------
// Punkte verfallen (Cronjob / Admin-Trigger)
// ---------------------------------------------------------------------------

function hotmess_loyalty_expire_inactive(): int
{
    hotmess_loyalty_ensure_schema();

    $stmt = db()->query(
        'SELECT user_id, points_balance FROM loyalty_accounts
         WHERE points_balance > 0
           AND last_activity_at < DATE_SUB(NOW(), INTERVAL 12 MONTH)'
    );
    $rows = $stmt->fetchAll();
    $count = 0;

    foreach ($rows as $row) {
        $userId = (int) $row['user_id'];
        $balance = (int) $row['points_balance'];

        db()->prepare(
            'UPDATE loyalty_accounts
             SET points_balance = 0, loyalty_tier = "bronze",
                 tier_updated_at = NOW(), updated_at = NOW()
             WHERE user_id = ?'
        )->execute([$userId]);

        db()->prepare(
            'INSERT INTO loyalty_transactions (user_id, points, balance_after, type, source, description)
             VALUES (?, ?, 0, "expire", "system", "Punkte verfallen nach 12 Monaten Inaktivität")'
        )->execute([$userId, -$balance]);

        $count++;
    }

    return $count;
}

// ---------------------------------------------------------------------------
// Ablauf-Benachrichtigungen (90 / 30 / 7 Tage)
// ---------------------------------------------------------------------------

function hotmess_loyalty_expiry_due_notifications(): array
{
    hotmess_loyalty_ensure_schema();

    $due = [];
    $intervals = [
        90 => 'expiry_notified_90',
        30 => 'expiry_notified_30',
        7  => 'expiry_notified_7',
    ];

    foreach ($intervals as $days => $flag) {
        $stmt = db()->prepare(
            "SELECT la.user_id, u.email, u.name, la.points_balance
             FROM loyalty_accounts la
             JOIN users u ON u.id = la.user_id
             WHERE la.points_balance > 0
               AND la.$flag = 0
               AND la.last_activity_at < DATE_SUB(NOW(), INTERVAL ? DAY)
               AND la.last_activity_at >= DATE_SUB(NOW(), INTERVAL ? DAY)"
        );
        $stmt->execute([$days, $days + 30]);
        $rows = $stmt->fetchAll();

        foreach ($rows as $row) {
            $due[] = array_merge($row, ['days_left' => $days, 'flag' => $flag]);
        }
    }

    return $due;
}

function hotmess_loyalty_mark_notified(int $userId, string $flag): void
{
    db()->prepare("UPDATE loyalty_accounts SET $flag = 1 WHERE user_id = ?")->execute([$userId]);
}

// ---------------------------------------------------------------------------
// Transaktionshistorie
// ---------------------------------------------------------------------------

function hotmess_loyalty_transactions(int $userId, int $limit = 50): array
{
    hotmess_loyalty_ensure_schema();

    $stmt = db()->prepare(
        'SELECT * FROM loyalty_transactions WHERE user_id = ?
         ORDER BY created_at DESC LIMIT ' . max(1, min(200, $limit))
    );
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------

function hotmess_loyalty_rewards(string $tier = '', bool $activeOnly = true): array
{
    hotmess_loyalty_ensure_schema();

    $tiers = ['bronze', 'silver', 'gold', 'black'];
    $tierIndex = array_search($tier, $tiers, true);
    $accessible = $tierIndex !== false ? array_slice($tiers, 0, $tierIndex + 1) : $tiers;

    $placeholders = implode(',', array_fill(0, count($accessible), '?'));
    $params = $accessible;
    $where = "required_tier IN ($placeholders)";

    if ($activeOnly) {
        $where .= ' AND active = 1';
    }

    $stmt = db()->prepare("SELECT * FROM loyalty_rewards WHERE $where ORDER BY sort_order ASC, id ASC");
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function hotmess_loyalty_all_rewards(): array
{
    hotmess_loyalty_ensure_schema();
    return db()->query('SELECT * FROM loyalty_rewards ORDER BY sort_order ASC, id ASC')->fetchAll();
}

function hotmess_loyalty_redeem_reward(int $userId, int $rewardId): array
{
    hotmess_loyalty_ensure_schema();

    $account = hotmess_loyalty_account($userId);
    $stmt = db()->prepare('SELECT * FROM loyalty_rewards WHERE id = ? AND active = 1 LIMIT 1');
    $stmt->execute([$rewardId]);
    $reward = $stmt->fetch();

    if (!$reward) {
        throw new RuntimeException('Reward nicht gefunden oder nicht aktiv.');
    }

    $tiers = ['bronze', 'silver', 'gold', 'black'];
    $userTierIndex = array_search($account['loyalty_tier'], $tiers, true);
    $requiredIndex = array_search($reward['required_tier'], $tiers, true);

    if ($userTierIndex < $requiredIndex) {
        throw new RuntimeException('Dein Status reicht für diesen Reward nicht aus.');
    }

    if ((int) $reward['points_cost'] > 0) {
        hotmess_loyalty_spend($userId, (int) $reward['points_cost'], 'Reward eingelöst: ' . $reward['title'], (string) $rewardId);
    }

    if ($reward['stock'] !== null && (int) $reward['stock'] <= 0) {
        throw new RuntimeException('Dieser Reward ist ausverkauft.');
    }

    if ($reward['stock'] !== null) {
        db()->prepare('UPDATE loyalty_rewards SET stock = stock - 1 WHERE id = ? AND stock > 0')->execute([$rewardId]);
    }

    $code = strtoupper('HM-' . bin2hex(random_bytes(4)));
    db()->prepare(
        'INSERT INTO loyalty_redemptions (user_id, reward_id, points_spent, status, code)
         VALUES (?, ?, ?, "pending", ?)'
    )->execute([$userId, $rewardId, (int) $reward['points_cost'], $code]);

    return ['code' => $code, 'reward' => $reward];
}

// ---------------------------------------------------------------------------
// Einlösungen für User
// ---------------------------------------------------------------------------

function hotmess_loyalty_user_redemptions(int $userId): array
{
    hotmess_loyalty_ensure_schema();

    $stmt = db()->prepare(
        'SELECT lr.*, rew.title, rew.description, rew.reward_type, rew.partner_name
         FROM loyalty_redemptions lr
         JOIN loyalty_rewards rew ON rew.id = lr.reward_id
         WHERE lr.user_id = ?
         ORDER BY lr.created_at DESC LIMIT 50'
    );
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

// ---------------------------------------------------------------------------
// Admin: alle Accounts
// ---------------------------------------------------------------------------

function hotmess_loyalty_admin_accounts(array $filters = [], int $limit = 100): array
{
    hotmess_loyalty_ensure_schema();

    $where = [];
    $params = [];

    if (!empty($filters['tier'])) {
        $where[] = 'la.loyalty_tier = ?';
        $params[] = $filters['tier'];
    }
    if (!empty($filters['search'])) {
        $where[] = '(u.name LIKE ? OR u.email LIKE ?)';
        $params[] = '%' . $filters['search'] . '%';
        $params[] = '%' . $filters['search'] . '%';
    }

    $sql = 'SELECT la.*, u.name, u.email FROM loyalty_accounts la
            JOIN users u ON u.id = la.user_id';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY la.points_balance DESC LIMIT ' . max(1, min(500, $limit));

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

// ---------------------------------------------------------------------------
// Admin: Punkte manuell vergeben / abziehen
// ---------------------------------------------------------------------------

function hotmess_loyalty_admin_adjust(int $userId, int $points, string $type, string $description, int $adminId): void
{
    if ($type === 'admin_add') {
        hotmess_loyalty_earn($userId, $points, 'admin_add', 'manual', $description, '', $adminId);
    } elseif ($type === 'admin_remove') {
        hotmess_loyalty_spend($userId, $points, $description);
        // Admin-Eintrag ergänzen
        db()->prepare(
            'UPDATE loyalty_transactions SET admin_id = ?, type = "admin_remove"
             WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        )->execute([$adminId, $userId]);
    } else {
        throw new RuntimeException('Unbekannte Admin-Aktion.');
    }
}

// ---------------------------------------------------------------------------
// Admin: Reward CRUD
// ---------------------------------------------------------------------------

function hotmess_loyalty_save_reward(array $data, int $adminId): int
{
    hotmess_loyalty_ensure_schema();

    $id = (int) ($data['id'] ?? 0);
    $title = trim((string) ($data['title'] ?? ''));
    $description = trim((string) ($data['description'] ?? ''));
    $requiredTier = in_array($data['required_tier'] ?? '', ['bronze', 'silver', 'gold', 'black'], true) ? $data['required_tier'] : 'gold';
    $rewardType = in_array($data['reward_type'] ?? '', ['access', 'discount', 'upgrade', 'benefit', 'partner'], true) ? $data['reward_type'] : 'benefit';
    $partnerName = trim((string) ($data['partner_name'] ?? ''));
    $pointsCost = max(0, (int) ($data['points_cost'] ?? 0));
    $stock = isset($data['stock']) && $data['stock'] !== '' ? max(0, (int) $data['stock']) : null;
    $active = isset($data['active']) ? 1 : 0;
    $sortOrder = max(0, (int) ($data['sort_order'] ?? 0));

    if ($title === '') {
        throw new RuntimeException('Titel ist erforderlich.');
    }

    if ($id > 0) {
        db()->prepare(
            'UPDATE loyalty_rewards SET title=?, description=?, required_tier=?, reward_type=?,
             partner_name=?, points_cost=?, stock=?, active=?, sort_order=?, updated_at=NOW()
             WHERE id=?'
        )->execute([$title, $description, $requiredTier, $rewardType, $partnerName ?: null, $pointsCost, $stock, $active, $sortOrder, $id]);
        return $id;
    }

    db()->prepare(
        'INSERT INTO loyalty_rewards (title, description, required_tier, reward_type, partner_name, points_cost, stock, active, sort_order, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$title, $description, $requiredTier, $rewardType, $partnerName ?: null, $pointsCost, $stock, $active, $sortOrder, $adminId]);

    return (int) db()->lastInsertId();
}

// ---------------------------------------------------------------------------
// Admin: Redemption bestätigen
// ---------------------------------------------------------------------------

function hotmess_loyalty_confirm_redemption(int $redemptionId, int $adminId): void
{
    hotmess_loyalty_ensure_schema();
    db()->prepare(
        'UPDATE loyalty_redemptions SET status="confirmed", confirmed_by=?, confirmed_at=NOW(), updated_at=NOW()
         WHERE id=? AND status="pending"'
    )->execute([$adminId, $redemptionId]);
}

// ---------------------------------------------------------------------------
// Admin: Umsatzanalyse pro Loyalty-Stufe
// ---------------------------------------------------------------------------

function hotmess_loyalty_revenue_by_tier(): array
{
    hotmess_loyalty_ensure_schema();

    $stmt = db()->query(
        'SELECT la.loyalty_tier,
                COUNT(DISTINCT la.user_id) AS member_count,
                SUM(la.points_lifetime) AS total_lifetime_points,
                AVG(la.points_balance) AS avg_balance,
                MAX(la.points_balance) AS max_balance
         FROM loyalty_accounts la
         GROUP BY la.loyalty_tier
         ORDER BY FIELD(la.loyalty_tier, "black", "gold", "silver", "bronze")'
    );
    return $stmt->fetchAll();
}

function hotmess_loyalty_top_earners(int $limit = 10): array
{
    hotmess_loyalty_ensure_schema();

    $stmt = db()->prepare(
        'SELECT la.*, u.name, u.email
         FROM loyalty_accounts la
         JOIN users u ON u.id = la.user_id
         ORDER BY la.points_lifetime DESC LIMIT ?'
    );
    $stmt->execute([$limit]);
    return $stmt->fetchAll();
}

function hotmess_loyalty_stats(): array
{
    hotmess_loyalty_ensure_schema();

    $totals = db()->query(
        'SELECT COUNT(*) AS accounts,
                SUM(points_balance) AS total_balance,
                SUM(points_lifetime) AS total_lifetime,
                COUNT(CASE WHEN loyalty_tier="black" THEN 1 END) AS black_count,
                COUNT(CASE WHEN loyalty_tier="gold" THEN 1 END) AS gold_count,
                COUNT(CASE WHEN loyalty_tier="silver" THEN 1 END) AS silver_count,
                COUNT(CASE WHEN loyalty_tier="bronze" THEN 1 END) AS bronze_count
         FROM loyalty_accounts'
    )->fetch();

    $pendingRedemptions = (int) db()->query(
        'SELECT COUNT(*) FROM loyalty_redemptions WHERE status = "pending"'
    )->fetchColumn();

    return [
        'accounts'            => (int) ($totals['accounts'] ?? 0),
        'total_balance'       => (int) ($totals['total_balance'] ?? 0),
        'total_lifetime'      => (int) ($totals['total_lifetime'] ?? 0),
        'black_count'         => (int) ($totals['black_count'] ?? 0),
        'gold_count'          => (int) ($totals['gold_count'] ?? 0),
        'silver_count'        => (int) ($totals['silver_count'] ?? 0),
        'bronze_count'        => (int) ($totals['bronze_count'] ?? 0),
        'pending_redemptions' => $pendingRedemptions,
    ];
}

// ---------------------------------------------------------------------------
// Erstes-Event-Bonus (einmalig +250)
// ---------------------------------------------------------------------------

function hotmess_loyalty_check_first_event_bonus(int $userId): void
{
    $stmt = db()->prepare(
        'SELECT COUNT(*) FROM loyalty_transactions WHERE user_id = ? AND source = "event_first" LIMIT 1'
    );
    $stmt->execute([$userId]);
    if ((int) $stmt->fetchColumn() === 0) {
        hotmess_loyalty_earn($userId, 250, 'bonus', 'event_first', 'Bonus: Erstes HOTMESS Event');
    }
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function hotmess_loyalty_format_points(int $points): string
{
    return number_format($points, 0, ',', '.') . ' Punkte';
}

function hotmess_loyalty_next_tier_progress(array $account): array
{
    $tiers = hotmess_loyalty_tiers();
    $current = (string) $account['loyalty_tier'];
    $balance = (int) $account['points_balance'];
    $tierKeys = array_keys($tiers);
    $currentIndex = array_search($current, $tierKeys, true);
    $nextIndex = $currentIndex + 1;

    if (!isset($tierKeys[$nextIndex])) {
        return ['next' => null, 'needed' => 0, 'percent' => 100];
    }

    $nextKey = $tierKeys[$nextIndex];
    $needed = $tiers[$nextKey]['min_points'] - $balance;
    $range = $tiers[$nextKey]['min_points'] - $tiers[$current]['min_points'];
    $done = $balance - $tiers[$current]['min_points'];
    $percent = $range > 0 ? min(100, (int) round($done / $range * 100)) : 100;

    return [
        'next'    => $nextKey,
        'label'   => $tiers[$nextKey]['label'],
        'needed'  => max(0, $needed),
        'percent' => $percent,
    ];
}
