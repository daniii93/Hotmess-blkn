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
        'interests' => ['Signature Nights', 'Hotels', 'VIP Tables', 'Community Brunch'],
        'preferredCities' => ['Innsbruck', 'Vienna', 'Dubrovnik', 'Milan'],
        'avatarUrl' => $user['profile_photo'] ?? '',
        'newsletterConsent' => true,
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
        'notifications' => true,
        'eventReminders' => true,
        'hotelUpdates' => true,
        'partnerOffers' => true,
        'newsletter' => true,
        'privacyMode' => 'Member visibility',
        'deleteAccountPlaceholder' => 'Request required',
    ];
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
