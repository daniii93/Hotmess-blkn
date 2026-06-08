<?php

declare(strict_types=1);

require_once __DIR__ . '/payments.php';

function hotmess_revenue_sources(): array
{
    return ['tickets', 'hotels', 'packages', 'memberships', 'partner_offers', 'sponsoring', 'referrals', 'vip_services', 'concierge'];
}

function hotmess_revenue_transactions(): array
{
    try {
        $live = hotmess_live_revenue_transactions();
        if ($live) {
            return $live;
        }
    } catch (Throwable) {
        // Keep admin usable when payment tables are not installed yet.
    }

    return [
        ['id' => 'rev-ticket-1', 'sourceType' => 'tickets', 'sourceId' => 'hm-innsbruck-2026', 'label' => 'Innsbruck Private Weekend tickets', 'amount' => 18420, 'currency' => 'EUR', 'city' => 'Innsbruck', 'userId' => 'mixed', 'createdAt' => '2026-05-18'],
        ['id' => 'rev-hotel-1', 'sourceType' => 'hotels', 'sourceId' => 'signature-city-stay', 'label' => 'Signature City Stay commission', 'amount' => 6420, 'currency' => 'EUR', 'city' => 'Innsbruck', 'userId' => 'mixed', 'createdAt' => '2026-05-20'],
        ['id' => 'rev-package-1', 'sourceType' => 'packages', 'sourceId' => 'vip-weekend-innsbruck', 'label' => 'VIP Weekend package allocation', 'amount' => 22800, 'currency' => 'EUR', 'city' => 'Innsbruck', 'userId' => 'mixed', 'createdAt' => '2026-05-22'],
        ['id' => 'rev-membership-1', 'sourceType' => 'memberships', 'sourceId' => 'passport-plus', 'label' => 'Passport Plus subscriptions', 'amount' => 11960, 'currency' => 'EUR', 'city' => 'Multi-city', 'userId' => 'mixed', 'createdAt' => '2026-05-25'],
        ['id' => 'rev-partner-1', 'sourceType' => 'partner_offers', 'sourceId' => 'midnight-bar', 'label' => 'Partner offer redemptions', 'amount' => 3820, 'currency' => 'EUR', 'city' => 'Vienna', 'userId' => 'mixed', 'createdAt' => '2026-05-26'],
        ['id' => 'rev-sponsor-1', 'sourceType' => 'sponsoring', 'sourceId' => 'black-room-sponsor', 'label' => 'VIP Area Sponsor placement', 'amount' => 14500, 'currency' => 'EUR', 'city' => 'Milan', 'userId' => 'sponsor', 'createdAt' => '2026-05-28'],
        ['id' => 'rev-referral-1', 'sourceType' => 'referrals', 'sourceId' => 'HOTMESS-BLACK', 'label' => 'Referral conversions', 'amount' => 2450, 'currency' => 'EUR', 'city' => 'Multi-city', 'userId' => 'mixed', 'createdAt' => '2026-05-29'],
        ['id' => 'rev-vip-1', 'sourceType' => 'vip_services', 'sourceId' => 'table-service', 'label' => 'VIP table service requests', 'amount' => 9200, 'currency' => 'EUR', 'city' => 'Dubrovnik', 'userId' => 'mixed', 'createdAt' => '2026-05-30'],
        ['id' => 'rev-concierge-1', 'sourceType' => 'concierge', 'sourceId' => 'signature-weekend-adriatic', 'label' => 'Concierge service retainers', 'amount' => 5100, 'currency' => 'EUR', 'city' => 'Dubrovnik', 'userId' => 'mixed', 'createdAt' => '2026-05-31'],
    ];
}

function hotmess_revenue_kpis(): array
{
    try {
        $live = hotmess_live_revenue_kpis();
        if ((float) $live['totalRevenue'] > 0) {
            return $live;
        }
    } catch (Throwable) {
        // Keep the dashboard readable until live payment tables exist.
    }

    $totals = array_fill_keys(hotmess_revenue_sources(), 0);
    foreach (hotmess_revenue_transactions() as $transaction) {
        $totals[$transaction['sourceType']] += (int) $transaction['amount'];
    }

    return [
        'totalRevenue' => array_sum($totals),
        'tickets' => $totals['tickets'],
        'hotels' => $totals['hotels'],
        'packages' => $totals['packages'],
        'memberships' => $totals['memberships'],
        'partnerOffers' => $totals['partner_offers'],
        'sponsoring' => $totals['sponsoring'],
        'referrals' => $totals['referrals'],
        'vip' => $totals['vip_services'],
        'concierge' => $totals['concierge'],
    ];
}

function hotmess_analytics_kpis(): array
{
    return [
        'registrations' => 1840,
        'activeMembers' => 920,
        'passportPlus' => 318,
        'passportBlack' => 74,
        'eventConversion' => '18.4%',
        'hotelConversion' => '8.9%',
        'packageConversion' => '6.7%',
        'referralConversion' => '14.2%',
        'communityGrowth' => '+22%',
        'lifetimeValue' => 'EUR 486',
        'averageOrderValue' => 'EUR 142',
    ];
}

function hotmess_revenue_reports(): array
{
    return [
        'cityComparison' => [
            ['city' => 'Innsbruck', 'revenue' => 47640, 'growth' => '+18%'],
            ['city' => 'Vienna', 'revenue' => 27480, 'growth' => '+12%'],
            ['city' => 'Dubrovnik', 'revenue' => 32100, 'growth' => '+24%'],
            ['city' => 'Milan', 'revenue' => 23680, 'growth' => '+9%'],
        ],
        'topEvents' => [
            ['title' => 'Innsbruck Private Weekend', 'revenue' => 18420, 'conversion' => '22%'],
            ['title' => 'Adriatic Passport Weekend', 'revenue' => 17100, 'conversion' => '19%'],
            ['title' => 'Milan Fashion After Dark', 'revenue' => 13900, 'conversion' => '16%'],
        ],
        'topPackages' => [
            ['title' => 'VIP Weekend Innsbruck', 'revenue' => 22800, 'conversion' => '7.8%'],
            ['title' => 'Signature Weekend Adriatic', 'revenue' => 19100, 'conversion' => '5.6%'],
            ['title' => 'Travel Weekend Vienna', 'revenue' => 9200, 'conversion' => '8.1%'],
        ],
        'topHotels' => [
            ['title' => 'Signature City Stay', 'revenue' => 6420, 'conversion' => '9.4%'],
            ['title' => 'Late Checkout Vienna', 'revenue' => 3180, 'conversion' => '6.2%'],
        ],
        'topReferrals' => [
            ['code' => 'HOTMESS-BLACK', 'revenue' => 2450, 'conversions' => 7],
            ['code' => 'HOSTCITY', 'revenue' => 1680, 'conversions' => 5],
            ['code' => 'VIPCIRCLE', 'revenue' => 980, 'conversions' => 3],
        ],
    ];
}

function hotmess_sponsor_products(): array
{
    return [
        ['id' => 'sponsor-event', 'name' => 'Event Sponsor', 'placementType' => 'event', 'price' => 4500, 'visibility' => 'Event page, app, onsite mention', 'status' => 'active'],
        ['id' => 'sponsor-city', 'name' => 'City Sponsor', 'placementType' => 'city', 'price' => 12000, 'visibility' => 'City surfaces across website and app', 'status' => 'active'],
        ['id' => 'sponsor-package', 'name' => 'Package Sponsor', 'placementType' => 'package', 'price' => 7800, 'visibility' => 'Package cards and detail placements', 'status' => 'active'],
        ['id' => 'sponsor-membership', 'name' => 'Membership Sponsor', 'placementType' => 'membership', 'price' => 9800, 'visibility' => 'Passport benefits and member cards', 'status' => 'planned'],
        ['id' => 'sponsor-app', 'name' => 'App Sponsor', 'placementType' => 'app', 'price' => 6200, 'visibility' => 'Offer cards, banners and map placement', 'status' => 'active'],
        ['id' => 'sponsor-welcome-bag', 'name' => 'Welcome Bag Sponsor', 'placementType' => 'welcome_bag', 'price' => 3500, 'visibility' => 'Signature and VIP welcome moments', 'status' => 'active'],
        ['id' => 'sponsor-vip-area', 'name' => 'VIP Area Sponsor', 'placementType' => 'vip_area', 'price' => 14500, 'visibility' => 'VIP area, event page and app signal', 'status' => 'sold'],
    ];
}

function hotmess_sponsor_placements(): array
{
    return [
        ['id' => 'sp-1', 'sponsorName' => 'Black Room Sponsor', 'runTime' => '2026-09-01 - 2026-12-31', 'cities' => ['Milan', 'Dubrovnik'], 'events' => ['Milan Fashion After Dark'], 'placementType' => 'VIP Area Sponsor', 'price' => 14500, 'status' => 'sold', 'visibility' => 'VIP area, event page, app'],
        ['id' => 'sp-2', 'sponsorName' => 'Signature Wellness Studio', 'runTime' => '2026-08-01 - 2026-10-31', 'cities' => ['Innsbruck'], 'events' => ['Innsbruck Private Weekend'], 'placementType' => 'Welcome Bag Sponsor', 'price' => 3500, 'status' => 'active', 'visibility' => 'Welcome bag, membership benefit'],
        ['id' => 'sp-3', 'sponsorName' => 'Adriatic Travel House', 'runTime' => '2026-09-15 - 2026-11-30', 'cities' => ['Dubrovnik'], 'events' => ['Adriatic Passport Weekend'], 'placementType' => 'Package Sponsor', 'price' => 7800, 'status' => 'proposal', 'visibility' => 'Package detail, app offer, city guide'],
    ];
}

function hotmess_commission_rules(): array
{
    return [
        ['id' => 'com-hotel', 'type' => 'Hotel Provision', 'percentage' => 10, 'fixedAmount' => null, 'active' => true, 'description' => 'Hotel partner booking commission'],
        ['id' => 'com-package', 'type' => 'Package Provision', 'percentage' => 15, 'fixedAmount' => null, 'active' => true, 'description' => 'Package revenue share'],
        ['id' => 'com-referral', 'type' => 'Referral Provision', 'percentage' => 5, 'fixedAmount' => null, 'active' => true, 'description' => 'Referral conversion commission'],
        ['id' => 'com-ambassador-ticket', 'type' => 'Ambassador Ticket Provision', 'percentage' => null, 'fixedAmount' => 4, 'active' => true, 'description' => 'Fixed payout per ticket sale'],
        ['id' => 'com-partner-share', 'type' => 'Partner Revenue Share', 'percentage' => 12, 'fixedAmount' => null, 'active' => true, 'description' => 'Partner offer revenue share'],
    ];
}

function hotmess_commission_payouts(): array
{
    return [
        ['id' => 'pay-1', 'recipient' => 'Signature City Stay', 'type' => 'Hotel Provision', 'amount' => 642, 'currency' => 'EUR', 'status' => 'pending'],
        ['id' => 'pay-2', 'recipient' => 'City Ambassador Innsbruck', 'type' => 'Ambassador Ticket Provision', 'amount' => 188, 'currency' => 'EUR', 'status' => 'approved'],
        ['id' => 'pay-3', 'recipient' => 'Midnight Bar', 'type' => 'Partner Revenue Share', 'amount' => 458, 'currency' => 'EUR', 'status' => 'scheduled'],
    ];
}

function hotmess_referral_campaigns(): array
{
    return [
        ['id' => 'ref-camp-black', 'name' => 'Black Circle Referral', 'code' => 'HOTMESS-BLACK', 'rewardType' => 'points', 'rewardValue' => 500, 'status' => 'active', 'conversion' => '18.2%'],
        ['id' => 'ref-camp-hotel', 'name' => 'Host Hotel Invite', 'code' => 'HOSTCITY', 'rewardType' => 'hotel_benefit', 'rewardValue' => 1, 'status' => 'active', 'conversion' => '12.4%'],
        ['id' => 'ref-camp-vip', 'name' => 'VIP Circle', 'code' => 'VIPCIRCLE', 'rewardType' => 'fast_lane', 'rewardValue' => 1, 'status' => 'planned', 'conversion' => '0%'],
    ];
}

function hotmess_partner_analytics(): array
{
    return [
        ['partner' => 'Signature City Stay', 'views' => 12840, 'clicks' => 940, 'leads' => 42, 'bookings' => 7, 'redemptions' => 18, 'conversionRate' => '16.6%'],
        ['partner' => 'Midnight Bar', 'views' => 8210, 'clicks' => 610, 'leads' => 31, 'bookings' => 4, 'redemptions' => 22, 'conversionRate' => '12.9%'],
        ['partner' => 'Black Room Sponsor', 'views' => 6120, 'clicks' => 420, 'leads' => 24, 'bookings' => 3, 'redemptions' => 9, 'conversionRate' => '12.5%'],
    ];
}

function hotmess_partner_campaigns(): array
{
    return [
        ['name' => 'Host Hotel Passport', 'surface' => 'Hotels, Packages, App', 'budget' => 'EUR 4,800', 'status' => 'active', 'nextStep' => 'Increase app map placement'],
        ['name' => 'Welcome Drink Referral', 'surface' => 'Community, Membership, App Offers', 'budget' => 'EUR 2,200', 'status' => 'active', 'nextStep' => 'Add Passport Plus code'],
        ['name' => 'VIP Upgrade Signal', 'surface' => 'Events, VIP, Sponsors', 'budget' => 'EUR 6,500', 'status' => 'planned', 'nextStep' => 'Confirm city sponsor package'],
    ];
}
