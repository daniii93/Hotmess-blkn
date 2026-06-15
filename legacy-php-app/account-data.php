<?php

declare(strict_types=1);

require_once __DIR__ . '/events-data.php';
require_once __DIR__ . '/packages-data.php';
require_once __DIR__ . '/membership-data.php';
require_once __DIR__ . '/partners-data.php';
require_once __DIR__ . '/crm-data.php';
require_once __DIR__ . '/concierge-data.php';
require_once __DIR__ . '/payments.php';

function hotmess_account_nav(): array
{
    return [
        ['label' => 'Overview', 'slug' => 'overview', 'href' => '/account'],
        ['label' => 'Profile', 'slug' => 'profile', 'href' => '/account/profile'],
        ['label' => 'Membership', 'slug' => 'membership', 'href' => '/account/membership'],
        ['label' => 'Tickets', 'slug' => 'tickets', 'href' => '/account/tickets'],
        ['label' => 'Events', 'slug' => 'events', 'href' => '/account/events'],
        ['label' => 'Hotels', 'slug' => 'hotels', 'href' => '/account/hotels'],
        ['label' => 'Packages', 'slug' => 'packages', 'href' => '/account/packages'],
        ['label' => 'Benefits', 'slug' => 'benefits', 'href' => '/account/benefits'],
        ['label' => 'Rewards', 'slug' => 'rewards', 'href' => '/account/rewards'],
        ['label' => 'Referrals', 'slug' => 'referrals', 'href' => '/account/referrals'],
        ['label' => 'Concierge', 'slug' => 'concierge', 'href' => '/account/concierge'],
        ['label' => 'Settings', 'slug' => 'settings', 'href' => '/account/settings'],
    ];
}

function hotmess_account_profile(?array $user): array
{
    return [
        'id' => 'profile-' . ($user['id'] ?? 'guest'),
        'userId' => $user['id'] ?? 0,
        'name' => $user['name'] ?? 'HotMess Guest',
        'email' => $user['email'] ?? 'guest@hotmess-blkn.com',
        'city' => $user['city'] ?? 'Innsbruck',
        'birthday' => $user['birthday'] ?? '',
        'interests' => json_decode((string) ($user['interests'] ?? ''), true) ?: ['Signature Nights', 'Hotels', 'VIP Tables', 'Community Brunch'],
        'preferredCities' => json_decode((string) ($user['preferred_cities'] ?? ''), true) ?: ['Innsbruck', 'Vienna', 'Dubrovnik', 'Milan'],
        'bio' => (string) ($user['bio'] ?? ''),
        'avatarUrl' => $user['profile_photo'] ?? '',
        'newsletterConsent' => (bool) ($user['newsletter_consent'] ?? true),
        'createdAt' => $user['created_at'] ?? '2026-06-02',
    ];
}

function hotmess_account_saved_events(?array $user): array
{
    $events = hotmess_events();

    return [
        ['id' => 'saved-event-1', 'userId' => $user['id'] ?? 0, 'eventId' => $events[0]['id'], 'status' => 'saved', 'reminderEnabled' => true, 'event' => $events[0]],
        ['id' => 'saved-event-2', 'userId' => $user['id'] ?? 0, 'eventId' => $events[1]['id'], 'status' => 'recommended', 'reminderEnabled' => false, 'event' => $events[1]],
    ];
}

function hotmess_account_tickets(?array $user): array
{
    $events = hotmess_events();

    return [
        ['id' => 'ticket-wallet-1', 'userId' => $user['id'] ?? 0, 'eventId' => $events[0]['id'], 'eventName' => $events[0]['title'], 'date' => $events[0]['startDate'], 'ticketType' => 'Passport Plus Early Access', 'qrCode' => 'HM-' . ($user['id'] ?? '000') . '-VIP', 'status' => 'active'],
        ['id' => 'ticket-wallet-2', 'userId' => $user['id'] ?? 0, 'eventId' => $events[1]['id'], 'eventName' => $events[1]['title'], 'date' => $events[1]['startDate'], 'ticketType' => 'Regular', 'qrCode' => 'HM-' . ($user['id'] ?? '000') . '-REG', 'status' => 'active'],
    ];
}

function hotmess_account_hotels(?array $user): array
{
    return [
        ['id' => 'saved-hotel-1', 'userId' => $user['id'] ?? 0, 'hotelId' => 'signature-city-stay', 'name' => 'Signature City Stay', 'city' => 'Innsbruck', 'benefit' => 'Late checkout request', 'bookingUrl' => '/hotels/signature-city-stay', 'status' => 'saved'],
        ['id' => 'saved-hotel-2', 'userId' => $user['id'] ?? 0, 'hotelId' => 'late-checkout-partner', 'name' => 'Late Checkout Partner', 'city' => 'Vienna', 'benefit' => 'Passport hotel code', 'bookingUrl' => '/hotels/late-checkout-partner', 'status' => 'recommended'],
    ];
}

function hotmess_account_packages(?array $user): array
{
    $packages = hotmess_packages();

    return [
        ['id' => 'saved-package-1', 'userId' => $user['id'] ?? 0, 'packageId' => $packages[0]['id'], 'status' => 'saved', 'vipInterest' => true, 'package' => $packages[0]],
        ['id' => 'package-inquiry-1', 'userId' => $user['id'] ?? 0, 'packageId' => $packages[2]['id'], 'status' => 'inquiry', 'vipInterest' => true, 'package' => $packages[2]],
    ];
}

function hotmess_account_benefits(?array $user): array
{
    $benefits = hotmess_membership_benefits();
    $partnerOffers = hotmess_partner_offers();

    return [
        ['id' => 'user-benefit-1', 'userId' => $user['id'] ?? 0, 'benefitId' => $benefits[0]['id'], 'title' => $benefits[0]['title'], 'code' => $benefits[0]['code'], 'category' => $benefits[0]['category'], 'status' => 'available'],
        ['id' => 'user-benefit-2', 'userId' => $user['id'] ?? 0, 'benefitId' => $benefits[1]['id'], 'title' => $benefits[1]['title'], 'code' => $benefits[1]['code'], 'category' => $benefits[1]['category'], 'status' => 'available'],
        ['id' => 'user-benefit-3', 'userId' => $user['id'] ?? 0, 'benefitId' => $partnerOffers[0]['id'], 'title' => $partnerOffers[0]['title'], 'code' => $partnerOffers[0]['code'], 'category' => 'partner', 'status' => 'redeemable'],
    ];
}

function hotmess_account_preferences(?array $user): array
{
    return [
        'language' => 'Deutsch',
        'notifications' => (bool) ($user['notifications_enabled'] ?? true),
        'eventReminders' => (bool) ($user['event_reminders'] ?? true),
        'hotelUpdates' => (bool) ($user['hotel_updates'] ?? true),
        'partnerOffers' => (bool) ($user['partner_offers'] ?? true),
        'newsletter' => (bool) ($user['newsletter_consent'] ?? true),
        'privacyMode' => (string) ($user['privacy_mode'] ?? 'members_only'),
        'deleteAccountPlaceholder' => 'Request required',
    ];
}

function hotmess_user_ensure_columns(): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;
    hotmess_payments_add_column('users', 'bio', 'TEXT NULL');
    hotmess_payments_add_column('users', 'interests', 'TEXT NULL');
    hotmess_payments_add_column('users', 'preferred_cities', 'TEXT NULL');
    hotmess_payments_add_column('users', 'newsletter_consent', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_payments_add_column('users', 'notifications_enabled', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_payments_add_column('users', 'event_reminders', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_payments_add_column('users', 'hotel_updates', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_payments_add_column('users', 'partner_offers', 'TINYINT(1) NOT NULL DEFAULT 1');
    hotmess_payments_add_column('users', 'privacy_mode', "VARCHAR(50) NOT NULL DEFAULT 'members_only'");
    hotmess_payments_add_column('users', 'onboarding_step', 'TINYINT UNSIGNED NOT NULL DEFAULT 0');
    hotmess_payments_add_column('users', 'approval_note', 'TEXT NULL');
}

function hotmess_profile_save(array $user, array $post, array $files = []): void
{
    hotmess_user_ensure_columns();

    $name = trim((string) ($post['name'] ?? ''));
    $city = trim((string) ($post['city'] ?? ''));
    $birthday = trim((string) ($post['birthday'] ?? ''));
    $bio = trim((string) ($post['bio'] ?? ''));
    $interests = trim((string) ($post['interests'] ?? ''));
    $preferredCities = trim((string) ($post['preferredCities'] ?? ''));
    $newsletter = !empty($post['newsletterConsent']) ? 1 : 0;

    $interestsArr = array_values(array_filter(array_map('trim', explode(',', $interests))));
    $citiesArr = array_values(array_filter(array_map('trim', explode(',', $preferredCities))));

    $profilePhoto = (string) ($user['profile_photo'] ?? '');
    if (!empty($files['profilePhoto']['tmp_name']) && is_uploaded_file($files['profilePhoto']['tmp_name'])) {
        $ext = strtolower((string) pathinfo((string) ($files['profilePhoto']['name'] ?? ''), PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        if (in_array($ext, $allowed, true) && (int) ($files['profilePhoto']['size'] ?? 0) <= 5 * 1024 * 1024) {
            $uploadDir = dirname(__DIR__) . '/uploads/profile-photos/';
            if (!is_dir($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            $filename = 'user-' . (int) $user['id'] . '-' . time() . '.' . $ext;
            if (move_uploaded_file($files['profilePhoto']['tmp_name'], $uploadDir . $filename)) {
                $profilePhoto = '/uploads/profile-photos/' . $filename;
            }
        }
    }

    db()->prepare(
        'UPDATE users SET name=?, city=?, birthday=?, bio=?, interests=?, preferred_cities=?, newsletter_consent=?, profile_photo=? WHERE id=?'
    )->execute([
        $name !== '' ? $name : $user['name'],
        $city,
        $birthday !== '' ? $birthday : null,
        $bio,
        json_encode($interestsArr, JSON_UNESCAPED_UNICODE),
        json_encode($citiesArr, JSON_UNESCAPED_UNICODE),
        $newsletter,
        $profilePhoto,
        (int) $user['id'],
    ]);

    hotmess_account_update_onboarding_step((int) $user['id']);
}

function hotmess_settings_save(array $user, array $post): void
{
    hotmess_user_ensure_columns();
    $allowed = ['members_only', 'public', 'private'];
    $privacyMode = in_array(($post['privacyMode'] ?? ''), $allowed, true) ? $post['privacyMode'] : 'members_only';

    db()->prepare(
        'UPDATE users SET notifications_enabled=?, event_reminders=?, hotel_updates=?, partner_offers=?, newsletter_consent=?, privacy_mode=? WHERE id=?'
    )->execute([
        !empty($post['notifications']) ? 1 : 0,
        !empty($post['eventReminders']) ? 1 : 0,
        !empty($post['hotelUpdates']) ? 1 : 0,
        !empty($post['partnerOffers']) ? 1 : 0,
        !empty($post['newsletter']) ? 1 : 0,
        $privacyMode,
        (int) $user['id'],
    ]);
}

function hotmess_account_onboarding_progress(array $user): array
{
    $steps = [
        'profile' => trim((string) ($user['name'] ?? '')) !== '' && trim((string) ($user['city'] ?? '')) !== '',
        'photo' => trim((string) ($user['profile_photo'] ?? '')) !== '',
        'interests' => !empty(json_decode((string) ($user['interests'] ?? ''), true)),
        'cities' => !empty(json_decode((string) ($user['preferred_cities'] ?? ''), true)),
        'event' => false,
    ];

    try {
        $stmt = db()->prepare('SELECT COUNT(*) FROM platform_user_saved_events WHERE user_id = ?');
        $stmt->execute([(int) $user['id']]);
        $steps['event'] = (int) $stmt->fetchColumn() > 0;
    } catch (Throwable) {
    }

    $done = count(array_filter($steps));
    $total = count($steps);

    return [
        'steps' => $steps,
        'percent' => $total > 0 ? (int) round(($done / $total) * 100) : 0,
        'done' => $done,
        'total' => $total,
        'complete' => $done === $total,
        'labels' => [
            'profile' => 'Name & Stadt',
            'photo' => 'Profilfoto',
            'interests' => 'Interessen',
            'cities' => 'Bevorzugte Städte',
            'event' => 'Erstes Event gespeichert',
        ],
    ];
}

function hotmess_account_update_onboarding_step(int $userId): void
{
    try {
        $stmt = db()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $userData = $stmt->fetch();
        if (!$userData) {
            return;
        }
        $progress = hotmess_account_onboarding_progress($userData);
        db()->prepare('UPDATE users SET onboarding_step = ? WHERE id = ?')
            ->execute([$progress['done'], $userId]);
    } catch (Throwable) {
    }
}

function hotmess_account_data(?array $user): array
{
    $membership = hotmess_account_live_membership($user);

    return [
        'profile' => hotmess_account_profile($user),
        'membership' => $membership,
        'savedEvents' => hotmess_account_saved_events($user),
        'tickets' => hotmess_account_live_tickets($user),
        'hotels' => hotmess_account_hotels($user),
        'packages' => hotmess_account_packages($user),
        'benefits' => hotmess_account_benefits($user),
        'customerProfile' => hotmess_customer_profile_for_user($user),
        'loyaltyTransactions' => hotmess_loyalty_transactions($user),
        'rewards' => hotmess_rewards(),
        'referrals' => hotmess_referrals($user),
        'conciergeProfile' => hotmess_concierge_profile($user),
        'conciergeRecommendations' => hotmess_concierge_recommendations($user),
        'conciergeRequests' => hotmess_concierge_requests($user),
        'loyaltyLevels' => hotmess_loyalty_levels(),
        'preferences' => hotmess_account_preferences($user),
    ];
}

function hotmess_account_live_membership(?array $user): array
{
    $membership = hotmess_user_membership($user);

    if (!$user) {
        return $membership;
    }

    try {
        $live = hotmess_live_user_membership($user);
    } catch (Throwable) {
        $live = null;
    }

    if (!$live) {
        return $membership;
    }

    $tier = hotmess_membership_tier_by_slug((string) $live['tier_slug']) ?: $membership['tier'];

    return [
        'id' => 'membership-live-' . $user['id'],
        'userId' => $user['id'],
        'tierId' => $tier['id'],
        'tier' => $tier,
        'status' => $live['status'],
        'startedAt' => $live['started_at'],
        'renewsAt' => $live['renews_at'] ?? '',
        'stripeSubscriptionId' => $live['stripe_subscription_id'],
        'savedEvents' => $membership['savedEvents'],
        'codes' => $membership['codes'],
    ];
}

function hotmess_account_live_tickets(?array $user): array
{
    if (!$user) {
        return hotmess_account_tickets($user);
    }

    try {
        $liveTickets = hotmess_live_user_tickets((int) $user['id']);
    } catch (Throwable) {
        $liveTickets = [];
    }

    if (!$liveTickets) {
        return hotmess_account_tickets($user);
    }

    return array_map(static fn (array $ticket): array => [
        'id' => 'ticket-live-' . $ticket['id'],
        'userId' => $user['id'],
        'eventId' => $ticket['event_id'],
        'eventName' => $ticket['event_name'],
        'date' => $ticket['purchased_at'],
        'ticketType' => $ticket['ticket_type'],
        'qrCode' => $ticket['qr_code'],
        'ticketNumber' => $ticket['ticket_number'],
        'status' => $ticket['status'],
    ], $liveTickets);
}
