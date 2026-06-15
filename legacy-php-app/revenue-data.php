<?php

declare(strict_types=1);

require_once __DIR__ . '/payments.php';

function hotmess_revenue_sources(): array
{
    return ['tickets', 'hotels', 'packages', 'memberships', 'partner_offers', 'sponsoring', 'referrals', 'vip_services', 'concierge'];
}

function hotmess_revenue_comparison_source_options(): array
{
    return [
        'all' => 'Alles',
        'ticket' => 'Verkaufte Tickets',
        'hotel_package' => 'Hotelpakete',
        'drink_package' => 'Getränkepakete',
    ];
}

function hotmess_revenue_comparison_ranges(): array
{
    return [
        '7d' => '7 Tage',
        '1m' => '1 Monat',
        '6m' => '6 Monate',
        '12m' => '12 Monate',
        '24m' => '24 Monate',
    ];
}

function hotmess_revenue_normalize_source_type(string $sourceType): string
{
    return match ($sourceType) {
        'tickets', 'ticket' => 'ticket',
        'hotels', 'hotel', 'hotel_package' => 'hotel_package',
        'drink', 'drink_packages', 'drink_package' => 'drink_package',
        'packages', 'package' => 'package',
        'memberships', 'membership' => 'membership',
        'vip_services', 'vip' => 'vip',
        'partner_offers', 'partner' => 'partner',
        default => $sourceType,
    };
}

function hotmess_revenue_comparison_allowed_sources(): array
{
    return ['ticket', 'hotel_package', 'drink_package'];
}

function hotmess_revenue_comparison_selected_sources(array $rawSources): array|string
{
    $allowed = hotmess_revenue_comparison_allowed_sources();
    $rawSources = array_values(array_unique(array_map('strval', $rawSources)));
    if (!$rawSources || in_array('all', $rawSources, true)) {
        return 'all';
    }

    $selected = array_values(array_intersect($allowed, $rawSources));
    return $selected ?: 'all';
}

function hotmess_revenue_comparison_range_meta(string $range): array
{
    $range = array_key_exists($range, hotmess_revenue_comparison_ranges()) ? $range : '1m';
    $now = new DateTimeImmutable('today');

    return match ($range) {
        '7d' => ['range' => '7d', 'label' => '7 Tage', 'start' => $now->modify('-6 days'), 'end' => $now, 'interval' => 'day', 'step' => new DateInterval('P1D')],
        '6m' => ['range' => '6m', 'label' => '6 Monate', 'start' => $now->modify('first day of this month')->modify('-5 months'), 'end' => $now, 'interval' => 'month', 'step' => new DateInterval('P1M')],
        '12m' => ['range' => '12m', 'label' => '12 Monate', 'start' => $now->modify('first day of this month')->modify('-11 months'), 'end' => $now, 'interval' => 'month', 'step' => new DateInterval('P1M')],
        '24m' => ['range' => '24m', 'label' => '24 Monate', 'start' => $now->modify('first day of this month')->modify('-23 months'), 'end' => $now, 'interval' => 'month', 'step' => new DateInterval('P1M')],
        default => ['range' => '1m', 'label' => '1 Monat', 'start' => $now->modify('-29 days'), 'end' => $now, 'interval' => 'day', 'step' => new DateInterval('P1D')],
    };
}

function hotmess_revenue_bucket_key(DateTimeInterface $date, string $interval): string
{
    return $interval === 'month' ? $date->format('Y-m') : $date->format('Y-m-d');
}

function hotmess_revenue_bucket_label(string $bucketKey, string $interval): string
{
    if ($interval === 'month') {
        $date = DateTimeImmutable::createFromFormat('Y-m-d', $bucketKey . '-01');
        return $date ? $date->format('m/Y') : $bucketKey;
    }

    $date = DateTimeImmutable::createFromFormat('Y-m-d', $bucketKey);
    return $date ? $date->format('d.m.Y') : $bucketKey;
}

function hotmess_revenue_event_options(array $events): array
{
    return array_map(static function (array $event): array {
        return [
            'id' => (string) ($event['id'] ?? $event['slug'] ?? ''),
            'slug' => (string) ($event['slug'] ?? $event['id'] ?? ''),
            'title' => (string) ($event['title'] ?? 'Event'),
            'city' => (string) ($event['city'] ?? ''),
            'date' => (string) ($event['startDate'] ?? ''),
        ];
    }, $events);
}

function hotmess_revenue_validate_event_ids(array $rawEventIds, array $events): array
{
    $options = hotmess_revenue_event_options($events);
    $allowed = array_column($options, 'id');
    $selected = array_values(array_unique(array_intersect(array_map('strval', $rawEventIds), $allowed)));
    if (!$selected) {
        $selected = array_slice($allowed, 0, 1);
    }

    return array_slice($selected, 0, 3);
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
        ['id' => 'rev-ticket-1', 'sourceType' => 'tickets', 'sourceId' => 'hm-innsbruck-2026', 'label' => 'Innsbruck Private Weekend tickets', 'amount' => 18420, 'currency' => 'EUR', 'city' => 'Innsbruck', 'userId' => 'mixed', 'createdAt' => '2026-05-18', 'demo' => true],
        ['id' => 'rev-hotel-1', 'sourceType' => 'hotels', 'sourceId' => 'signature-city-stay', 'label' => 'Signature City Stay commission', 'amount' => 6420, 'currency' => 'EUR', 'city' => 'Innsbruck', 'userId' => 'mixed', 'createdAt' => '2026-05-20', 'demo' => true],
        ['id' => 'rev-package-1', 'sourceType' => 'packages', 'sourceId' => 'vip-weekend-innsbruck', 'label' => 'VIP Weekend package allocation', 'amount' => 22800, 'currency' => 'EUR', 'city' => 'Innsbruck', 'userId' => 'mixed', 'createdAt' => '2026-05-22', 'demo' => true],
        ['id' => 'rev-membership-1', 'sourceType' => 'memberships', 'sourceId' => 'passport-plus', 'label' => 'Passport Plus subscriptions', 'amount' => 11960, 'currency' => 'EUR', 'city' => 'Multi-city', 'userId' => 'mixed', 'createdAt' => '2026-05-25', 'demo' => true],
        ['id' => 'rev-partner-1', 'sourceType' => 'partner_offers', 'sourceId' => 'midnight-bar', 'label' => 'Partner offer redemptions', 'amount' => 3820, 'currency' => 'EUR', 'city' => 'Vienna', 'userId' => 'mixed', 'createdAt' => '2026-05-26', 'demo' => true],
        ['id' => 'rev-sponsor-1', 'sourceType' => 'sponsoring', 'sourceId' => 'black-room-sponsor', 'label' => 'VIP Area Sponsor placement', 'amount' => 14500, 'currency' => 'EUR', 'city' => 'Milan', 'userId' => 'sponsor', 'createdAt' => '2026-05-28', 'demo' => true],
        ['id' => 'rev-referral-1', 'sourceType' => 'referrals', 'sourceId' => 'HOTMESS-BLACK', 'label' => 'Referral conversions', 'amount' => 2450, 'currency' => 'EUR', 'city' => 'Multi-city', 'userId' => 'mixed', 'createdAt' => '2026-05-29', 'demo' => true],
        ['id' => 'rev-vip-1', 'sourceType' => 'vip_services', 'sourceId' => 'table-service', 'label' => 'VIP table service requests', 'amount' => 9200, 'currency' => 'EUR', 'city' => 'Dubrovnik', 'userId' => 'mixed', 'createdAt' => '2026-05-30', 'demo' => true],
        ['id' => 'rev-concierge-1', 'sourceType' => 'concierge', 'sourceId' => 'signature-weekend-adriatic', 'label' => 'Concierge service retainers', 'amount' => 5100, 'currency' => 'EUR', 'city' => 'Dubrovnik', 'userId' => 'mixed', 'createdAt' => '2026-05-31', 'demo' => true],
    ];
}

function hotmess_demo_revenue_comparison_transactions(array $events): array
{
    $eventOptions = hotmess_revenue_event_options($events);
    $transactions = [];
    $baseDate = new DateTimeImmutable('2026-06-08');
    $sourceMultipliers = [
        'ticket' => 1.0,
        'hotel_package' => 0.46,
        'drink_package' => 0.22,
        'membership' => 0.18,
        'package' => 0.34,
        'vip' => 0.28,
        'partner' => 0.12,
    ];

    foreach ($eventOptions as $eventIndex => $event) {
        for ($monthsBack = 23; $monthsBack >= 0; $monthsBack--) {
            $monthDate = $baseDate->modify('first day of this month')->modify('-' . $monthsBack . ' months');
            foreach ([3, 10, 17, 24] as $dayOffset) {
                $date = $monthDate->modify('+' . min($dayOffset, 26) . ' days');
                foreach ($sourceMultipliers as $sourceType => $multiplier) {
                    $seed = ($eventIndex + 2) * 730 + (24 - $monthsBack) * 91 + $dayOffset * 17;
                    $amount = round(($seed * $multiplier) % 3900 + (420 * ($eventIndex + 1) * $multiplier), 2);
                    $transactions[] = [
                        'id' => 'demo-' . $event['id'] . '-' . $sourceType . '-' . $date->format('Ymd') . '-' . $dayOffset,
                        'eventId' => $event['id'],
                        'sourceType' => $sourceType,
                        'sourceId' => $event['id'],
                        'label' => $event['title'],
                        'amount' => $amount,
                        'currency' => 'EUR',
                        'city' => $event['city'],
                        'userId' => 'demo',
                        'paymentStatus' => 'paid',
                        'createdAt' => $date->format('Y-m-d'),
                        'demo' => true,
                    ];
                }
            }
        }
    }

    return $transactions;
}

function hotmess_revenue_comparison_transactions(array $events): array
{
    $eventIds = array_column(hotmess_revenue_event_options($events), 'id');
    $eventSlugs = array_column(hotmess_revenue_event_options($events), 'slug', 'id');
    $transactions = [];
    $hasLiveEventRevenue = false;

    foreach (hotmess_revenue_transactions() as $transaction) {
        $sourceId = (string) ($transaction['sourceId'] ?? $transaction['source_id'] ?? '');
        $eventId = (string) ($transaction['eventId'] ?? $transaction['event_id'] ?? $sourceId);
        foreach ($eventSlugs as $candidateId => $candidateSlug) {
            if ($sourceId === $candidateSlug || $eventId === $candidateSlug) {
                $eventId = (string) $candidateId;
                break;
            }
        }
        if (!in_array($eventId, $eventIds, true)) {
            continue;
        }

        $paymentStatus = (string) ($transaction['paymentStatus'] ?? $transaction['payment_status'] ?? 'paid');
        if ($paymentStatus !== 'paid' && $paymentStatus !== 'refunded') {
            continue;
        }

        $amount = (float) ($transaction['amount'] ?? 0);
        if ($paymentStatus === 'refunded' && $amount > 0) {
            $amount *= -1;
        }

        $isDemoTransaction = (bool) ($transaction['demo'] ?? false);
        $transactions[] = [
            'id' => (string) ($transaction['id'] ?? ''),
            'eventId' => $eventId,
            'sourceType' => hotmess_revenue_normalize_source_type((string) ($transaction['sourceType'] ?? $transaction['source_type'] ?? '')),
            'sourceId' => $sourceId,
            'label' => (string) ($transaction['label'] ?? ''),
            'amount' => $amount,
            'currency' => (string) ($transaction['currency'] ?? 'EUR'),
            'city' => (string) ($transaction['city'] ?? $transaction['city_id'] ?? ''),
            'userId' => (string) ($transaction['userId'] ?? $transaction['user_id'] ?? ''),
            'paymentStatus' => $paymentStatus,
            'createdAt' => (string) ($transaction['createdAt'] ?? $transaction['created_at'] ?? ''),
            'demo' => $isDemoTransaction,
        ];
        if (!$isDemoTransaction) {
            $hasLiveEventRevenue = true;
        }
    }

    if (!$hasLiveEventRevenue) {
        return hotmess_demo_revenue_comparison_transactions($events);
    }

    return $transactions;
}

function hotmess_revenue_source_matches(string $sourceType, array|string $sourceTypes): bool
{
    if ($sourceTypes === 'all') {
        return true;
    }

    return in_array(hotmess_revenue_normalize_source_type($sourceType), $sourceTypes, true);
}

function getRevenueBreakdownForTooltip(string $eventId, string $dateBucket, array|string $sourceTypes, string $range = '1m', ?array $events = null): array
{
    $events = $events ?: (function_exists('hotmess_events') ? hotmess_events() : []);
    $rangeMeta = hotmess_revenue_comparison_range_meta($range);
    $breakdown = ['ticket' => 0.0, 'hotel_package' => 0.0, 'drink_package' => 0.0, 'other' => 0.0, 'total' => 0.0];
    foreach (hotmess_revenue_comparison_transactions($events) as $transaction) {
        if ((string) $transaction['eventId'] !== $eventId) {
            continue;
        }
        $createdAt = DateTimeImmutable::createFromFormat('Y-m-d', substr((string) $transaction['createdAt'], 0, 10));
        if (!$createdAt || hotmess_revenue_bucket_key($createdAt, $rangeMeta['interval']) !== $dateBucket) {
            continue;
        }
        if (!hotmess_revenue_source_matches((string) $transaction['sourceType'], $sourceTypes)) {
            continue;
        }

        $normalized = hotmess_revenue_normalize_source_type((string) $transaction['sourceType']);
        $amount = (float) $transaction['amount'];
        if (array_key_exists($normalized, $breakdown)) {
            $breakdown[$normalized] += $amount;
        } else {
            $breakdown['other'] += $amount;
        }
        $breakdown['total'] += $amount;
    }

    return $breakdown;
}

function getRevenueForEventBySourceTypes(string $eventId, string $range, array|string $sourceTypes, ?array $events = null): float
{
    $events = $events ?: (function_exists('hotmess_events') ? hotmess_events() : []);
    $rangeMeta = hotmess_revenue_comparison_range_meta($range);
    $total = 0.0;
    foreach (hotmess_revenue_comparison_transactions($events) as $transaction) {
        if ((string) $transaction['eventId'] !== $eventId) {
            continue;
        }
        $createdAt = DateTimeImmutable::createFromFormat('Y-m-d', substr((string) $transaction['createdAt'], 0, 10));
        if (!$createdAt || $createdAt < $rangeMeta['start'] || $createdAt > $rangeMeta['end']->setTime(23, 59, 59)) {
            continue;
        }
        if (!hotmess_revenue_source_matches((string) $transaction['sourceType'], $sourceTypes)) {
            continue;
        }
        $total += (float) $transaction['amount'];
    }

    return $total;
}

function getRevenueTotalsBySourceTypes(string $eventId, array|string $sourceTypes, string $range, ?array $events = null): array
{
    $events = $events ?: (function_exists('hotmess_events') ? hotmess_events() : []);
    $rangeMeta = hotmess_revenue_comparison_range_meta($range);
    $totals = ['ticket' => 0.0, 'hotel_package' => 0.0, 'drink_package' => 0.0, 'other' => 0.0, 'total' => 0.0];

    foreach (hotmess_revenue_comparison_transactions($events) as $transaction) {
        if ((string) $transaction['eventId'] !== $eventId) {
            continue;
        }
        $createdAt = DateTimeImmutable::createFromFormat('Y-m-d', substr((string) $transaction['createdAt'], 0, 10));
        if (!$createdAt || $createdAt < $rangeMeta['start'] || $createdAt > $rangeMeta['end']->setTime(23, 59, 59)) {
            continue;
        }
        if (!hotmess_revenue_source_matches((string) $transaction['sourceType'], $sourceTypes)) {
            continue;
        }
        $normalized = hotmess_revenue_normalize_source_type((string) $transaction['sourceType']);
        $amount = (float) $transaction['amount'];
        if (array_key_exists($normalized, $totals)) {
            $totals[$normalized] += $amount;
        } else {
            $totals['other'] += $amount;
        }
        $totals['total'] += $amount;
    }

    return $totals;
}

function getRevenueComparisonSeries(array $eventIds, string $range, array|string $sourceTypes, ?array $events = null): array
{
    $events = $events ?: (function_exists('hotmess_events') ? hotmess_events() : []);
    $eventOptions = hotmess_revenue_event_options($events);
    $eventsById = [];
    foreach ($eventOptions as $event) {
        $eventsById[$event['id']] = $event;
    }

    $rangeMeta = hotmess_revenue_comparison_range_meta($range);
    $buckets = [];
    for ($cursor = $rangeMeta['start']; $cursor <= $rangeMeta['end']; $cursor = $cursor->add($rangeMeta['step'])) {
        $key = hotmess_revenue_bucket_key($cursor, $rangeMeta['interval']);
        $buckets[$key] = ['key' => $key, 'label' => hotmess_revenue_bucket_label($key, $rangeMeta['interval'])];
    }

    $series = [];
    foreach (array_slice($eventIds, 0, 3) as $eventId) {
        $points = [];
        foreach ($buckets as $bucket) {
            $breakdown = getRevenueBreakdownForTooltip((string) $eventId, $bucket['key'], $sourceTypes, $range, $events);
            $points[] = [
                'bucket' => $bucket['key'],
                'label' => $bucket['label'],
                'amount' => $breakdown['total'],
                'breakdown' => $breakdown,
            ];
        }
        $series[] = [
            'event' => $eventsById[$eventId] ?? ['id' => $eventId, 'title' => $eventId, 'city' => '', 'date' => ''],
            'points' => $points,
            'total' => array_sum(array_column($points, 'amount')),
        ];
    }

    return [
        'range' => $rangeMeta,
        'sourceTypes' => $sourceTypes,
        'series' => $series,
        'demo' => !empty(hotmess_revenue_comparison_transactions($events)[0]['demo']),
    ];
}

function hotmess_revenue_comparison_kpis(array $eventIds, array|string $sourceTypes, ?array $events = null): array
{
    $ranges = [
        'today' => ['label' => 'Umsatz heute', 'range' => '7d'],
        '7d' => ['label' => 'Umsatz 7 Tage', 'range' => '7d'],
        '1m' => ['label' => 'Umsatz 1 Monat', 'range' => '1m'],
        '6m' => ['label' => 'Umsatz 6 Monate', 'range' => '6m'],
        '12m' => ['label' => 'Gesamtumsatz 12 Monate', 'range' => '12m'],
        '24m' => ['label' => 'Gesamtumsatz 24 Monate', 'range' => '24m'],
    ];
    $events = $events ?: (function_exists('hotmess_events') ? hotmess_events() : []);
    $kpis = [];
    foreach ($ranges as $key => $config) {
        $amount = 0.0;
        if ($key === 'today') {
            $today = (new DateTimeImmutable('today'))->format('Y-m-d');
            foreach ($eventIds as $eventId) {
                $amount += getRevenueBreakdownForTooltip((string) $eventId, $today, $sourceTypes, '7d', $events)['total'];
            }
        } else {
            foreach ($eventIds as $eventId) {
                $amount += getRevenueForEventBySourceTypes((string) $eventId, $config['range'], $sourceTypes, $events);
            }
        }
        $kpis[] = ['label' => $config['label'], 'amount' => $amount];
    }

    return $kpis;
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
