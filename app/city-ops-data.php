<?php

declare(strict_types=1);

function hotmess_city_roles(): array
{
    return ['city_operator', 'city_manager', 'city_ambassador_lead', 'community_lead', 'partner_manager'];
}

function hotmess_city_operators(): array
{
    return [
        ['id' => 'op-vienna', 'cityId' => 'vienna', 'city' => 'Vienna', 'userId' => 'operator-1', 'name' => 'HotMess Vienna Lead', 'role' => 'city_operator', 'status' => 'active', 'startedAt' => '2026-05-01'],
        ['id' => 'op-berlin', 'cityId' => 'berlin', 'city' => 'Berlin', 'userId' => 'operator-2', 'name' => 'Berlin Launch Lead', 'role' => 'city_manager', 'status' => 'candidate', 'startedAt' => '2026-06-01'],
        ['id' => 'op-zurich', 'cityId' => 'zurich', 'city' => 'Zurich', 'userId' => 'operator-3', 'name' => 'Zurich Ambassador Lead', 'role' => 'city_ambassador_lead', 'status' => 'candidate', 'startedAt' => '2026-06-15'],
    ];
}

function hotmess_city_performance(): array
{
    return [
        ['cityId' => 'innsbruck', 'city' => 'Innsbruck', 'members' => 420, 'events' => 4, 'hotels' => 2, 'packages' => 3, 'partners' => 7, 'ambassadors' => 4, 'revenue' => 47640, 'growthScore' => 86, 'communityScore' => 82, 'partnerScore' => 78, 'revenueScore' => 88, 'experienceScore' => 91],
        ['cityId' => 'vienna', 'city' => 'Vienna', 'members' => 310, 'events' => 3, 'hotels' => 2, 'packages' => 2, 'partners' => 5, 'ambassadors' => 3, 'revenue' => 27480, 'growthScore' => 78, 'communityScore' => 75, 'partnerScore' => 72, 'revenueScore' => 74, 'experienceScore' => 84],
        ['cityId' => 'dubrovnik', 'city' => 'Dubrovnik', 'members' => 190, 'events' => 2, 'hotels' => 1, 'packages' => 2, 'partners' => 4, 'ambassadors' => 2, 'revenue' => 32100, 'growthScore' => 81, 'communityScore' => 68, 'partnerScore' => 77, 'revenueScore' => 86, 'experienceScore' => 89],
    ];
}

function hotmess_expansion_markets(): array
{
    return [
        ['id' => 'market-berlin', 'city' => 'Berlin', 'country' => 'Germany', 'priority' => 'high', 'marketPotential' => 94, 'competitionLevel' => 'high', 'status' => 'research'],
        ['id' => 'market-munich', 'city' => 'Munich', 'country' => 'Germany', 'priority' => 'high', 'marketPotential' => 88, 'competitionLevel' => 'medium', 'status' => 'candidate'],
        ['id' => 'market-zurich', 'city' => 'Zurich', 'country' => 'Switzerland', 'priority' => 'high', 'marketPotential' => 86, 'competitionLevel' => 'medium', 'status' => 'candidate'],
        ['id' => 'market-amsterdam', 'city' => 'Amsterdam', 'country' => 'Netherlands', 'priority' => 'medium', 'marketPotential' => 82, 'competitionLevel' => 'high', 'status' => 'watchlist'],
        ['id' => 'market-barcelona', 'city' => 'Barcelona', 'country' => 'Spain', 'priority' => 'medium', 'marketPotential' => 84, 'competitionLevel' => 'high', 'status' => 'watchlist'],
    ];
}

function hotmess_city_launch_checklist(): array
{
    return ['Ambassador gefunden', 'Partner gewonnen', 'Hotelpartner aktiv', 'Event Location aktiv', 'Membership Benefits definiert', 'City Guide erstellt', 'Community Event geplant', 'Sponsoren angesprochen'];
}
