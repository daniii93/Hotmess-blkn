<?php

declare(strict_types=1);

function hotmess_partners(): array
{
    return [
        [
            'id' => 'hotel-partner',
            'name' => 'Signature Hotel Partner',
            'slug' => 'signature-hotel-partner',
            'category' => 'Hotels',
            'city' => 'Vienna',
            'description' => 'Premium hotel visibility for travel-ready HOTMESS guests, Signature Weekends and Passport benefits.',
            'logo' => 'SHP',
            'heroImage' => '/assets/packages.png',
            'websiteUrl' => 'https://example.com',
            'contactName' => 'Hotel Partnerships',
            'contactEmail' => 'hotel-partner@example.com',
            'partnerType' => 'signature',
            'visibilityLevel' => 'Signature',
            'activePlacements' => ['Website Placement', 'App Placement', 'Package Placement', 'Membership Placement'],
            'offers' => ['Late checkout signal', 'Signature stay request', 'Passport hotel benefit'],
            'assignedEvents' => ['hm-innsbruck-2026', 'hm-vienna-rooftop-2026'],
            'assignedHotels' => ['signature-city-stay', 'late-checkout-partner'],
            'assignedPackages' => ['pkg-travel-vienna-2026', 'pkg-signature-adriatic-2026'],
            'membershipBenefits' => ['HOTMESSSTAY', 'Black priority stay request'],
            'appPlacements' => ['Hotel Banner Placement', 'City Guide hotel card'],
            'notes' => 'High priority partner for hotel and Signature Weekend flows.',
            'status' => 'active',
        ],
        [
            'id' => 'bar-partner',
            'name' => 'Private Bar Partner',
            'slug' => 'private-bar-partner',
            'category' => 'Bars',
            'city' => 'Innsbruck',
            'description' => 'Welcome drink, partner bar nights and community pre-drink placement for selected members.',
            'logo' => 'PBP',
            'heroImage' => '/assets/waitlist.png',
            'websiteUrl' => 'https://example.com',
            'contactName' => 'Bar Host',
            'contactEmail' => 'bar-partner@example.com',
            'partnerType' => 'premium',
            'visibilityLevel' => 'Premium',
            'activePlacements' => ['Community Placement', 'App Placement', 'Membership Placement'],
            'offers' => ['Welcome Drink', 'Partner Bar Night', 'Member-only table'],
            'assignedEvents' => ['hm-innsbruck-2026'],
            'assignedHotels' => [],
            'assignedPackages' => ['pkg-basic-innsbruck-2026'],
            'membershipBenefits' => ['PLUSDRINK'],
            'appPlacements' => ['Offer Card Placement', 'Map Placement'],
            'notes' => 'Strong fit for community and city guide surfaces.',
            'status' => 'active',
        ],
        [
            'id' => 'fashion-partner',
            'name' => 'Fashion / Shop Partner',
            'slug' => 'fashion-shop-partner',
            'category' => 'Fashion / Shops',
            'city' => 'Milan',
            'description' => 'Private shopping benefits, campaign visibility and Black member limited offers.',
            'logo' => 'FSP',
            'heroImage' => '/assets/faq.png',
            'websiteUrl' => 'https://example.com',
            'contactName' => 'Retail Partner',
            'contactEmail' => 'fashion-partner@example.com',
            'partnerType' => 'premium',
            'visibilityLevel' => 'Premium',
            'activePlacements' => ['Website Placement', 'Membership Placement', 'App Placement'],
            'offers' => ['Shopping Benefit', 'Private preview', 'Member-only code'],
            'assignedEvents' => ['hm-milan-2026'],
            'assignedHotels' => [],
            'assignedPackages' => ['pkg-basic-innsbruck-2026'],
            'membershipBenefits' => ['HMSTYLE'],
            'appPlacements' => ['Offer card', 'Saved benefit'],
            'notes' => 'Fashion-led audience, campaign-friendly placement.',
            'status' => 'lead',
        ],
        [
            'id' => 'shuttle-partner',
            'name' => 'Shuttle / Transport Partner',
            'slug' => 'shuttle-transport-partner',
            'category' => 'Shuttle / Transport',
            'city' => 'Dubrovnik',
            'description' => 'Transfer options, shuttle notes and travel route placement for HotMess Weekends.',
            'logo' => 'STP',
            'heroImage' => '/assets/community-hero.png',
            'websiteUrl' => 'https://example.com',
            'contactName' => 'Travel Ops',
            'contactEmail' => 'shuttle-partner@example.com',
            'partnerType' => 'standard',
            'visibilityLevel' => 'Travel',
            'activePlacements' => ['Package Placement', 'App Placement'],
            'offers' => ['Transfer option', 'Shuttle route note'],
            'assignedEvents' => ['hm-dubrovnik-2026'],
            'assignedHotels' => [],
            'assignedPackages' => ['pkg-signature-adriatic-2026'],
            'membershipBenefits' => [],
            'appPlacements' => ['City Guide shuttle card', 'Map route note'],
            'notes' => 'Best used in travel and Signature Weekend paths.',
            'status' => 'active',
        ],
        [
            'id' => 'vip-sponsor',
            'name' => 'VIP Sponsor',
            'slug' => 'vip-sponsor',
            'category' => 'VIP Sponsors',
            'city' => 'Innsbruck',
            'description' => 'VIP upgrade options, hosted moments, fast lane and Black member visibility.',
            'logo' => 'VIP',
            'heroImage' => '/assets/packages.png',
            'websiteUrl' => 'https://example.com',
            'contactName' => 'Sponsor Lead',
            'contactEmail' => 'vip-sponsor@example.com',
            'partnerType' => 'signature',
            'visibilityLevel' => 'Black / VIP',
            'activePlacements' => ['Event Placement', 'Membership Placement', 'App Placement'],
            'offers' => ['VIP Upgrade', 'Hosted table signal', 'Fast Lane Branding'],
            'assignedEvents' => ['hm-innsbruck-2026'],
            'assignedHotels' => [],
            'assignedPackages' => ['pkg-vip-innsbruck-2026', 'pkg-signature-adriatic-2026'],
            'membershipBenefits' => ['BLACKVIP'],
            'appPlacements' => ['VIP Upgrade Placement', 'Member Card Placement'],
            'notes' => 'Premium sponsor layer for high-intent members.',
            'status' => 'active',
        ],
        [
            'id' => 'welcome-sponsor',
            'name' => 'Welcome Bag Sponsor',
            'slug' => 'welcome-bag-sponsor',
            'category' => 'Welcome Bag Sponsors',
            'city' => 'International',
            'description' => 'Welcome gifts, premium samples and Signature Weekend sponsor moments.',
            'logo' => 'WBS',
            'heroImage' => '/assets/waitlist.png',
            'websiteUrl' => 'https://example.com',
            'contactName' => 'Brand Partnerships',
            'contactEmail' => 'welcome-sponsor@example.com',
            'partnerType' => 'premium',
            'visibilityLevel' => 'Package / Gift',
            'activePlacements' => ['Package Placement', 'Event Placement', 'Website Placement'],
            'offers' => ['Welcome Gift', 'Goodie Bag', 'Birthday Benefit'],
            'assignedEvents' => ['hm-vienna-rooftop-2026'],
            'assignedHotels' => [],
            'assignedPackages' => ['pkg-signature-adriatic-2026'],
            'membershipBenefits' => ['Birthday benefit placeholder'],
            'appPlacements' => ['Saved benefit', 'Offer card'],
            'notes' => 'Strong brand sampling fit without cheap giveaway optics.',
            'status' => 'paused',
        ],
    ];
}

function hotmess_partner_offers(): array
{
    return [
        ['id' => 'offer-stay', 'partnerId' => 'hotel-partner', 'title' => 'Late Checkout Signal', 'description' => 'Hotel benefit for Plus and Black members.', 'code' => 'HOTMESSSTAY', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'tierRequired' => 'plus', 'city' => 'Vienna', 'status' => 'active'],
        ['id' => 'offer-drink', 'partnerId' => 'bar-partner', 'title' => 'Welcome Drink', 'description' => 'Member welcome drink for selected partner nights.', 'code' => 'PLUSDRINK', 'validFrom' => '2026-06-01', 'validUntil' => '2026-09-30', 'tierRequired' => 'plus', 'city' => 'Innsbruck', 'status' => 'active'],
        ['id' => 'offer-vip', 'partnerId' => 'vip-sponsor', 'title' => 'VIP Upgrade Request', 'description' => 'Black member VIP upgrade request placeholder.', 'code' => 'BLACKVIP', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'tierRequired' => 'black', 'city' => 'Innsbruck', 'status' => 'active'],
    ];
}

function hotmess_partner_placements(): array
{
    return [
        ['id' => 'placement-website', 'partnerId' => 'hotel-partner', 'placementType' => 'website', 'relatedId' => 'partners', 'visibilityLevel' => 'Partner profile, hotel block, event page', 'startDate' => '2026-06-01', 'endDate' => '2026-12-31', 'status' => 'active'],
        ['id' => 'placement-app', 'partnerId' => 'bar-partner', 'placementType' => 'app', 'relatedId' => 'offer-welcome-drink', 'visibilityLevel' => 'Offer card, map placement, code', 'startDate' => '2026-06-01', 'endDate' => '2026-09-30', 'status' => 'active'],
        ['id' => 'placement-event', 'partnerId' => 'vip-sponsor', 'placementType' => 'event', 'relatedId' => 'hm-innsbruck-2026', 'visibilityLevel' => 'VIP Area, Fast Lane Branding, event sponsor row', 'startDate' => '2026-07-01', 'endDate' => '2026-07-20', 'status' => 'active'],
        ['id' => 'placement-package', 'partnerId' => 'welcome-sponsor', 'placementType' => 'package', 'relatedId' => 'pkg-signature-adriatic-2026', 'visibilityLevel' => 'Welcome Bag and Signature package card', 'startDate' => '2026-08-01', 'endDate' => '2026-09-14', 'status' => 'draft'],
        ['id' => 'placement-membership', 'partnerId' => 'fashion-partner', 'placementType' => 'membership', 'relatedId' => 'tier-plus', 'visibilityLevel' => 'Plus and Black partner benefit', 'startDate' => '2026-09-01', 'endDate' => '2026-10-31', 'status' => 'draft'],
    ];
}

function hotmess_partner_applications(): array
{
    return [
        ['id' => 'application-1', 'companyName' => 'Private Wellness Studio', 'contactName' => 'Wellness Lead', 'email' => 'wellness@example.com', 'phone' => '+43 000 000', 'website' => 'https://example.com', 'city' => 'Vienna', 'category' => 'Wellness', 'interests' => ['Packages', 'Membership', 'App'], 'budgetRange' => '2k-5k', 'message' => 'Interested in Signature Weekend and Black member benefit placement.', 'status' => 'new'],
        ['id' => 'application-2', 'companyName' => 'Boutique Restaurant', 'contactName' => 'Restaurant Host', 'email' => 'restaurant@example.com', 'phone' => '+43 111 111', 'website' => 'https://example.com', 'city' => 'Innsbruck', 'category' => 'Restaurants', 'interests' => ['Community', 'Packages'], 'budgetRange' => '1k-2k', 'message' => 'Can host brunch and community dinner formats.', 'status' => 'contacted'],
    ];
}

function hotmess_partner_metrics(): array
{
    return [
        ['id' => 'metric-hotel', 'partnerId' => 'hotel-partner', 'placementId' => 'placement-website', 'views' => 3200, 'clicks' => 280, 'leads' => 34, 'redemptions' => 12],
        ['id' => 'metric-bar', 'partnerId' => 'bar-partner', 'placementId' => 'placement-app', 'views' => 1800, 'clicks' => 188, 'leads' => 31, 'redemptions' => 64],
        ['id' => 'metric-vip', 'partnerId' => 'vip-sponsor', 'placementId' => 'placement-event', 'views' => 1400, 'clicks' => 126, 'leads' => 16, 'redemptions' => 8],
    ];
}

function hotmess_partner_categories(): array
{
    return ['Hotels', 'Bars', 'Clubs', 'Restaurants', 'Fashion / Shops', 'Travel', 'Shuttle / Transport', 'Wellness', 'Lifestyle Brands', 'VIP Sponsors', 'Welcome Bag Sponsors'];
}

function hotmess_partners_by_category(string $category): array
{
    return array_values(array_filter(hotmess_partners(), fn (array $partner): bool => $partner['category'] === $category));
}
