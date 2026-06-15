<?php

declare(strict_types=1);

function hotmess_analytics_ensure_table(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;

    db()->exec(
        "CREATE TABLE IF NOT EXISTS analytics_events (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_type VARCHAR(80) NOT NULL,
            user_id INT UNSIGNED NULL,
            session_id VARCHAR(80) NULL,
            source VARCHAR(80) NULL,
            metadata JSON NULL,
            ip_hash VARCHAR(64) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX analytics_event_type_idx (event_type, created_at),
            INDEX analytics_user_idx (user_id, created_at),
            INDEX analytics_created_idx (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function hotmess_track(string $eventType, array $metadata = [], ?int $userId = null): void
{
    try {
        hotmess_analytics_ensure_table();
        $sessionId = session_id() ?: null;
        $ipHash = !empty($_SERVER['REMOTE_ADDR']) ? hash('sha256', (string) $_SERVER['REMOTE_ADDR']) : null;
        $source = (string) ($_SERVER['HTTP_REFERER'] ?? '');
        if (strlen($source) > 80) {
            $source = substr($source, 0, 80);
        }

        db()->prepare(
            'INSERT INTO analytics_events (event_type, user_id, session_id, source, metadata, ip_hash) VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([
            $eventType,
            $userId,
            $sessionId,
            $source ?: null,
            $metadata ? json_encode($metadata, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : null,
            $ipHash,
        ]);
    } catch (Throwable) {
    }
}

function hotmess_analytics_kpis_live(): array
{
    try {
        hotmess_analytics_ensure_table();

        $today = db()->query(
            "SELECT event_type, COUNT(*) AS cnt FROM analytics_events WHERE created_at >= CURDATE() GROUP BY event_type"
        )->fetchAll();
        $week = db()->query(
            "SELECT event_type, COUNT(*) AS cnt FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY event_type"
        )->fetchAll();
        $month = db()->query(
            "SELECT event_type, COUNT(*) AS cnt FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY event_type"
        )->fetchAll();

        $toMap = static fn (array $rows): array => array_column($rows, 'cnt', 'event_type');

        return [
            'today' => $toMap($today),
            'week' => $toMap($week),
            'month' => $toMap($month),
            'total' => (int) db()->query('SELECT COUNT(*) FROM analytics_events')->fetchColumn(),
            'unique_users_today' => (int) db()->query("SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at >= CURDATE() AND user_id IS NOT NULL")->fetchColumn(),
            'unique_users_week' => (int) db()->query("SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND user_id IS NOT NULL")->fetchColumn(),
        ];
    } catch (Throwable) {
        return ['today' => [], 'week' => [], 'month' => [], 'total' => 0, 'unique_users_today' => 0, 'unique_users_week' => 0];
    }
}

function hotmess_analytics_daily_series(int $days = 30): array
{
    try {
        hotmess_analytics_ensure_table();
        $stmt = db()->prepare(
            "SELECT DATE(created_at) AS day, COUNT(*) AS cnt
             FROM analytics_events
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             GROUP BY DATE(created_at)
             ORDER BY day ASC"
        );
        $stmt->execute([$days]);
        return $stmt->fetchAll();
    } catch (Throwable) {
        return [];
    }
}

// Event-Type constants for consistent tracking
const ANALYTICS_REGISTER_START     = 'register_start';
const ANALYTICS_REGISTER_COMPLETE  = 'register_complete';
const ANALYTICS_LOGIN               = 'login';
const ANALYTICS_MEMBERSHIP_VIEW     = 'membership_view';
const ANALYTICS_MEMBERSHIP_CHECKOUT = 'membership_checkout_start';
const ANALYTICS_TICKET_CHECKOUT     = 'ticket_checkout_start';
const ANALYTICS_TICKET_PURCHASED    = 'ticket_purchased';
const ANALYTICS_PACKAGE_INQUIRY     = 'package_inquiry';
const ANALYTICS_HOTEL_INQUIRY       = 'hotel_inquiry';
const ANALYTICS_REFERRAL_LANDING    = 'referral_landing';
const ANALYTICS_CHECKIN_SUCCESS     = 'checkin_success';
const ANALYTICS_ONBOARDING_STEP     = 'onboarding_step';
const ANALYTICS_PROFILE_UPDATE      = 'profile_update';
