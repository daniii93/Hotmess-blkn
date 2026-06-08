<?php

declare(strict_types=1);

function hotmess_lifecycle_stages(): array
{
    return ['visitor', 'registered', 'attendee', 'repeat_attendee', 'member', 'passport_plus', 'passport_black', 'ambassador', 'vip'];
}

function hotmess_loyalty_level_for_score(int $score): string
{
    $level = 'member';

    foreach (hotmess_loyalty_levels() as $candidate) {
        if ($score >= (int) $candidate['threshold']) {
            $level = (string) $candidate['slug'];
        }
    }

    return $level;
}

function hotmess_ensure_crm_tables(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_customer_profiles (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL UNIQUE,
          lifecycle_stage ENUM('visitor', 'registered', 'attendee', 'repeat_attendee', 'member', 'passport_plus', 'passport_black', 'ambassador', 'vip') NOT NULL DEFAULT 'registered',
          loyalty_level ENUM('member', 'silver', 'gold', 'black', 'ambassador') NOT NULL DEFAULT 'member',
          loyalty_score INT UNSIGNED NOT NULL DEFAULT 0,
          event_score INT UNSIGNED NOT NULL DEFAULT 0,
          travel_score INT UNSIGNED NOT NULL DEFAULT 0,
          community_score INT UNSIGNED NOT NULL DEFAULT 0,
          membership_score INT UNSIGNED NOT NULL DEFAULT 0,
          last_activity VARCHAR(190) NULL,
          last_activity_at DATETIME NULL,
          metadata JSON NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT platform_customer_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX platform_customer_profiles_stage_idx (lifecycle_stage, loyalty_level),
          INDEX platform_customer_profiles_score_idx (loyalty_score)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_loyalty_accounts (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL UNIQUE,
          points_balance INT UNSIGNED NOT NULL DEFAULT 0,
          loyalty_level ENUM('member', 'silver', 'gold', 'black', 'ambassador') NOT NULL DEFAULT 'member',
          next_reward_id VARCHAR(120) NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT platform_loyalty_accounts_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX platform_loyalty_accounts_level_idx (loyalty_level, points_balance)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_loyalty_transactions (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL,
          type ENUM('registration', 'ticket_purchase', 'event_attendance', 'hotel_booking', 'package_booking', 'membership_upgrade', 'community_attendance', 'referral', 'partner_redemption') NOT NULL,
          points INT NOT NULL,
          description VARCHAR(255) NOT NULL,
          related_id VARCHAR(120) NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT platform_loyalty_transactions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX platform_loyalty_transactions_user_idx (user_id, created_at),
          INDEX platform_loyalty_transactions_type_idx (type)
        )"
    );
}

function hotmess_record_customer_signal(
    int $userId,
    string $type,
    int $points,
    string $description,
    ?string $relatedId = null,
    string $lifecycleStage = 'registered',
    array $scoreDelta = []
): void {
    if ($userId <= 0) {
        return;
    }

    try {
        hotmess_ensure_crm_tables();
        $stmt = db()->prepare(
            'INSERT INTO platform_loyalty_transactions (user_id, type, points, description, related_id) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $type, $points, $description, $relatedId]);

        db()->prepare(
            'INSERT INTO platform_loyalty_accounts (user_id, points_balance, loyalty_level)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE points_balance = points_balance + VALUES(points_balance),
               loyalty_level = CASE
                 WHEN points_balance + VALUES(points_balance) >= 9000 THEN "ambassador"
                 WHEN points_balance + VALUES(points_balance) >= 5200 THEN "black"
                 WHEN points_balance + VALUES(points_balance) >= 2200 THEN "gold"
                 WHEN points_balance + VALUES(points_balance) >= 800 THEN "silver"
                 ELSE "member"
               END'
        )->execute([$userId, max(0, $points), hotmess_loyalty_level_for_score($points)]);

        $eventDelta = (int) ($scoreDelta['event'] ?? 0);
        $travelDelta = (int) ($scoreDelta['travel'] ?? 0);
        $communityDelta = (int) ($scoreDelta['community'] ?? 0);
        $membershipDelta = (int) ($scoreDelta['membership'] ?? 0);
        db()->prepare(
            'INSERT INTO platform_customer_profiles
              (user_id, lifecycle_stage, loyalty_level, loyalty_score, event_score, travel_score, community_score, membership_score, last_activity, last_activity_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE lifecycle_stage = VALUES(lifecycle_stage),
               loyalty_score = loyalty_score + VALUES(loyalty_score),
               loyalty_level = CASE
                 WHEN loyalty_score + VALUES(loyalty_score) >= 9000 THEN "ambassador"
                 WHEN loyalty_score + VALUES(loyalty_score) >= 5200 THEN "black"
                 WHEN loyalty_score + VALUES(loyalty_score) >= 2200 THEN "gold"
                 WHEN loyalty_score + VALUES(loyalty_score) >= 800 THEN "silver"
                 ELSE "member"
               END,
               event_score = LEAST(100, event_score + VALUES(event_score)),
               travel_score = LEAST(100, travel_score + VALUES(travel_score)),
               community_score = LEAST(100, community_score + VALUES(community_score)),
               membership_score = LEAST(100, membership_score + VALUES(membership_score)),
               last_activity = VALUES(last_activity),
               last_activity_at = NOW()'
        )->execute([$userId, $lifecycleStage, hotmess_loyalty_level_for_score($points), max(0, $points), $eventDelta, $travelDelta, $communityDelta, $membershipDelta, $description]);
    } catch (Throwable $exception) {
        // CRM persistence is progressive. The platform remains usable with mock data.
    }
}

function hotmess_loyalty_levels(): array
{
    return [
        ['slug' => 'member', 'title' => 'Member', 'threshold' => 0, 'badge' => 'Member', 'benefits' => ['Event reminders', 'City Guide access', 'Community updates']],
        ['slug' => 'silver', 'title' => 'Silver', 'threshold' => 800, 'badge' => 'Silver', 'benefits' => ['Early access signals', 'Selected partner codes', 'Priority community registration']],
        ['slug' => 'gold', 'title' => 'Gold', 'threshold' => 2200, 'badge' => 'Gold', 'benefits' => ['Hotel benefits', 'Fast lane moments', 'Welcome gift eligibility']],
        ['slug' => 'black', 'title' => 'Black', 'threshold' => 5200, 'badge' => 'Black', 'benefits' => ['Concierge priority', 'VIP upgrade options', 'Signature partner access']],
        ['slug' => 'ambassador', 'title' => 'Ambassador', 'threshold' => 9000, 'badge' => 'Ambassador', 'benefits' => ['Referral rewards', 'Hosted community access', 'Brand ambassador placement']],
    ];
}

function hotmess_customer_profiles(): array
{
    return [
        [
            'id' => 'customer-1',
            'userId' => '1',
            'name' => 'Amelie Noir',
            'email' => 'amelie@example.com',
            'city' => 'Innsbruck',
            'membership' => 'Passport Black',
            'lifecycleStage' => 'passport_black',
            'loyaltyLevel' => 'black',
            'loyaltyScore' => 6840,
            'eventScore' => 92,
            'travelScore' => 78,
            'communityScore' => 84,
            'membershipScore' => 96,
            'lastVisit' => '2026-05-28',
            'lastActivity' => 'VIP table inquiry',
            'eventHistory' => ['Innsbruck Private Weekend', 'Vienna Rooftop Arrival'],
            'hotelHistory' => ['Signature City Stay'],
            'packageHistory' => ['VIP Weekend Innsbruck'],
            'referralStatus' => '3 converted referrals',
        ],
        [
            'id' => 'customer-2',
            'userId' => '2',
            'name' => 'Marco Valen',
            'email' => 'marco@example.com',
            'city' => 'Vienna',
            'membership' => 'Passport Plus',
            'lifecycleStage' => 'passport_plus',
            'loyaltyLevel' => 'gold',
            'loyaltyScore' => 3120,
            'eventScore' => 74,
            'travelScore' => 68,
            'communityScore' => 52,
            'membershipScore' => 81,
            'lastVisit' => '2026-05-22',
            'lastActivity' => 'Hotel benefit redeemed',
            'eventHistory' => ['Vienna Rooftop Arrival'],
            'hotelHistory' => ['Late Checkout Vienna'],
            'packageHistory' => ['Travel Weekend Vienna'],
            'referralStatus' => '1 active invite',
        ],
        [
            'id' => 'customer-3',
            'userId' => '3',
            'name' => 'Sofia K.',
            'email' => 'sofia@example.com',
            'city' => 'Dubrovnik',
            'membership' => 'Free Passport',
            'lifecycleStage' => 'attendee',
            'loyaltyLevel' => 'silver',
            'loyaltyScore' => 1240,
            'eventScore' => 58,
            'travelScore' => 34,
            'communityScore' => 42,
            'membershipScore' => 28,
            'lastVisit' => '2026-05-12',
            'lastActivity' => 'Package inquiry',
            'eventHistory' => ['Adriatic Passport Weekend'],
            'hotelHistory' => [],
            'packageHistory' => ['Signature Weekend Adriatic inquiry'],
            'referralStatus' => 'No referrals yet',
        ],
    ];
}

function hotmess_customer_profile_for_user(?array $user): array
{
    $profiles = hotmess_customer_profiles();
    $profile = $profiles[0];
    $profile['userId'] = (string) ($user['id'] ?? $profile['userId']);
    $profile['name'] = $user['name'] ?? $profile['name'];
    $profile['email'] = $user['email'] ?? $profile['email'];
    $profile['city'] = $user['city'] ?? $profile['city'];

    return $profile;
}

function hotmess_loyalty_transactions(?array $user = null): array
{
    $userId = (string) ($user['id'] ?? '1');

    return [
        ['id' => 'ltx-register', 'userId' => $userId, 'type' => 'registration', 'points' => 150, 'description' => 'Passport profile created', 'createdAt' => '2026-05-01'],
        ['id' => 'ltx-ticket', 'userId' => $userId, 'type' => 'ticket_purchase', 'points' => 420, 'description' => 'Ticket purchase: Innsbruck Private Weekend', 'createdAt' => '2026-05-09'],
        ['id' => 'ltx-community', 'userId' => $userId, 'type' => 'community_attendance', 'points' => 260, 'description' => 'Passport Pre-Drinks attendance', 'createdAt' => '2026-05-18'],
        ['id' => 'ltx-referral', 'userId' => $userId, 'type' => 'referral', 'points' => 500, 'description' => 'Referral converted to Passport Plus', 'createdAt' => '2026-05-24'],
        ['id' => 'ltx-benefit', 'userId' => $userId, 'type' => 'partner_redemption', 'points' => 180, 'description' => 'Partner offer redeemed', 'createdAt' => '2026-05-29'],
    ];
}

function hotmess_rewards(): array
{
    return [
        ['id' => 'reward-early-access', 'title' => 'Early Access Window', 'pointsRequired' => 700, 'levelRequired' => 'member', 'description' => 'Priority signal before public allocation opens.', 'status' => 'available'],
        ['id' => 'reward-hotel-benefit', 'title' => 'Host Hotel Benefit', 'pointsRequired' => 1800, 'levelRequired' => 'silver', 'description' => 'Late checkout or welcome benefit request with selected hotels.', 'status' => 'available'],
        ['id' => 'reward-fast-lane', 'title' => 'Fast Lane Moment', 'pointsRequired' => 3000, 'levelRequired' => 'gold', 'description' => 'Prepared fast lane benefit for a selected HotMess chapter.', 'status' => 'limited'],
        ['id' => 'reward-welcome-gift', 'title' => 'Welcome Gift', 'pointsRequired' => 5200, 'levelRequired' => 'black', 'description' => 'Limited gift layer for Black and high-score members.', 'status' => 'limited'],
    ];
}

function hotmess_referrals(?array $user = null): array
{
    $userId = (string) ($user['id'] ?? '1');

    return [
        'code' => 'HOTMESS-' . strtoupper(substr(preg_replace('/[^A-Za-z]/', '', (string) ($user['name'] ?? 'BLACK')), 0, 5)),
        'inviteUrl' => 'https://hotmess-blkn.com/register.php?ref=HOTMESS',
        'friends' => [
            ['name' => 'Lina M.', 'email' => 'lina@example.com', 'status' => 'registered', 'reward' => '150 points'],
            ['name' => 'Nico R.', 'email' => 'nico@example.com', 'status' => 'converted', 'reward' => '500 points'],
            ['name' => 'Iva S.', 'email' => 'iva@example.com', 'status' => 'invited', 'reward' => 'pending'],
        ],
        'rewards' => [
            ['title' => 'First conversion', 'description' => '500 HotMess Points', 'status' => 'granted'],
            ['title' => 'Three converted friends', 'description' => 'Fast Lane request eligibility', 'status' => 'next'],
        ],
        'userId' => $userId,
    ];
}

function hotmess_automation_rules(): array
{
    return [
        ['id' => 'auto-register', 'trigger' => 'registration', 'action' => 'welcome_email', 'title' => 'Registration -> Welcome mail', 'description' => 'Introduce Passport, app and next city guide.', 'enabled' => true, 'status' => 'draft'],
        ['id' => 'auto-event-purchase', 'trigger' => 'event_purchase', 'action' => 'hotel_recommendation', 'title' => 'Event purchase -> Hotel recommendation', 'description' => 'Send host hotel and travel benefit suggestions.', 'enabled' => true, 'status' => 'draft'],
        ['id' => 'auto-hotel-booking', 'trigger' => 'hotel_booking', 'action' => 'package_recommendation', 'title' => 'Hotel booking -> Package recommendation', 'description' => 'Suggest Travel, VIP or Signature Weekend layers.', 'enabled' => true, 'status' => 'draft'],
        ['id' => 'auto-event-attended', 'trigger' => 'event_attended', 'action' => 'next_event_recommendation', 'title' => 'Event attended -> Next event', 'description' => 'Recommend the next matching city or format.', 'enabled' => true, 'status' => 'draft'],
        ['id' => 'auto-upgrade', 'trigger' => 'membership_upgrade', 'action' => 'benefits_mail', 'title' => 'Membership upgrade -> Benefits mail', 'description' => 'Explain new Passport Plus or Black benefits.', 'enabled' => true, 'status' => 'draft'],
        ['id' => 'auto-birthday', 'trigger' => 'birthday', 'action' => 'birthday_benefit', 'title' => 'Birthday -> Birthday benefit', 'description' => 'Prepare member-only birthday benefit.', 'enabled' => false, 'status' => 'planned'],
        ['id' => 'auto-inactive', 'trigger' => 'inactivity', 'action' => 'reactivation', 'title' => 'Inactivity -> Reactivation', 'description' => 'Quiet premium reactivation with relevant city content.', 'enabled' => false, 'status' => 'planned'],
        ['id' => 'auto-referral', 'trigger' => 'referral_success', 'action' => 'bonus_points', 'title' => 'Referral success -> Bonus points', 'description' => 'Grant points and next referral stage messaging.', 'enabled' => true, 'status' => 'draft'],
    ];
}

function hotmess_partner_referral_metrics(): array
{
    return [
        ['partner' => 'Signature City Stay', 'campaign' => 'Host Hotel Passport', 'leads' => 42, 'registrations' => 18, 'bookings' => 7, 'conversionRate' => '16.6%', 'status' => 'active'],
        ['partner' => 'Midnight Bar', 'campaign' => 'Welcome Drink Referral', 'leads' => 31, 'registrations' => 12, 'bookings' => 4, 'conversionRate' => '12.9%', 'status' => 'active'],
        ['partner' => 'Black Room Sponsor', 'campaign' => 'VIP Upgrade Signal', 'leads' => 24, 'registrations' => 9, 'bookings' => 3, 'conversionRate' => '12.5%', 'status' => 'planned'],
    ];
}
