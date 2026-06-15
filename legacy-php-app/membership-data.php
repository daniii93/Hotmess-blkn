<?php

declare(strict_types=1);

function hotmess_membership_tiers(): array
{
    return [
        [
            'id' => 'tier-free',
            'name' => 'Free Passport',
            'slug' => 'free',
            'priceMonthly' => 0,
            'priceYearly' => 0,
            'description' => 'The entry layer for guests who want a HOTMESS profile, reminders, guides and community updates.',
            'benefits' => ['Kostenloses Profil', 'Event Reminder', 'Newsletter', 'App Zugang', 'City Guides', 'Community Updates'],
            'eventBenefits' => ['Event reminders', 'Waitlist signals', 'Public ticket visibility'],
            'hotelBenefits' => ['City hotel notes', 'Partner stay previews'],
            'packageBenefits' => ['Package previews', 'Weekend guide access'],
            'communityBenefits' => ['Community updates', 'Guideline access'],
            'appBenefits' => ['App access prepared', 'Saved content placeholder'],
            'partnerBenefits' => ['Selected public partner offers'],
            'badgeLabel' => 'Free',
            'priority' => 10,
            'status' => 'active',
        ],
        [
            'id' => 'tier-plus',
            'name' => 'Passport Plus',
            'slug' => 'plus',
            'priceMonthly' => 19,
            'priceYearly' => 190,
            'description' => 'A premium recurring membership for early access, hotel benefits, partner codes and community events.',
            'benefits' => ['Early Bird Zugang', 'Exklusive Rabattcodes', 'Hotel Benefits', 'Partner Benefits', 'Community Events', 'Digitale Member Card', 'Bevorzugte Informationen'],
            'eventBenefits' => ['Early bird allocation', 'Preferred event information', 'Few-ticket alerts'],
            'hotelBenefits' => ['Hotel benefit codes', 'Late checkout signals', 'Preferred stay notes'],
            'packageBenefits' => ['Package early info', 'Travel Weekend priority'],
            'communityBenefits' => ['Community event access', 'Member-only updates'],
            'appBenefits' => ['Digital member card', 'Saved events placeholder'],
            'partnerBenefits' => ['Discount codes', 'Welcome drink offers', 'Shopping benefits'],
            'badgeLabel' => 'Plus',
            'priority' => 20,
            'status' => 'active',
        ],
        [
            'id' => 'tier-black',
            'name' => 'Passport Black',
            'slug' => 'black',
            'priceMonthly' => 79,
            'priceYearly' => 790,
            'description' => 'The private club layer for priority booking, VIP upgrades, concierge requests and limited partner access.',
            'benefits' => ['Fast Lane', 'VIP Upgrade Optionen', 'Priority Booking', 'Signature Hotel Vorteile', 'Concierge Anfrage', 'Member-only Events', 'Birthday Benefit', 'Welcome Gift', 'Limitierte Partnerangebote'],
            'eventBenefits' => ['Fast lane', 'VIP upgrade options', 'Priority booking'],
            'hotelBenefits' => ['Signature hotel advantages', 'Preferred allocation', 'Birthday stay benefit placeholder'],
            'packageBenefits' => ['Signature Weekend priority', 'Concierge inquiry', 'Limited package offers'],
            'communityBenefits' => ['Member-only events', 'Private host notes', 'Birthday benefit'],
            'appBenefits' => ['Black member card', 'Priority app signals', 'Concierge placeholder'],
            'partnerBenefits' => ['VIP upgrades', 'Welcome gifts', 'Limited partner offers'],
            'badgeLabel' => 'Black',
            'priority' => 30,
            'status' => 'active',
        ],
    ];
}

function hotmess_membership_benefits(): array
{
    return [
        ['id' => 'benefit-event-early', 'tierId' => 'tier-plus', 'title' => 'Early Bird Access', 'description' => 'Earlier access windows for selected HOTMESS events.', 'category' => 'event', 'partnerId' => null, 'code' => 'PLUS-EARLY', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'redemptionLimit' => 1],
        ['id' => 'benefit-hotel-late', 'tierId' => 'tier-plus', 'title' => 'Hotel Benefit', 'description' => 'Partner hotel late checkout or preferred stay signal.', 'category' => 'hotel', 'partnerId' => 'hotel-partner', 'code' => 'HOTMESSSTAY', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'redemptionLimit' => 2],
        ['id' => 'benefit-black-vip', 'tierId' => 'tier-black', 'title' => 'VIP Upgrade Option', 'description' => 'VIP upgrade request for eligible events.', 'category' => 'event', 'partnerId' => 'vip-sponsor', 'code' => 'BLACKVIP', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'redemptionLimit' => 1],
        ['id' => 'benefit-black-concierge', 'tierId' => 'tier-black', 'title' => 'Concierge Inquiry', 'description' => 'Concierge request placeholder for Signature Weekends.', 'category' => 'package', 'partnerId' => null, 'code' => 'BLACKCONCIERGE', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'redemptionLimit' => 1],
        ['id' => 'benefit-partner-drink', 'tierId' => 'tier-plus', 'title' => 'Welcome Drink', 'description' => 'Selected bar partner welcome drink for member nights.', 'category' => 'partner', 'partnerId' => 'bar-partner', 'code' => 'PLUSDRINK', 'validFrom' => '2026-06-01', 'validUntil' => '2026-09-30', 'redemptionLimit' => 3],
    ];
}

function hotmess_partner_membership_benefits(): array
{
    return [
        ['partnerId' => 'hotel-partner', 'name' => 'Hotel Benefit Partner', 'benefitType' => 'Hotel Benefit', 'targetTiers' => ['plus', 'black'], 'audience' => 'Travel-ready members and Signature guests', 'description' => 'Late checkout, room upgrade signal or stay advantage.', 'placement' => 'Membership benefits, app card and hotel pages', 'usedCount' => 38, 'clicks' => 210, 'leads' => 24, 'upgradeOptions' => ['Black priority placement', 'Signature Weekend pairing']],
        ['partnerId' => 'bar-partner', 'name' => 'Welcome Drink Partner', 'benefitType' => 'Welcome Drink', 'targetTiers' => ['plus', 'black'], 'audience' => 'City Socials and pre-drink members', 'description' => 'Member welcome drink or hosted bar night benefit.', 'placement' => 'Community and membership benefit rows', 'usedCount' => 64, 'clicks' => 188, 'leads' => 31, 'upgradeOptions' => ['Member-only night sponsor', 'App offer boost']],
        ['partnerId' => 'fashion-partner', 'name' => 'Shopping Benefit Partner', 'benefitType' => 'Shopping Benefit', 'targetTiers' => ['plus', 'black'], 'audience' => 'Fashion-led HOTMESS guests', 'description' => 'Private shopping code or member preview.', 'placement' => 'Partner benefits and Passport Plus card', 'usedCount' => 22, 'clicks' => 130, 'leads' => 17, 'upgradeOptions' => ['Black limited offer', 'Gallery story placement']],
        ['partnerId' => 'vip-sponsor', 'name' => 'VIP Upgrade Sponsor', 'benefitType' => 'VIP Upgrade', 'targetTiers' => ['black'], 'audience' => 'High-intent Passport Black members', 'description' => 'VIP upgrade, fast lane or hosted table signal.', 'placement' => 'Passport Black and event VIP cards', 'usedCount' => 14, 'clicks' => 96, 'leads' => 11, 'upgradeOptions' => ['VIP host moment', 'Concierge placement']],
    ];
}

function hotmess_membership_tier_by_slug(string $slug): ?array
{
    foreach (hotmess_membership_tiers() as $tier) {
        if ($tier['slug'] === $slug) {
            return $tier;
        }
    }

    return null;
}

function hotmess_user_membership(?array $user): array
{
    $tierSlug = 'free';

    if ($user && (($user['role'] ?? '') === 'admin' || ($user['status'] ?? '') === 'approved')) {
        $tierSlug = 'plus';
    }

    $tier = hotmess_membership_tier_by_slug($tierSlug) ?: hotmess_membership_tiers()[0];

    return [
        'id' => 'membership-' . ($user['id'] ?? 'guest'),
        'userId' => $user['id'] ?? null,
        'tierId' => $tier['id'],
        'tier' => $tier,
        'status' => $user ? 'active' : 'trialing',
        'startedAt' => '2026-06-01',
        'renewsAt' => '2026-12-01',
        'stripeSubscriptionId' => null,
        'savedEvents' => ['innsbruck-private-weekend', 'vienna-rooftop-arrival'],
        'codes' => ['HOTMESSSTAY', 'PLUSDRINK', 'PLUS-EARLY'],
    ];
}

function hotmess_membership_category_map(array $tier): array
{
    return [
        'Events' => $tier['eventBenefits'],
        'Hotels' => $tier['hotelBenefits'],
        'Packages' => $tier['packageBenefits'],
        'Community' => $tier['communityBenefits'],
        'App' => $tier['appBenefits'],
        'Partnerangebote' => $tier['partnerBenefits'],
    ];
}
