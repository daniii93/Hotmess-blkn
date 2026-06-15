<?php

declare(strict_types=1);

function hotmess_phase1_column_exists(string $table, string $column): bool
{
    try {
        $stmt = db()->prepare(
            'SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
        );
        $stmt->execute([$table, $column]);

        return (int) $stmt->fetchColumn() > 0;
    } catch (Throwable) {
        return false;
    }
}

function hotmess_phase1_add_column(string $table, string $column, string $definition): void
{
    if (hotmess_phase1_column_exists($table, $column)) {
        return;
    }

    try {
        db()->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
    } catch (Throwable) {
    }
}

function hotmess_ensure_phase1_schema(): void
{
    hotmess_phase1_add_column('users', 'gender', "ENUM('male','female','non_binary','undisclosed') NOT NULL DEFAULT 'undisclosed'");
    hotmess_phase1_add_column('users', 'verification_status', "ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified'");
    hotmess_phase1_add_column('users', 'cover_image_url', 'VARCHAR(255) NULL');
    hotmess_phase1_add_column('users', 'language', "VARCHAR(10) NOT NULL DEFAULT 'de'");
    hotmess_phase1_add_column('users', 'is_private', 'TINYINT(1) NOT NULL DEFAULT 0');
    hotmess_phase1_add_column('users', 'is_active', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_phase1_add_column('users', 'show_followers', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_phase1_add_column('users', 'show_following', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_phase1_add_column('users', 'show_event_count', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_phase1_add_column('users', 'events_visited', 'INT UNSIGNED NOT NULL DEFAULT 0');
    hotmess_phase1_add_column('users', 'followers_count', 'INT UNSIGNED NOT NULL DEFAULT 0');
    hotmess_phase1_add_column('users', 'following_count', 'INT UNSIGNED NOT NULL DEFAULT 0');

    $sql = [
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_venues (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(190) NOT NULL,
            city VARCHAR(120) NOT NULL,
            country VARCHAR(80) NOT NULL DEFAULT 'AT',
            address VARCHAR(255) NULL,
            map_url VARCHAR(500) NULL,
            capacity INT UNSIGNED NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_event_gender_config (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_slug VARCHAR(190) NOT NULL UNIQUE,
            male_quota_percent INT UNSIGNED NOT NULL DEFAULT 50,
            female_quota_percent INT UNSIGNED NOT NULL DEFAULT 50,
            non_binary_quota_percent INT UNSIGNED NOT NULL DEFAULT 0,
            balance_enabled TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_waitlist (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NULL,
            event_slug VARCHAR(190) NOT NULL,
            email VARCHAR(190) NOT NULL,
            name VARCHAR(190) NOT NULL,
            gender VARCHAR(40) NULL,
            requested_ticket_type VARCHAR(120) NULL,
            status ENUM('waiting','invited','expired','converted','cancelled') NOT NULL DEFAULT 'waiting',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX hotmess_phase1_waitlist_event_idx (event_slug, status, created_at)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_discount_codes (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(80) NOT NULL UNIQUE,
            event_slug VARCHAR(190) NULL,
            discount_type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
            discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
            max_redemptions INT UNSIGNED NULL,
            redeemed_count INT UNSIGNED NOT NULL DEFAULT 0,
            starts_at DATETIME NULL,
            ends_at DATETIME NULL,
            status ENUM('active','paused','expired','archived') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_event_tables (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_slug VARCHAR(190) NOT NULL,
            title VARCHAR(160) NOT NULL,
            min_spend DECIMAL(12,2) NOT NULL DEFAULT 0,
            capacity INT UNSIGNED NOT NULL DEFAULT 0,
            status ENUM('available','reserved','sold_out','hidden') NOT NULL DEFAULT 'available',
            benefits JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX hotmess_phase1_event_tables_event_idx (event_slug, status)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_table_bookings (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            table_id INT UNSIGNED NULL,
            user_id INT UNSIGNED NULL,
            event_slug VARCHAR(190) NOT NULL,
            name VARCHAR(190) NOT NULL,
            email VARCHAR(190) NOT NULL,
            phone VARCHAR(80) NULL,
            guest_count INT UNSIGNED NOT NULL DEFAULT 1,
            budget_range VARCHAR(120) NULL,
            status ENUM('new','contacted','confirmed','declined','archived') NOT NULL DEFAULT 'new',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_drink_packages (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_slug VARCHAR(190) NULL,
            title VARCHAR(160) NOT NULL,
            description TEXT NULL,
            price DECIMAL(12,2) NOT NULL DEFAULT 0,
            currency CHAR(3) NOT NULL DEFAULT 'EUR',
            includes JSON NULL,
            status ENUM('active','hidden','archived') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_birthday_packages (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            event_slug VARCHAR(190) NULL,
            title VARCHAR(160) NOT NULL,
            description TEXT NULL,
            price DECIMAL(12,2) NOT NULL DEFAULT 0,
            includes JSON NULL,
            status ENUM('active','hidden','archived') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_hotel_codes (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            hotel_id VARCHAR(120) NULL,
            event_slug VARCHAR(190) NULL,
            code VARCHAR(120) NOT NULL,
            label VARCHAR(190) NOT NULL,
            booking_url VARCHAR(500) NULL,
            valid_until DATETIME NULL,
            status ENUM('active','expired','hidden','archived') NOT NULL DEFAULT 'active',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_follows (
            follower_id INT UNSIGNED NOT NULL,
            following_id INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, following_id),
            INDEX hotmess_phase1_follows_following_idx (following_id, created_at)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_follow_requests (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            requester_id INT UNSIGNED NOT NULL,
            target_id INT UNSIGNED NOT NULL,
            status ENUM('pending','accepted','declined','cancelled') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY hotmess_phase1_follow_requests_unique (requester_id, target_id)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_posts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            body TEXT NOT NULL,
            media_url VARCHAR(500) NULL,
            visibility ENUM('members','followers','private') NOT NULL DEFAULT 'members',
            status ENUM('published','hidden','archived') NOT NULL DEFAULT 'published',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX hotmess_phase1_posts_user_idx (user_id, created_at)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_likes (
            post_id INT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (post_id, user_id)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_comments (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            post_id INT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NOT NULL,
            body TEXT NOT NULL,
            status ENUM('published','hidden','archived') NOT NULL DEFAULT 'published',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_friend_activity (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NULL,
            actor_id INT UNSIGNED NULL,
            activity_type ENUM('ticket','checkin','follow','post','profile','package','hotel','system') NOT NULL DEFAULT 'system',
            title VARCHAR(190) NOT NULL,
            detail TEXT NULL,
            related_url VARCHAR(500) NULL,
            visibility ENUM('private','friends','members') NOT NULL DEFAULT 'friends',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX hotmess_phase1_friend_activity_user_idx (user_id, created_at)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_notifications (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            type VARCHAR(80) NOT NULL,
            title VARCHAR(190) NOT NULL,
            body TEXT NULL,
            action_url VARCHAR(500) NULL,
            read_at DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX hotmess_phase1_notifications_user_idx (user_id, read_at, created_at)
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_notification_settings (
            user_id INT UNSIGNED PRIMARY KEY,
            email_enabled TINYINT(1) NOT NULL DEFAULT 1,
            push_enabled TINYINT(1) NOT NULL DEFAULT 0,
            event_updates TINYINT(1) NOT NULL DEFAULT 1,
            chat_updates TINYINT(1) NOT NULL DEFAULT 1,
            marketing_updates TINYINT(1) NOT NULL DEFAULT 0,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS hotmess_phase1_scanner_access (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            event_slug VARCHAR(190) NULL,
            role ENUM('scanner','lead','admin') NOT NULL DEFAULT 'scanner',
            active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY hotmess_phase1_scanner_access_unique (user_id, event_slug)
        )",
    ];

    foreach ($sql as $statement) {
        try {
            db()->exec($statement);
        } catch (Throwable) {
        }
    }
}

function hotmess_phase1_notification_count(int $userId): int
{
    hotmess_ensure_phase1_schema();

    try {
        $stmt = db()->prepare('SELECT COUNT(*) FROM hotmess_phase1_notifications WHERE user_id = ? AND read_at IS NULL');
        $stmt->execute([$userId]);

        return (int) $stmt->fetchColumn();
    } catch (Throwable) {
        return 0;
    }
}

