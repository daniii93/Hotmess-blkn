<?php

declare(strict_types=1);

function hotmess_hotels(): array
{
    return [
        [
            'id' => 'signature-city-stay',
            'title' => 'Signature City Stay',
            'slug' => 'signature-city-stay',
            'city' => 'Innsbruck',
            'address' => 'Innsbruck city center',
            'description' => 'A host-hotel style stay for private arrivals, late checkout requests and Passport-led travel notes.',
            'heroImage' => '/assets/packages.png',
            'galleryImages' => ['/assets/packages.png', '/assets/community-hero.png', '/assets/waitlist.png'],
            'bookingUrl' => '/hotels/signature-city-stay',
            'membershipBenefits' => ['Late checkout request', 'Passport room note', 'Black priority signal'],
            'partnerStatus' => 'active',
            'shuttleActive' => true,
            'fastLaneActive' => false,
            'status' => 'published',
        ],
        [
            'id' => 'late-checkout-vienna',
            'title' => 'Late Checkout Vienna',
            'slug' => 'late-checkout-vienna',
            'city' => 'Vienna',
            'address' => 'Vienna inner district',
            'description' => 'A refined partner stay with member code placeholders and next-day recovery benefits.',
            'heroImage' => '/assets/waitlist.png',
            'galleryImages' => ['/assets/waitlist.png', '/assets/faq.png', '/assets/community-hero.png'],
            'bookingUrl' => '/hotels/late-checkout-vienna',
            'membershipBenefits' => ['Member code', 'Black priority request'],
            'partnerStatus' => 'active',
            'shuttleActive' => false,
            'fastLaneActive' => true,
            'status' => 'published',
        ],
    ];
}

function hotmess_hotel_by_slug(string $slug): ?array
{
    foreach (hotmess_hotels() as $hotel) {
        if ($hotel['slug'] === $slug || $hotel['id'] === $slug) {
            return $hotel;
        }
    }

    return null;
}
