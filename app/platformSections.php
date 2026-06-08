<?php

declare(strict_types=1);

function platform_sections(): array
{
    return [
        'events' => [
            'title' => 'Events',
            'slug' => 'events',
            'description' => 'Kuratierte HOTMESS Nächte, Reiseziele und private Erlebnisse mit bewusst geführtem Zugang.',
            'customerBenefits' => ['Curated guest list', 'Premium event storytelling', 'Member-first access'],
            'adminFeatures' => ['Event calendar', 'Capacity planning', 'Guest approval workflow'],
            'partnerBenefits' => ['Event placement', 'Referral visibility', 'Hospitality packages'],
            'ctaLabel' => 'Events entdecken',
            'href' => '/events',
        ],
        'tickets' => [
            'title' => 'Tickets',
            'slug' => 'tickets',
            'description' => 'Geschützter Ticketzugang für freigegebene Mitglieder mit vorbereiteter Partner- und Referral-Struktur.',
            'customerBenefits' => ['Member-only purchase', 'Clear ticket tiers', 'Personal order overview'],
            'adminFeatures' => ['Sales monitoring', 'Ticket types', 'Referral attribution'],
            'partnerBenefits' => ['Trackable codes', 'Commission reporting', 'QR-ready links'],
            'ctaLabel' => 'Tickets ansehen',
            'href' => '/tickets',
        ],
        'hotels' => [
            'title' => 'Hotels & Reisen',
            'slug' => 'hotels',
            'description' => 'Selected hotels, stays and travel routes for guests who treat the weekend as a full experience.',
            'customerBenefits' => ['Hotel shortlists', 'Travel guidance', 'Destination concierge'],
            'adminFeatures' => ['Hotel inventory', 'Room package notes', 'Destination content'],
            'partnerBenefits' => ['Hotel profiles', 'Offer placement', 'Premium guest demand'],
            'ctaLabel' => 'Hotels entdecken',
            'href' => '/hotels',
        ],
        'packages' => [
            'title' => 'Weekends',
            'slug' => 'packages',
            'description' => 'Bundled access, hotel, table and travel experiences for premium guests and groups.',
            'customerBenefits' => ['Bundled planning', 'Group options', 'VIP experience layers'],
            'adminFeatures' => ['Package builder', 'Availability rules', 'Upsell management'],
            'partnerBenefits' => ['Bundled offers', 'Sponsor inclusion', 'Higher-value bookings'],
            'ctaLabel' => 'Weekends entdecken',
            'href' => '/packages',
        ],
        'travel' => [
            'title' => 'Reisen',
            'slug' => 'travel',
            'description' => 'Destination guidance, arrival planning and mobility partnerships for HOTMESS weekends.',
            'customerBenefits' => ['Arrival guidance', 'Destination planning', 'Concierge-ready travel notes'],
            'adminFeatures' => ['Route content', 'Travel partner inventory', 'Guest communication'],
            'partnerBenefits' => ['Mobility offers', 'Destination placement', 'Travel demand signals'],
            'ctaLabel' => 'Reise planen',
            'href' => '/travel',
        ],
        'community' => [
            'title' => 'Community',
            'slug' => 'community',
            'description' => 'A controlled member environment built around trust, presence and shared nights that stay.',
            'customerBenefits' => ['Verified member circle', 'Private chat access', 'Profile visibility'],
            'adminFeatures' => ['Member review', 'Moderation signals', 'Community insights'],
            'partnerBenefits' => ['Qualified audience', 'Community-led activations', 'Sponsor trust'],
            'ctaLabel' => 'Community entdecken',
            'href' => '/community',
        ],
        'membership' => [
            'title' => 'Passport',
            'slug' => 'membership',
            'description' => 'The access layer for guests, tastemakers and future tiers of HOTMESS loyalty.',
            'customerBenefits' => ['Access status', 'Priority opportunities', 'Member profile'],
            'adminFeatures' => ['Tier control', 'Approvals', 'Benefit management'],
            'partnerBenefits' => ['Tier-based offers', 'Member targeting', 'Loyalty collaborations'],
            'ctaLabel' => 'Zugang entdecken',
            'href' => '/membership',
        ],
        'app' => [
            'title' => 'App',
            'slug' => 'app',
            'description' => 'The future mobile layer for tickets, chat, travel, membership and partner offers.',
            'customerBenefits' => ['Mobile account', 'Event reminders', 'Saved experiences'],
            'adminFeatures' => ['Operational views', 'Push-ready journeys', 'Member support'],
            'partnerBenefits' => ['Offer surfaces', 'In-app attribution', 'Sponsor moments'],
            'ctaLabel' => 'App ansehen',
            'href' => '/app',
        ],
        'partners' => [
            'title' => 'Partner',
            'slug' => 'partners',
            'description' => 'A premium partner layer for hotels, sponsors, promoters and travel collaborators.',
            'customerBenefits' => ['Trusted collaborations', 'Better weekend planning', 'Curated offers'],
            'adminFeatures' => ['Partner tiers', 'Sponsor assets', 'Sales dashboards'],
            'partnerBenefits' => ['Brand visibility', 'Referral tools', 'Premium audience access'],
            'ctaLabel' => 'Partner werden',
            'href' => '/partners',
        ],
        'gallery' => [
            'title' => 'Galerie',
            'slug' => 'gallery',
            'description' => 'Editorial visual archives for event memories, hotels, destinations and brand stories.',
            'customerBenefits' => ['Event memories', 'Destination mood', 'Visual proof of atmosphere'],
            'adminFeatures' => ['Media curation', 'Gallery moderation', 'Campaign archives'],
            'partnerBenefits' => ['Visual placement', 'Co-branded albums', 'Sponsor documentation'],
            'ctaLabel' => 'Galerie ansehen',
            'href' => '/gallery',
        ],
        'account' => [
            'title' => 'Konto',
            'slug' => 'account',
            'description' => 'The member cockpit for status, profile, tickets, chat and future travel preferences.',
            'customerBenefits' => ['Profile control', 'Waitlist status', 'Ticket and chat access'],
            'adminFeatures' => ['Identity signals', 'Member history', 'Support context'],
            'partnerBenefits' => ['Referral continuity', 'Preference signals', 'Offer eligibility'],
            'ctaLabel' => 'Konto öffnen',
            'href' => '/account',
        ],
        'admin' => [
            'title' => 'Admin',
            'slug' => 'admin',
            'description' => 'The operational layer for members, events, sales, messages, partners and future travel products.',
            'customerBenefits' => ['Faster approvals', 'Clearer operations', 'Better service quality'],
            'adminFeatures' => ['Member approvals', 'Sales insights', 'Partner operations'],
            'partnerBenefits' => ['Reliable reporting', 'Managed placements', 'Clear activation workflow'],
            'ctaLabel' => 'Admin öffnen',
            'href' => '/admin',
        ],
    ];
}

function platform_section(string $slug): ?array
{
    $sections = platform_sections();

    return $sections[$slug] ?? null;
}

function platform_nav_items(): array
{
    $sections = platform_sections();

    return [
        $sections['events'],
        $sections['tickets'],
        $sections['hotels'],
        $sections['packages'],
        $sections['community'],
        $sections['membership'],
        $sections['app'],
        $sections['partners'],
        $sections['gallery'],
        $sections['account'],
        $sections['admin'],
    ];
}
