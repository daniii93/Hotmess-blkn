<?php

declare(strict_types=1);

require_once __DIR__ . '/events-data.php';
require_once __DIR__ . '/hotels-data.php';
require_once __DIR__ . '/packages-data.php';
require_once __DIR__ . '/membership-data.php';
require_once __DIR__ . '/app-data.php';
require_once __DIR__ . '/crm-data.php';

function hotmess_concierge_categories(): array
{
    return ['travel', 'hotel', 'package', 'vip', 'event', 'membership', 'general'];
}

function hotmess_prompt_templates(): array
{
    return [
        ['id' => 'prompt-welcome', 'category' => 'general', 'title' => 'Welcome Prompt', 'content' => 'Welcome the guest like a private members club concierge. Ask one precise question and recommend one premium next step.', 'active' => true],
        ['id' => 'prompt-event', 'category' => 'event', 'title' => 'Event Prompt', 'content' => 'Recommend events by city, membership access, ticket status and desired energy. Avoid generic nightlife language.', 'active' => true],
        ['id' => 'prompt-hotel', 'category' => 'hotel', 'title' => 'Hotel Prompt', 'content' => 'Recommend hotel benefits, late checkout, location fit and weekend flow.', 'active' => true],
        ['id' => 'prompt-vip', 'category' => 'vip', 'title' => 'VIP Prompt', 'content' => 'Advise on fast lane, table request, host hotel, concierge and privacy without overpromising.', 'active' => true],
        ['id' => 'prompt-membership', 'category' => 'membership', 'title' => 'Membership Prompt', 'content' => 'Explain Free, Plus and Black based on intent, not discounts.', 'active' => true],
        ['id' => 'prompt-travel', 'category' => 'travel', 'title' => 'Travel Prompt', 'content' => 'Plan a refined city weekend across event, hotel, package, partner place and app reminder.', 'active' => true],
    ];
}

function hotmess_recommend_events(?array $profile = null): array
{
    return array_map(fn (array $event): array => [
        'id' => 'rec-event-' . $event['slug'],
        'type' => 'event',
        'title' => $event['title'],
        'description' => $event['city'] . ' / ' . $event['venue'] . ' / ' . $event['membershipAccess'],
        'relatedId' => $event['id'],
        'href' => '/events/' . $event['slug'],
        'score' => $event['ticketStatus'] === 'few_tickets' ? 94 : 82,
        'cityId' => strtolower($event['city']),
    ], array_slice(hotmess_events(), 0, 3));
}

function hotmess_recommend_hotels(?array $profile = null): array
{
    return array_map(fn (array $hotel): array => [
        'id' => 'rec-hotel-' . $hotel['slug'],
        'type' => 'hotel',
        'title' => $hotel['title'],
        'description' => $hotel['city'] . ' / ' . $hotel['description'],
        'relatedId' => $hotel['id'],
        'href' => '/hotels/' . $hotel['slug'],
        'score' => $hotel['fastLaneActive'] ? 91 : 78,
        'cityId' => strtolower($hotel['city']),
    ], hotmess_hotels());
}

function hotmess_recommend_packages(?array $profile = null): array
{
    return array_map(fn (array $package): array => [
        'id' => 'rec-package-' . $package['slug'],
        'type' => 'package',
        'title' => $package['title'],
        'description' => $package['city'] . ' / ' . $package['packageType'] . ' / ab ' . $package['priceFrom'] . ' EUR',
        'relatedId' => $package['id'],
        'href' => '/packages/' . $package['slug'],
        'score' => $package['packageType'] === 'signature' ? 96 : 84,
        'cityId' => strtolower($package['city']),
    ], array_slice(hotmess_packages(), 0, 4));
}

function hotmess_recommend_benefits(?array $profile = null): array
{
    return array_map(fn (array $benefit): array => [
        'id' => 'rec-benefit-' . $benefit['id'],
        'type' => 'benefit',
        'title' => $benefit['title'],
        'description' => $benefit['description'],
        'relatedId' => $benefit['id'],
        'href' => '/account/benefits',
        'score' => 86,
        'cityId' => 'multi-city',
    ], array_slice(hotmess_membership_benefits(), 0, 3));
}

function hotmess_recommend_community_events(?array $profile = null): array
{
    return [
        ['id' => 'rec-community-pre-drinks', 'type' => 'community', 'title' => 'Passport Pre-Drinks', 'description' => 'Member-led arrival before the main chapter.', 'relatedId' => 'community-predrinks-innsbruck', 'href' => '/community', 'score' => 88, 'cityId' => 'innsbruck'],
        ['id' => 'rec-community-brunch', 'type' => 'community', 'title' => 'HotMess Brunch Circle', 'description' => 'A quieter member moment after the weekend.', 'relatedId' => 'community-brunch-vienna', 'href' => '/community/events', 'score' => 81, 'cityId' => 'vienna'],
    ];
}

function hotmess_recommend_cities(?array $profile = null): array
{
    return [
        ['id' => 'rec-city-innsbruck', 'type' => 'city', 'title' => 'Innsbruck', 'description' => 'Best for private weekend energy, host hotels and Passport access.', 'relatedId' => 'innsbruck', 'href' => '/events?city=Innsbruck', 'score' => 93, 'cityId' => 'innsbruck'],
        ['id' => 'rec-city-dubrovnik', 'type' => 'city', 'title' => 'Dubrovnik', 'description' => 'Best for Signature travel, coastal hospitality and VIP layers.', 'relatedId' => 'dubrovnik', 'href' => '/packages/signature-weekend-adriatic', 'score' => 89, 'cityId' => 'dubrovnik'],
        ['id' => 'rec-city-vienna', 'type' => 'city', 'title' => 'Vienna', 'description' => 'Best for rooftop arrivals, hotel benefits and community brunch.', 'relatedId' => 'vienna', 'href' => '/events/vienna-rooftop-arrival', 'score' => 84, 'cityId' => 'vienna'],
    ];
}

function hotmess_concierge_profile(?array $user = null): array
{
    $customer = hotmess_customer_profile_for_user($user);
    return [
        'id' => 'concierge-profile-' . ($user['id'] ?? 'guest'),
        'userId' => (string) ($user['id'] ?? 'guest'),
        'preferredCities' => ['Innsbruck', 'Vienna', 'Dubrovnik'],
        'membershipTier' => $customer['membership'] ?? 'Free Passport',
        'loyaltyLevel' => $customer['loyaltyLevel'],
        'travelStyle' => 'Private weekend, host hotel, VIP-aware',
    ];
}

function hotmess_concierge_recommendations(?array $user = null): array
{
    $profile = hotmess_concierge_profile($user);
    return [
        'events' => hotmess_recommend_events($profile),
        'hotels' => hotmess_recommend_hotels($profile),
        'packages' => hotmess_recommend_packages($profile),
        'benefits' => hotmess_recommend_benefits($profile),
        'community' => hotmess_recommend_community_events($profile),
        'cities' => hotmess_recommend_cities($profile),
    ];
}

function hotmess_concierge_requests(?array $user = null): array
{
    return [
        ['id' => 'con-req-1', 'userId' => (string) ($user['id'] ?? '1'), 'category' => 'travel', 'message' => 'Plan a VIP weekend around Innsbruck with hotel and fast lane.', 'status' => 'new', 'assignedTo' => 'Concierge Lead', 'createdAt' => '2026-06-02 14:20'],
        ['id' => 'con-req-2', 'userId' => (string) ($user['id'] ?? '1'), 'category' => 'membership', 'message' => 'Should I move from Plus to Black for Signature Weekends?', 'status' => 'in_progress', 'assignedTo' => 'Membership Desk', 'createdAt' => '2026-06-01 18:10'],
    ];
}

function hotmess_concierge_quick_actions(): array
{
    return [
        'Welches Event passt zu mir?',
        'Welches Hotel soll ich buchen?',
        'Welche Stadt soll ich besuchen?',
        'Welches Package ist sinnvoll?',
        'Welche Benefits habe ich?',
        'Welche Community Events gibt es?',
        'Welche Partnerangebote passen zu mir?',
    ];
}
